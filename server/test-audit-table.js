const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'server/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkAuditLogsTable() {
  try {
    const { data, error } = await supabase.from('audit_logs').select('*').limit(1);
    if (error) {
      console.log('Error selecting from audit_logs:', error.message);
      if (error.message.includes('not exist')) {
          console.log('The table audit_logs DOES NOT EXIST.');
      }
    } else {
      console.log('Table audit_logs exists.');
      if (data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
      } else {
        console.log('Table is empty. Cannot determine columns via select *.');
      }
    }
  } catch (err) {
    console.error('Fatal check error:', err);
  }
}

checkAuditLogsTable();
