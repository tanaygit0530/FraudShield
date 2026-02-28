const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'server/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name_val: 'audit_logs' });
  // If rpc fails, we can just try to select one row
  if (error) {
    console.log('RPC failed, trying select * limit 1');
    const { data: selectData, error: selectError } = await supabase.from('audit_logs').select('*').limit(1);
    if (selectError) {
      console.error('Select error:', selectError);
    } else {
      console.log('Audit Log Row keys:', selectData.length > 0 ? Object.keys(selectData[0]) : 'No rows');
    }
  } else {
    console.log('Columns:', data);
  }
}

checkColumns();
