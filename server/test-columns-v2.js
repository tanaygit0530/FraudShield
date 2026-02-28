const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'server/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkColumns() {
  console.log('Inserting dummy row to audit_logs...');
  const { data: cData } = await supabase.from('cases').select('id').limit(1);
  if (!cData || cData.length === 0) {
      console.log('No cases found, cannot insert audit log.');
      return;
  }
  
  // Try to insert just the case_id, let defaults handle the rest
  const { data: insData, error: insError } = await supabase.from('audit_logs').insert([{
      case_id: cData[0].id,
      action: 'SYSTEM_DIAGNOSTIC'
  }]).select();
  
  if (insError) {
      console.error('Insert failed:', insError.message);
  } else {
      console.log('Insert success! Columns:', Object.keys(insData[0]));
  }
}

checkColumns();
