import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, CheckCircle2, Shield, ArrowRight, 
  Search, AlertTriangle, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportFraud = () => {
  const [step, setStep] = useState(1);
  const [isExtracting, setIsExtracting] = useState(false);
  const [formData, setFormData] = useState({
    txn_id: '',
    amount: '',
    utr: '',
    beneficiary_vpa: '',
    bank_name: '',
    incident_date: ''
  });
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsExtracting(true);
      setTimeout(() => {
        setIsExtracting(false);
        setFormData({
          txn_id: 'TXN_' + Math.floor(Math.random() * 1000000),
          amount: '45,200',
          utr: '928475012398',
          beneficiary_vpa: 'scam-account@okaxis',
          bank_name: 'HDFC Bank',
          incident_date: new Date().toISOString().split('T')[0]
        });
        setStep(2);
      }, 2500);
    }
  };

  const handleStepSubmit = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="report-fraud-page pb-20">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl mb-2">Initialize Rapid Recovery</h1>
          <p className="text-muted">Phase 1: Secure Ingestion & Intelligence Extraction</p>
        </div>

        <div className="step-indicator mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`step-item ${step >= s ? 'active' : ''}`}>
              <div className="step-dot">{step > s ? <CheckCircle2 size={16} /> : s}</div>
              <span className="step-label">{s === 1 ? 'Upload' : s === 2 ? 'Verify' : 'Submit'}</span>
              {s < 3 && <div className="step-line"></div>}
            </div>
          ))}
        </div>

        <div className="glass-card intake-card">
          <AnimatePresence mode="wait">
            {step === 1 && !isExtracting && (
              <motion.div key="1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="upload-dropzone">
                  <input type="file" onChange={handleFileUpload} accept="image/*" />
                  <Upload size={48} className="text-primary mb-4" />
                  <h3>Upload Transaction Screenshot</h3>
                  <p className="text-muted">JPEG, PNG, or PDF of the bank confirmation screen</p>
                  <div className="btn-secondary mt-8">Select File</div>
                </div>
              </motion.div>
            )}

            {isExtracting && (
              <motion.div key="L" className="py-12 text-center">
                <Loader2 size={64} className="text-primary spinning mb-4" />
                <h3>OCR Engine Processing...</h3>
                <p className="text-muted">Extracting transaction details via AI</p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Transaction ID</label>
                    <input type="text" value={formData.txn_id} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input type="text" value={formData.amount} readOnly />
                  </div>
                  <div className="form-group">
                    <label>UTR Number</label>
                    <input type="text" value={formData.utr} readOnly />
                  </div>
                  <div className="form-group">
                    <label>Beneficiary</label>
                    <input type="text" value={formData.beneficiary_vpa} readOnly />
                  </div>
                </div>
                <div className="mt-8 text-right">
                  <button onClick={handleStepSubmit} className="btn-primary">Verify & Proceed <ArrowRight size={18}/></button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="glass-card bg-primary-faded mb-8">
                  <AlertTriangle size={32} className="text-warning mb-4" />
                  <h3>Legal Declaration</h3>
                  <p className="text-sm text-muted mt-2">I declare this information is accurate under the IPC and IT Act.</p>
                </div>
                <button onClick={handleStepSubmit} className="btn-primary w-full py-4">Submit & Route Recovery</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .step-indicator { display: flex; justify-content: center; align-items: center; }
        .step-item { display: flex; align-items: center; gap: 1rem; position: relative; }
        .step-dot { width: 32px; height: 32px; border-radius: 50%; background: var(--bg-card); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--text-dim); }
        .step-item.active .step-dot { border-color: var(--primary); color: var(--primary); }
        .step-label { font-size: 0.9rem; color: var(--text-dim); }
        .step-item.active .step-label { color: var(--text-main); }
        .step-line { width: 50px; height: 2px; background: var(--border); margin: 0 1rem; }
        
        .upload-dropzone { border: 2px dashed var(--border); border-radius: 1rem; padding: 4rem 2rem; text-align: center; position: relative; }
        .upload-dropzone input { position: absolute; width: 100%; height: 100%; top: 0; left: 0; opacity: 0; cursor: pointer; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group label { display: block; font-size: 0.85rem; color: var(--text-dim); margin-bottom: 0.5rem; }
        .form-group input { width: 100%; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); padding: 0.75rem 1rem; border-radius: 0.5rem; color: white; }
        
        .bg-primary-faded { background: rgba(0, 97, 255, 0.05); border: 1px solid rgba(0, 97, 255, 0.1); }
      `}</style>
    </div>
  );
};

export default ReportFraud;
