require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5001;

// Multer Setup
const upload = multer({ dest: 'uploads/' });

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Gemini Setup (Stable)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

app.get('/api/cases', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cases/:id/intelligence', async (req, res) => {
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

    // 4. State Machine Logic (Simulated Progression based on time for demo, but database backed)
    const states = [
      'CREATED', 'VERIFIED', 'ROUTED', 'ACK_PENDING', 'ACK_RECEIVED', 
      'UNDER_BANK_REVIEW', 'LIEN_REQUESTED', 'PARTIALLY_FROZEN', 
      'FREEZE_CONFIRMED', 'REVERSAL_IN_PROGRESS', 'FUNDS_CREDITED', 
      'ESCALATED', 'CLOSED'
    ];
    
    // For demo/simulated realism, we'll progress the state if it's still 'CREATED'
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
    const sla_remaining = Math.max(0, 30 - Math.round(ageInMinutes % 30)); // Cycle every 30 mins for demo

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
      email_parsing_active: ageInMinutes < 60 // Simulated active parsing for first hour
    });

  } catch (err) {
    console.error('Intel Error:', err);
    res.status(500).json({ error: err.message });
  }
});
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');
const IV_LENGTH = 16; 

function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text || !text.includes(':')) return text;
  try {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error('Decryption Error:', err);
    return 'ENCRYPTION_ERROR';
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// --- Routes ---

app.post('/api/ingest/ocr', upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) throw new Error('No file provided');
    const fileData = await fs.readFile(req.file.path);

    console.log('--- Calling Gemini 1.5 Flash (OCR) ---');
    
    // Explicitly using the model identifier that works across all tiers
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
    console.log('Raw Result:', responseText);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    await fs.remove(req.file.path);
    res.json({ extractedData });
  } catch (err) {
    console.error('OCR CRITICAL ERROR:', err.message);
    res.status(500).json({ error: 'AI Processing Failed', details: err.message });
  }
});

app.get('/api/cases', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cases', async (req, res) => {
  try {
    const { victim_id, payload } = req.body;
    console.log('--- Creating New Fraud Case ---');

    // Protect sensitive data with AES-256
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

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    // Attempt Audit Log (Optional/Background)
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
});

app.post('/api/otp/generate', async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[AUTH] REALTIME OTP for ${phone}: ${otp}`);

  await supabase.from('otp_codes').insert([{ phone, code: otp, expires_at: new Date(Date.now() + 5*60*1000) }]);
  res.json({ status: 'SENT' });
});

app.post('/api/otp/verify', async (req, res) => {
  const { phone, code } = req.body;
  const { data } = await supabase.from('otp_codes').select('*').eq('phone', phone).eq('code', code).limit(1);
  if (data && data.length > 0) res.json({ status: 'VERIFIED' });
  else res.status(400).json({ error: 'Invalid' });
});

app.post('/api/cases/:id/escalate', async (req, res) => {
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
});

async function createPDF(caseId, institution = 'Beneficiary Bank') {
  // 1. Fetch Case Data
  const { data: caseData, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (caseError) throw caseError;

  const payload = caseData.payload || {};
  const utr = decrypt(payload.utr);
  const vpa = decrypt(payload.beneficiary_vpa);

  // 2. Generate PDF using pdf-lib
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Watermark
  page.drawText('FRAUDSHIELD OFFICIAL', {
    x: 150, y: 400, size: 40, font: boldFont,
    color: rgb(0.9, 0.9, 0.9), opacity: 0.2, rotate: { type: 'degrees', angle: 45 }
  });

  page.drawText('LEGAL LIEN MARKING REQUEST', { x: 50, y: height - 50, size: 18, font: boldFont, color: rgb(0, 0.1, 0.4) });
  page.drawText(`Date: ${new Date().toLocaleString()}`, { x: 50, y: height - 80, size: 10, font });
  page.drawText(`Case ID: ${caseId}`, { x: 50, y: height - 95, size: 10, font });

  const content = [
    `To: The Nodal Officer, ${institution}`,
    `Subject: Urgent Lien Marking Request for Fraudulent Transaction`,
    ``,
    `As per RBI Circular RBI/2021-22/75 on Customer Protection, we hereby report a`,
    `confirmed fraudulent transaction and request immediate lien marking on the`,
    `following beneficiary account:`,
    ``,
    `Beneficiary VPA/Account: ${vpa}`,
    `Transaction UTR: ${utr}`,
    `Amount: INR ${caseData.amount.toLocaleString('en-IN')}`,
    `Incident Timestamp: ${caseData.created_at}`,
    ``,
    `The transaction has been analyzed by the FraudShield FIU system and flagged`,
    `with a high risk score. Under the 'Golden Hour' protocol, we request you to`,
    `freeze/lien the specified amount immediately to prevent further siphoning.`,
    ``,
    `This is an automated request generated by the FraudShield Intelligence Center.`,
    `Please acknowledge receipt of this request immediately via return email.`
  ];

  let yOffset = height - 150;
  content.forEach(line => {
    page.drawText(line, { x: 50, y: yOffset, size: 11, font: line.startsWith('Beneficiary') || line.startsWith('Transaction') ? boldFont : font });
    yOffset -= 18;
  });

  const tempPdfBytes = await pdfDoc.save();
  const hash = crypto.createHash('sha256').update(tempPdfBytes).digest('hex');
  page.drawText(`Document Integrity Hash: ${hash}`, { x: 50, y: 50, size: 8, font });
  
  return { 
    pdfBytes: await pdfDoc.save(), 
    hash, 
    caseData 
  };
}

app.get('/api/cases/:id/download-legal', async (req, res) => {
  try {
    const { id } = req.params;
    const { pdfBytes, hash } = await createPDF(id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Lien_Request_${id.slice(0, 8)}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/generate-legal', async (req, res) => {
  try {
    const { case_id, institution = 'Beneficiary Bank' } = req.body;
    const { pdfBytes, hash, caseData } = await createPDF(case_id, institution);

    // 1. Store Metadata in Supabase
    const { data: docData, error: docError } = await supabase
      .from('legal_documents')
      .insert([{
        case_id: case_id,
        document_hash: hash,
        pdf_url: `generated_${case_id.slice(0, 8)}.pdf`
      }])
      .select();

    if (docError) console.error('Doc Log Error:', docError);

    // 2. Send via Email
    const mailOptions = {
      from: '"FraudShield FIU" <fiu@fraudshield.gov.in>',
      to: 'nodal@bank-compliance.com',
      subject: `[URGENT] Lien Marking Request - CASE ${case_id.slice(0, 8)}`,
      text: `Urgent legal document attached for Case ${case_id}. Integrity Hash: ${hash}`,
      attachments: [{
        filename: `Lien_Request_${case_id.slice(0, 8)}.pdf`,
        content: Buffer.from(pdfBytes)
      }]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email Sent:', info.messageId);

    // 3. Log Dispatch
    await supabase.from('dispatch_logs').insert([{
      case_id: case_id,
      institution: institution,
      smtp_message_id: info.messageId,
      status: 'SENT'
    }]);

    res.json({ 
      status: 'SUCCESS', 
      messageId: info.messageId, 
      hash: hash
    });
  } catch (err) {
    console.error('Legal PDF CRITICAL ERROR:', err.message);
    res.status(500).json({ error: 'PDF Automation Failed', details: err.message });
  }
});

app.patch('/api/cases/:id/status', async (req, res) => {
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

    if (error) {
      console.error('[DATABASE_ERROR] Update Failed:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn(`[RLS_ALERT] Update attempted but 0 rows affected for Case ${id}. This likely means an RLS Policy is missing.`);
      return res.status(403).json({ 
        error: 'Update rejected by database policies.',
        details: 'Check if an UPDATE policy exists for the anon key on the cases table.'
      });
    }

    // Log the audit event
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
});

app.get('/api/admin/analytics', async (req, res) => {
  try {
    const { data: cases, error } = await supabase.from('cases').select('status, amount, frozen_amount');
    if (error) throw error;

    const stats = {
      total_cases: cases.length,
      full_freeze: cases.filter(c => c.status === 'FREEZE_CONFIRMED').length,
      partial_freeze: cases.filter(c => c.status === 'PARTIALLY_FROZEN').length,
      rejected: cases.filter(c => c.status === 'REJECTED').length,
      total_recovered: cases.reduce((sum, c) => sum + (c.frozen_amount || 0), 0)
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/audit-logs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, cases(amount)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`FraudShield backend running on port ${PORT}`));
