const supabase = require('../config/supabase');
const genAI = require('../config/gemini');
const { encrypt } = require('../utils/encryption');
const fs = require('fs-extra');

const ALLOWED_TRANSITIONS = {
  'INGESTED': ['FREEZE_SENT'],
  'FREEZE_SENT': ['BANK_REVIEW'],
  'BANK_REVIEW': ['FREEZE_CONFIRMED', 'PARTIALLY_FROZEN', 'REJECTED'],
  'FREEZE_CONFIRMED': ['ESCALATED'],
  'PARTIALLY_FROZEN': ['ESCALATED'],
  'ESCALATED': ['FUNDS_CREDITED'],
  'REJECTED': [],
  'FUNDS_CREDITED': []
};

exports.getCases = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCaseIntelligence = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: caseData, error } = await supabase.from('cases').select('*').eq('id', id).single();
    if (error) throw error;

    const payload = caseData.payload || {};
    let rail = 'NEFT/IMPS';
    if (payload.beneficiary_vpa && payload.beneficiary_vpa.includes('@')) rail = 'UPI';
    else if (payload.utr && payload.utr.length === 12 && /^\d+$/.test(payload.utr)) rail = 'UPI/IMPS';

    const { count } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .neq('id', id)
      .filter('payload->>beneficiary_vpa', 'eq', payload.beneficiary_vpa);

    const ageInMinutes = (new Date() - new Date(caseData.created_at)) / (1000 * 60);
    let recoveryProbability = Math.max(10, 100 - (ageInMinutes * 0.5));
    
    // Recovery Logic adjustments
    if (['FREEZE_CONFIRMED', 'FUNDS_CREDITED'].includes(caseData.status)) recoveryProbability = 100;
    else if (caseData.status === 'PARTIALLY_FROZEN' && caseData.frozen_amount) {
      recoveryProbability = Math.min(100, (parseFloat(caseData.frozen_amount) / parseFloat(caseData.amount)) * 100);
    } else if (caseData.status === 'REJECTED') recoveryProbability = 0;

    const states = [
      'INGESTED', 'FREEZE_SENT', 'BANK_REVIEW', 'FREEZE_CONFIRMED', 
      'PARTIALLY_FROZEN', 'REJECTED', 'ESCALATED', 'FUNDS_CREDITED'
    ];

    const institutional_visibility = [
      { name: 'Victim Bank', status: ageInMinutes > 2 ? 'COMPLETED' : 'PENDING' },
      { name: 'Beneficiary Bank', status: caseData.status === 'BANK_REVIEW' ? 'IN_PROGRESS' : (states.indexOf(caseData.status) > 2 ? 'COMPLETED' : 'AWAITING') },
      { name: 'NPCI', status: ageInMinutes > 5 ? 'COMPLETED' : 'PENDING' },
      { name: 'Ombudsman', status: caseData.status === 'ESCALATED' ? 'INVESTIGATING' : 'IDLE' }
    ];

    res.json({
      rail,
      rail_speed: rail === 'UPI' ? 'Instant (< 1s)' : 'T+2 hours',
      bank_detected: payload.bank_name || 'Detected via UTR',
      risk_score: (caseData.legitimacy_score > 70 ? 20 : 60) + (count > 0 ? 30 : 0),
      recovery_probability: Math.round(recoveryProbability),
      previously_reported: count > 0,
      report_count: count,
      recovery_window_mins: Math.max(0, 30 - Math.round(ageInMinutes)),
      current_status: caseData.status,
      frozen_amount: caseData.frozen_amount || 0,
      states,
      institutional_visibility,
      case_health: (ageInMinutes > 60) ? 'RED' : (ageInMinutes > 30 ? 'YELLOW' : 'GREEN')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.ingestOCR = async (req, res) => {
  try {
    if (!req.file) throw new Error('No file provided');
    const fileData = await fs.readFile(req.file.path);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Act as a financial fraud investigator. Extract fields: txn_id, amount, utr, beneficiary_vpa, bank_name, incident_date. Return valid JSON only. Add a legitimacy_score (0-100).";
    const result = await model.generateContent([prompt, { inlineData: { data: fileData.toString('base64'), mimeType: req.file.mimetype } }]);
    const extractedData = JSON.parse(result.response.text().match(/\{[\s\S]*\}/)[0]);
    await fs.remove(req.file.path);
    res.json({ extractedData });
  } catch (err) {
    res.status(500).json({ error: 'AI Processing Failed', details: err.message });
  }
};

exports.createCase = async (req, res) => {
  try {
    const { payload } = req.body;
    const protectedPayload = { ...payload, utr: encrypt(payload.utr), beneficiary_vpa: encrypt(payload.beneficiary_vpa) };
    const { data, error } = await supabase.from('cases').insert([{ 
      amount: parseFloat(payload.amount),
      status: 'FREEZE_SENT',
      case_origin: req.body.origin || 'MANUAL',
      payload: protectedPayload,
      legitimacy_score: payload.legitimacy_score || 50
    }]).select();
    if (error) throw error;
    await supabase.from('audit_logs').insert([{ case_id: data[0].id, action: 'AUTOMATIC_FREEZE_INITIATION', status: 'SUCCESS' }]);
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: newState, frozen_amount, officer_name, total_balance } = req.body;
    
    // 1. Fetch Current State
    const { data: caseItem, error: fetchErr } = await supabase.from('cases').select('status').eq('id', id).single();
    if (fetchErr) throw fetchErr;

    // 2. Validate Transition
    const currentState = caseItem.status;
    if (!ALLOWED_TRANSITIONS[currentState]?.includes(newState)) {
      return res.status(400).json({ error: `Invalid transition from ${currentState} to ${newState}` });
    }

    // 3. Update Status
    const updatePayload = { status: newState, updated_at: new Date() };
    if (frozen_amount !== undefined) updatePayload.frozen_amount = parseFloat(frozen_amount);
    if (total_balance !== undefined) updatePayload.total_balance = parseFloat(total_balance);

    const { data, error } = await supabase.from('cases').update(updatePayload).eq('id', id).select();
    if (error) throw error;

    await supabase.from('audit_logs').insert([{
      case_id: id,
      action: `STATUS_CHANGE_${newState}`,
      status: 'SUCCESS',
      metadata: { admin_name: officer_name || 'SYSTEM', frozen_val: frozen_amount || 0 }
    }]);

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.escalateCase = async (req, res) => {
  // This is now redundant since updateCaseStatus handles it, but keeping it for compatibility if needed, 
  // though we should probably redirect its logic to use updateCaseStatus validation.
  return exports.updateCaseStatus({ params: { id: req.params.id }, body: { status: 'ESCALATED' } }, res);
};
