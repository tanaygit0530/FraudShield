const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCases() {
  const { data, error } = await supabase.from('cases').select('id, status, amount');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Cases in DB:', data);
  
  const { data: analytics, error: aError } = await supabase.from('cases').select('status, amount, frozen_amount');
  console.log('Raw Analytics:', analytics);
}

checkCases();
