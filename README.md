# FraudShield
1️⃣ Clone the Repository
git clone https://github.com/tanaygit0530/FraudShield.git
2️⃣ Backend Setup (Express + Node)
cd server
npm install
npm run dev
3️⃣ Frontend Setup (React)
cd client
npm install
npm run dev
📦 Environment Variables:
PORT=5001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_url
GEMINI_API_KEY=your_gemini_key
ENCRYPTION_KEY=your_encrytion_key
SMTP_HOST=your_smpt_hostlink
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
📜 FraudShield Operational Guide
🛡️ Phase 1: Victim Reporting & Ingestion (Intake)
Access the Portal: Navigate to the homepage and click "Report Fraud".
Intelligence Upload (OCR):
Upload a screenshot of your transaction (UPI screen or SMS).
Our Gemini 1.5 Flash AI will automatically parse the UTR, Amount, Beneficiary VPA, and Bank Name in real-time.
Identity Verification: Enter your mobile number to receive a secure OTP. Verify your session to initialize the shadow-tracing protocol.
Final Submission: Review the AI-extracted data, add any missing details, and submit. The system immediately calculates a Legitimacy Score and starts the Golden Hour Timer.
📊 Phase 2: Victim Recovery Dashboard (Live Tracking)
Real-time Telemetry: Once submitted, you are redirected to your personal recovery command center.
Monitor the Timeline: Watch as the status moves from INGESTED to ROUTED and BANK_REVIEW in real-time.
Recovery Probability: Track the live Recovery Coefficient. As the fraud is reported faster (within the "Golden Hour"), your probability stays in the High Recovery (Green) zone.
Institutional Monitoring: View the Visibility Panel to see which bank nodes (Victim Bank, NPCI, Ombudsman) have acknowledged your case.
🏛️ Phase 3: B2B Triage Terminal (Admin Console)
Secure Gate Access: Navigate to /admin. Enter your Officer Credentials and select your Role (e.g., Nodal Officer, Senior Officer).
Analyze the Triage Queue:
The central queue updates instantly via Supabase Realtime.
Cases are sorted by urgency and financial valuation.
Execute Interdiction Commands:
Select a case to open the Forensic Intelligence Panel.
CONFIRM_FULL_LIEN: If the funds are still in the beneficiary account, click this to freeze the entire amount.
PARTIAL_BALANCE_LIEN: If some funds have been moved, enter the remaining balance to freeze what's left.
Human-in-the-Loop (FIU Escalation):
For complex or high-value frauds, click TRIGGER_FIU_ESCALATION.
The system automatically generates a certified Legal Request.
Click DOWNLOAD_LEGAL_LIEN to retrieve the authoritative documentation for bank-to-bank correspondence.
Session Management: Use the Logout icon in the profile section to cycle roles or terminate your administrative session securely.
