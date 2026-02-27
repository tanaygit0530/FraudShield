-- RUN THIS IN SUPABASE SQL EDITOR TO FIX THE PERSISTENCE ISSUE

-- 1. Enable RLS on the cases table (if not already enabled)
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- 2. Create the UPDATE policy for the anon key 
DROP POLICY IF EXISTS "Allow anon update on cases" ON cases;
CREATE POLICY "Allow anon update on cases" ON cases FOR UPDATE USING (true) WITH CHECK (true);

-- 3. Ensure SELECT is also allowed
DROP POLICY IF EXISTS "Allow anon select on cases" ON cases;
CREATE POLICY "Allow anon select on cases" ON cases FOR SELECT USING (true);

-- 4. Create Audit Logs Table if missing
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES public.cases(id),
    action TEXT NOT NULL,
    status TEXT DEFAULT 'SUCCESS',
    admin_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon select on audit_logs" ON audit_logs;
CREATE POLICY "Allow anon select on audit_logs" ON audit_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert on audit_logs" ON audit_logs;
CREATE POLICY "Allow anon insert on audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- 6. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE cases;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
