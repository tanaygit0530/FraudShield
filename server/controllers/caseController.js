const supabase = require('../config/supabase');
const genAI = require('../config/gemini');
const { encrypt } = require('../utils/encryption');
const fs = require('fs-extra');

exports.getCases = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    console.log(`[GET_CASES] Yielded ${data ? data.length : 0} records.`);
    res.json(data || []);
  } catch (err) {
    console.error('[GET_CASES_ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getCaseIntelligence = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Fetch Case
    const { data: caseData, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // 2. Rail Identification Logic
    const payload = caseData.payload || {};
    let rail = 'NEFT/IMPS';
    if (payload.beneficiary_vpa && payload.beneficiary_vpa.includes('@')) {
      rail = 'UPI';
    } else if (payload.utr && payload.utr.length === 12 && /^\d+$/.test(payload.utr)) {
      rail = 'UPI/IMPS';
    }

    // 3. Repeat Offender Check
    const { count } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .neq('id', id)
      .filter('payload->>beneficiary_vpa', 'eq', payload.beneficiary_vpa);

    // 4. Dynamic Risk & Recovery Probability
    const createdAt = new Date(caseData.created_at);
    const now = new Date();
    const ageInMinutes = (now - createdAt) / (1000 * 60);
    
    // Golden Hour is 60 mins. Probability drops after that.
    let recoveryProbability = 100 - (ageInMinutes * 0.5); 
    if (recoveryProbability < 10) recoveryProbability = 10;
    
    let riskScore = (caseData.legitimacy_score > 70 ? 20 : 60) + (count > 0 ? 30 : 0);
    if (riskScore > 100) riskScore = 95;

    // 4. State Machine Logic
    const states = [
      'CREATED', 'VERIFIED', 'ROUTED', 'ACK_PENDING', 'ACK_RECEIVED', 
      'UNDER_BANK_REVIEW', 'LIEN_REQUESTED', 'PARTIALLY_FROZEN', 
      'FREEZE_CONFIRMED', 'REVERSAL_IN_PROGRESS', 'FUNDS_CREDITED', 
      'ESCALATED', 'CLOSED'
    ];
    
    let currentStatus = caseData.status;
    const currentIdx = states.indexOf(currentStatus);

    if (currentIdx <= states.indexOf('CREATED')) {
      if (ageInMinutes > 10) currentStatus = 'ROUTED';
      if (ageInMinutes > 20) currentStatus = 'ACK_RECEIVED';
      if (ageInMinutes > 30) currentStatus = 'UNDER_BANK_REVIEW';
    }

    // Dynamic Recovery Logic
    if (currentStatus === 'FREEZE_CONFIRMED') recoveryProbability = 100;
    if (currentStatus === 'PARTIALLY_FROZEN' && caseData.frozen_amount) {
      recoveryProbability = Math.min(100, (caseData.frozen_amount / caseData.amount) * 100);
    }
    if (currentStatus === 'FUNDS_CREDITED') recoveryProbability = 100;

    // 5. Institutional Visibility
    const institutional_visibility = [
      { name: 'Victim Bank', status: ageInMinutes > 2 ? 'COMPLETED' : 'PENDING' },
      { name: 'Beneficiary Bank', status: currentStatus === 'UNDER_BANK_REVIEW' ? 'IN_PROGRESS' : (states.indexOf(currentStatus) > 5 ? 'COMPLETED' : 'AWAITING') },
      { name: 'NPCI', status: ageInMinutes > 5 ? 'COMPLETED' : 'PENDING' },
      { name: 'Ombudsman', status: currentStatus === 'ESCALATED' ? 'INVESTIGATING' : 'IDLE' }
    ];

    // 6. SLA Metrics
    const sla_remaining = Math.max(0, 30 - Math.round(ageInMinutes % 30)); 

    // 7. Case Health
    let caseHealth = 'GREEN';
    if (riskScore > 70 || ageInMinutes > 60) caseHealth = 'YELLOW';
    if (riskScore > 90 || ageInMinutes > 120) caseHealth = 'RED';

    console.log(`[INTEL] Case: ${id}, Status: ${currentStatus}, Age: ${Math.round(ageInMinutes)}m`);

    res.json({
      rail,
      rail_speed: rail === 'UPI' ? 'Instant (< 1s)' : 'T+2 hours',
      bank_detected: payload.bank_name || 'Detected via UTR',
      risk_score: riskScore,
      recovery_probability: Math.round(recoveryProbability),
      previously_reported: count > 0,
      report_count: count,
      recovery_window_mins: Math.max(0, 120 - Math.round(ageInMinutes)),
      current_status: currentStatus,
      frozen_amount: caseData.frozen_amount || 0,
      states: states,
      institutional_visibility,
      sla_label: 'Beneficiary Bank Response',
      sla_remaining_mins: sla_remaining,
      case_health: caseHealth,
      email_parsing_active: ageInMinutes < 60 
    });

  } catch (err) {
    console.error('Intel Error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.ingestOCR = async (req, res) => {
  try {
    if (!req.file) throw new Error('No file provided');
    const fileData = await fs.readFile(req.file.path);

    console.log('--- Calling Gemini 1.5 Flash (OCR) ---');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = "Act as a financial fraud investigator. Extract fields: txn_id, amount, utr, beneficiary_vpa, bank_name, incident_date. Return valid JSON only. Add a legitimacy_score (0-100).";

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: fileData.toString('base64'),
          mimeType: req.file.mimetype
        }
      }
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    await fs.remove(req.file.path);
    res.json({ extractedData });
  } catch (err) {
    console.error('OCR CRITICAL ERROR:', err.message);
    res.status(500).json({ error: 'AI Processing Failed', details: err.message });
  }
};

exports.createCase = async (req, res) => {
  try {
    const { victim_id, payload } = req.body;
    console.log('--- Creating New Fraud Case ---');

    const protectedPayload = {
      ...payload,
      utr: encrypt(payload.utr),
      beneficiary_vpa: encrypt(payload.beneficiary_vpa)
    };

    const { data, error } = await supabase
      .from('cases')
      .insert([{ 
        amount: parseFloat(payload.amount),
        status: 'CREATED',
        case_origin: req.body.origin || 'MANUAL',
        payload: protectedPayload,
        legitimacy_score: payload.legitimacy_score || 50
      }])
      .select();

    if (error) throw error;

    supabase.from('audit_logs').insert([{ 
      case_id: data[0].id, 
      action: 'INGESTION_COMPLETE', 
      status: 'SUCCESS' 
    }]).then(() => console.log('Audit Logged'));

    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Submission Failed:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.escalateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('cases')
      .update({ status: 'ESCALATED' })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ message: 'Case Escalated to FIU/Ombudsman', data: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, frozen_amount, officer_name, total_balance } = req.body;
    
    console.log(`--- [ADMIN] Updating Case ${id} to ${status} ---`);

    const updatePayload = { status };
    if (frozen_amount !== undefined) updatePayload.frozen_amount = frozen_amount;
    if (total_balance !== undefined) updatePayload.total_balance = total_balance;

    const { data, error } = await supabase
      .from('cases')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(403).json({ 
        error: 'Update rejected by database policies.',
        details: 'Check if an UPDATE policy exists for the anon key on the cases table.'
      });
    }

    await supabase.from('audit_logs').insert([{
      case_id: id,
      action: `BANK_ACTION_${status}`,
      status: 'SUCCESS',
      admin_name: officer_name || 'SYSTEM'
    }]);

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
