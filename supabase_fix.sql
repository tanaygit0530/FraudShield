-- RUN THIS IN SUPABASE SQL EDITOR TO FIX THE PERSISTENCE ISSUE

-- 1. Enable RLS on the cases table (if not already enabled)
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- 2. Create the UPDATE policy for the anon key 
-- This allows the server (using the anon key) to update case statuses.
CREATE POLICY "Allow anon update on cases" ON cases
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 3. Ensure SELECT is also allowed
CREATE POLICY "Allow anon select on cases" ON cases
FOR SELECT
USING (true);

-- 4. Enable Realtime for the cases table
ALTER PUBLICATION supabase_realtime ADD TABLE cases;
