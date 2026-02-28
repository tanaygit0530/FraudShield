import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eezyneacvoaegcbadvyt.supabase.co';
const supabaseKey = 'sb_publishable_BvZo61Db8Lw95gbG7aZO1A_zA3DhA4V';

export const supabase = createClient(supabaseUrl, supabaseKey);
