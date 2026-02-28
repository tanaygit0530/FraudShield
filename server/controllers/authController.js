const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

exports.generateOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const logEntry = `\n-------------------------------------------\n[AUTH] DIRECT_LOG_TRIGGERED for: ${phone}\n[AUTH] GENERATED_OTP: ${otp} <<<<<<<<<<<<<<\n-------------------------------------------\n`;
    console.log(logEntry.trim());
    fs.appendFileSync(path.join(__dirname, '..', 'server.log'), logEntry);

    const { error } = await supabase.from('otp_codes').insert([{ 
      phone, 
      code: otp, 
      expires_at: new Date(Date.now() + 5*60*1000) 
    }]);

    if (error) {
      console.error('[AUTH_DB_ERROR]', error.message);
    }

    res.json({ status: 'SENT' });
  } catch (err) {
    console.error('[AUTH_CRITICAL_FAIL]', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { phone, code } = req.body;
  const { data } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('phone', phone)
    .eq('code', code)
    .limit(1);

  if (data && data.length > 0) {
    res.json({ status: 'VERIFIED' });
  } else {
    res.status(400).json({ error: 'Invalid or expired OTP' });
  }
};
