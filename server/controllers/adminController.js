const supabase = require('../config/supabase');

exports.getAnalytics = async (req, res) => {
  try {
    const { data: rawCases, error } = await supabase.from('cases').select('status, amount, frozen_amount');
    if (error) throw error;

    const cases = rawCases || [];
    const stats = {
      total_cases: cases.length,
      full_freeze: cases.filter(c => c.status === 'FREEZE_CONFIRMED').length,
      partial_freeze: cases.filter(c => c.status === 'PARTIALLY_FROZEN').length,
      rejected: cases.filter(c => c.status === 'REJECTED').length,
      total_recovered: cases.reduce((sum, c) => sum + (c.frozen_amount || 0), 0)
    };

    console.log(`[ANALYTICS] Summary: ${stats.total_cases} cases, ${stats.total_recovered} recovered.`);
    res.json(stats);
  } catch (err) {
    console.error('[ANALYTICS_ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, cases(amount)')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    console.log(`[AUDIT] Yielded ${data ? data.length : 0} logs.`);
    res.json(data || []);
  } catch (err) {
    console.error('[AUDIT_ERROR]', err);
    res.status(500).json({ error: err.message });
  }
};
