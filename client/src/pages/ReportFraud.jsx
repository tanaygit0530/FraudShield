import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, CheckCircle2, Shield, ArrowRight, 
  Search, AlertTriangle, Loader2, Zap, Edit3, Camera,
  Fingerprint, FileLock2, ChevronLeft, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as caseService from '../services/caseService';
import * as authService from '../services/authService';

const ReportFraud = () => {
  const [method, setMethod] = useState(null); // 'ocr' or 'manual'
  const [step, setStep] = useState(1);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phone, setPhone] = useState('');
  
  const [formData, setFormData] = useState({
    txn_id: '',
    amount: '',
    utr: '',
    beneficiary_vpa: '',
    bank_name: '',
    incident_date: '',
    legitimacy_score: 50
  });

  const navigate = useNavigate();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsExtracting(true);
    const formDataFile = new FormData();
    formDataFile.append('screenshot', file);

    try {
      const response = await caseService.ingestOCR(formDataFile);
      
      const { extractedData } = response.data;
      setFormData({
        txn_id: extractedData?.txn_id || '',
        amount: extractedData?.amount || '',
        utr: extractedData?.utr || '',
        beneficiary_vpa: extractedData?.beneficiary_vpa || '',
        bank_name: extractedData?.bank_name || '',
        incident_date: extractedData?.incident_date || '',
        legitimacy_score: extractedData?.legitimacy_score || 88
      });
      setStep(2);
    } catch (err) {
      console.error('OCR Error:', err);
      alert('AI Ingestion encountered an error. Proceeding to Manual Validation.');
      setMethod('manual');
      setStep(2);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleManualInitiate = () => {
    setMethod('manual');
    setStep(2);
  };

  const generateOTP = async () => {
    if (!phone) return alert('Input required: Registered Mobile Number');
    try {
      await authService.generateOTP(phone);
      setOtpSent(true);
    } catch (err) {
      alert('Network Error: OTP Dispatch Failed');
    }
  };

  const verifyAndSubmit = async () => {
    if (otpCode.length < 4) return alert('Invalid Input: 6-Digit OTP required');
    
    setIsSubmitting(true);
    try {
      await authService.verifyOTP(phone, otpCode);
      await caseService.createCase({ ...formData, phone, entry_method: method });
      navigate('/dashboard');
    } catch (err) {
      alert('Vault Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-fraud-page">
      <div className="bg-glow"></div>
      
      <div className="container">
        <header className="report-header">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="phase-badge">
            <Zap size={14} /> Intake Phase 1
          </motion.div>
          <h1>Initialize <span className="gradient-text">Recovery Protocol</span></h1>
          <p>Orchestrate instant lien marking by ingesting transaction intelligence through our AI-accelerated gateway.</p>
        </header>

        {/* Step Tracker */}
        <div className="step-tracker">
          <div className="tracker-line"></div>
          {[1, 2, 3].map((s) => (
            <div key={s} className={`step-node ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}>
              <div className="node-circle">
                {step > s ? <CheckCircle2 size={20} /> : s}
              </div>
              <span className="node-label">{s === 1 ? 'Gateway' : s === 2 ? 'Intelligence' : 'Verification'}</span>
            </div>
          ))}
        </div>

        <main className="report-content">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Decision */}
            {step === 1 && !method && !isExtracting && (
              <motion.div 
                key="choice" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="method-grid"
              >
                <div className="method-card premium" onClick={() => setMethod('ocr')}>
                  <div className="method-icon-wrap">
                    <Sparkles size={32} />
                  </div>
                  <h3>Neural Scan</h3>
                  <p>Gemini-1.5 engine will map beneficiary VPAs and UTR trails from your screenshot instantly.</p>
                  <div className="method-badge"><Zap size={12} /> AI-Accelerated</div>
                </div>

                <div className="method-card" onClick={handleManualInitiate}>
                  <div className="method-icon-wrap">
                    <Edit3 size={32} />
                  </div>
                  <h3>Manual Entry</h3>
                  <p>Manually input institutional identifiers if screenshot acquisition isn't feasible.</p>
                </div>
              </motion.div>
            )}

            {/* Step 1: Upload */}
            {step === 1 && method === 'ocr' && !isExtracting && (
              <motion.div 
                key="upload" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="upload-view"
              >
                <button className="back-btn" onClick={() => setMethod(null)}>
                  <ChevronLeft size={18} /> Back to Entry Selection
                </button>
                <div className="glass-card upload-box">
                  <input type="file" onChange={handleFileUpload} accept="image/*" className="file-input" />
                  <div className="upload-ui">
                    <div className="upload-icon-circle">
                      <Upload size={48} />
                    </div>
                    <h3>Ingest Recovery Evidence</h3>
                    <p>Click or drag your transaction receipt here</p>
                    <div className="btn-primary">Browse Files</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Loading */}
            {isExtracting && (
              <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ai-loading">
                <div className="loading-animation">
                  <div className="loader-ring"></div>
                  <Fingerprint size={48} className="pulse-icon" />
                </div>
                <h3>Gemini Engine <span className="primary-text">Active</span></h3>
                <p>Analyzing Institutional Payloads...</p>
              </motion.div>
            )}

            {/* Step 2: Form */}
            {step === 2 && (
              <motion.div key="intel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card intel-form">
                <div className="form-header">
                  <h2>Incident Intelligence</h2>
                  {method === 'ocr' && (
                    <div className="conf-badge">AI Score: <strong>{formData.legitimacy_score}%</strong></div>
                  )}
                </div>

                <div className="grid-form">
                  <div className="input-wrap">
                    <label>Transaction ID / Ref</label>
                    <input value={formData.txn_id} onChange={(e) => setFormData({...formData, txn_id: e.target.value})} />
                  </div>
                  <div className="input-wrap">
                    <label>Amount (INR)</label>
                    <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                  </div>
                  <div className="input-wrap">
                    <label>UTR Number (12 Digit)</label>
                    <input value={formData.utr} onChange={(e) => setFormData({...formData, utr: e.target.value})} />
                  </div>
                  <div className="input-wrap">
                    <label>Beneficiary Rail (VPA/IFSC)</label>
                    <input value={formData.beneficiary_vpa} onChange={(e) => setFormData({...formData, beneficiary_vpa: e.target.value})} />
                  </div>
                  <div className="input-wrap">
                    <label>Remitter Bank</label>
                    <input value={formData.bank_name} onChange={(e) => setFormData({...formData, bank_name: e.target.value})} />
                  </div>
                  <div className="input-wrap">
                    <label>Incident Date</label>
                    <input type="date" value={formData.incident_date} onChange={(e) => setFormData({...formData, incident_date: e.target.value})} />
                  </div>
                </div>

                <div className="form-footer">
                  <button onClick={() => { setStep(1); setMethod(null); }} className="secondary-btn">Reset</button>
                  <button onClick={() => setStep(3)} className="btn-primary">Next Protocol <ArrowRight size={20} /></button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Verify */}
            {step === 3 && (
              <motion.div key="vault" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="vault-view">
                <div className="legal-notice">
                  <AlertTriangle size={32} />
                  <div>
                    <h4>Legal Attestation</h4>
                    <p>I certify this claim is true. FraudShield will route this to bank nodal officers for immediate lien marking.</p>
                  </div>
                </div>

                <div className="glass-card otp-section">
                  {!otpSent ? (
                    <div className="phone-entry">
                      <h3>2FA Verification</h3>
                      <p>Enter the mobile number registered with your remitter bank.</p>
                      <div className="input-action-group">
                        <input value={phone} placeholder="+91 XXXX XXXX" onChange={(e) => setPhone(e.target.value)} />
                        <button onClick={generateOTP} className="btn-primary">Dispatch</button>
                      </div>
                    </div>
                  ) : (
                    <div className="code-entry">
                      <h3>Enter Secure Key</h3>
                      <input className="otp-digit-input" maxLength="6" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
                      <button onClick={verifyAndSubmit} disabled={isSubmitting} className="btn-primary full-width">
                        {isSubmitting ? <Loader2 className="spinning" /> : 'Commit to Vault'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        <footer className="security-footer">
          <div className="badge"><Shield size={16} /> AES-256 VAULT LEVEL SECURITY</div>
          <p>Data processed in real-time. Subject to NPCI arbitration and bank nodal server response times.</p>
        </footer>
      </div>

      <style>{`
        .report-fraud-page {
          background-color: var(--bg-dark);
          min-height: 100vh;
          padding-top: 10rem;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .bg-glow {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(0, 97, 255, 0.15) 0%, transparent 70%);
          z-index: 0;
        }

        .report-header {
          text-align: center;
          margin-bottom: 5rem;
          position: relative;
          z-index: 1;
        }

        .phase-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 97, 255, 0.1);
          color: var(--primary);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(0, 97, 255, 0.2);
        }

        .report-header h1 {
          font-size: 3.5rem;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .gradient-text {
          background: linear-gradient(135deg, #FFF 0%, var(--primary) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .report-header p {
          color: var(--text-muted);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Step Tracker */
        .step-tracker {
          display: flex;
          justify-content: space-between;
          max-width: 700px;
          margin: 0 auto 5rem;
          position: relative;
          z-index: 1;
        }

        .tracker-line {
          position: absolute;
          top: 1.25rem;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(255, 255, 255, 0.05);
          z-index: -1;
        }

        .step-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .node-circle {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: var(--bg-card);
          border: 2px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: var(--text-muted);
          transition: all 0.5s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }

        .step-node.active .node-circle {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
          box-shadow: 0 0 20px rgba(0, 97, 255, 0.3);
        }

        .step-node.current .node-circle {
          background: var(--bg-card);
          border-color: var(--primary);
          color: var(--primary);
          transform: scale(1.1);
        }

        .node-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--text-dim);
        }

        .step-node.active .node-label {
          color: var(--text-main);
        }

        /* Method Cards */
        .method-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .method-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 3rem;
          border-radius: 2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .method-card:hover {
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-5px);
          border-color: var(--primary);
        }

        .method-card.premium {
          border-color: rgba(0, 97, 255, 0.3);
          background: linear-gradient(135deg, rgba(13, 21, 38, 0.8) 0%, rgba(0, 97, 255, 0.05) 100%);
        }

        .method-icon-wrap {
          width: 4rem;
          height: 4rem;
          border-radius: 1rem;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          color: var(--primary);
        }

        .method-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .method-card p {
          color: var(--text-muted);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .method-badge {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: var(--primary);
          color: white;
          padding: 0.3rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.6rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        /* Upload View */
        .upload-view {
          max-width: 600px;
          margin: 0 auto;
        }

        .back-btn {
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          color: var(--text-dim);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .back-btn:hover { color: white; }

        .upload-box {
          padding: 4rem;
          text-align: center;
          border-style: dashed;
          border-width: 2px;
          border-color: rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          z-index: 10;
        }

        .upload-icon-circle {
          width: 6rem;
          height: 6rem;
          border-radius: 50%;
          background: rgba(0, 97, 255, 0.1);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem;
        }

        .upload-ui h3 { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .upload-ui p { color: var(--text-muted); margin-bottom: 2.5rem; }

        /* AI Loading */
        .ai-loading {
          text-align: center;
          padding: 5rem 0;
        }

        .loading-animation {
          position: relative;
          width: 10rem;
          height: 10rem;
          margin: 0 auto 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loader-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 4px solid rgba(0, 97, 255, 0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .pulse-icon {
          color: var(--primary);
          animation: pulse 1.5s ease-in-out infinite;
        }

        .primary-text { color: var(--primary); }

        /* Intel Form */
        .intel-form {
          max-width: 900px;
          margin: 0 auto;
          padding: 4rem;
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
        }

        .conf-badge {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.8rem;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .grid-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .input-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .input-wrap label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-dim);
          letter-spacing: 0.05em;
        }

        .input-wrap input {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem 1.25rem;
          border-radius: 0.75rem;
          color: white;
          font-size: 1rem;
        }

        .input-wrap input:focus {
          border-color: var(--primary);
          outline: none;
        }

        .form-footer {
          margin-top: 4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .secondary-btn {
          background: none;
          color: var(--text-dim);
          font-weight: 700;
        }

        /* Vault View */
        .vault-view {
          max-width: 600px;
          margin: 0 auto;
        }

        .legal-notice {
          display: flex;
          gap: 1.5rem;
          background: rgba(245, 158, 11, 0.05);
          border: 1px solid rgba(245, 158, 11, 0.1);
          padding: 2rem;
          border-radius: 1.5rem;
          margin-bottom: 3rem;
          color: var(--warning);
        }

        .legal-notice h4 { margin-bottom: 0.3rem; }
        .legal-notice p { font-size: 0.85rem; color: rgba(245, 158, 11, 0.7); }

        .otp-section { padding: 3rem; }

        .phone-entry h3, .code-entry h3 { margin-bottom: 0.5rem; }
        .phone-entry p { color: var(--text-muted); margin-bottom: 2rem; font-size: 0.9rem; }

        .input-action-group {
          display: flex;
          gap: 1rem;
        }

        .input-action-group input {
          flex: 1;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          color: white;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .otp-digit-input {
          width: 100%;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--primary);
          padding: 1.5rem;
          border-radius: 1rem;
          text-align: center;
          font-size: 3rem;
          font-weight: 900;
          letter-spacing: 1.5rem;
          margin-bottom: 2rem;
          color: var(--primary);
        }

        .full-width { width: 100%; justify-content: center; padding: 1.25rem; font-size: 1.1rem; }

        /* Footer */
        .security-footer {
          margin-top: 6rem;
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .security-footer .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-dim);
          background: rgba(255, 255, 255, 0.03);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }

        .security-footer p {
          color: rgba(255, 255, 255, 0.2);
          font-size: 0.65rem;
          max-width: 400px;
          margin: 0 auto;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }

        @media (max-width: 768px) {
          .method-grid, .grid-form { grid-template-columns: 1fr; }
          .report-header h1 { font-size: 2.5rem; }
        }
      `}</style>
    </div>
  );
};

export default ReportFraud;
