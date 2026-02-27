const supabase = require('../config/supabase');

exports.generateOTP = async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[AUTH] REALTIME OTP for ${phone}: ${otp}`);

  await supabase.from('otp_codes').insert([{ 
    phone, 
    code: otp, 
    expires_at: new Date(Date.now() + 5*60*1000) 
  }]);
  res.json({ status: 'SENT' });
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
