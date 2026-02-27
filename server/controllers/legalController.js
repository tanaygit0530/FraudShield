const supabase = require('../config/supabase');
const transporter = require('../config/mailer');
const { createPDF } = require('../utils/pdfGenerator');

exports.downloadLegalPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const { pdfBytes, hash } = await createPDF(id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Lien_Request_${id.slice(0, 8)}.pdf`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generateAndSendLegalPDF = async (req, res) => {
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
};
