import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Lock, Eye, Database, 
  FileCheck, AlertTriangle, Scale,
  Fingerprint, Cpu, Globe, Server,
  CheckCircle2, AlertCircle
} from 'lucide-react';

const SecurityPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="security-page">
      <div className="grid-overlay"></div>
      
      <motion.div 
        className="container"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Main Header */}
        <motion.div className="security-header" variants={itemVariants}>
          <div className="security-badge">
            <Shield size={12} className="text-blue" />
            <span>ENTERPRISE GRADE COMPLIANCE</span>
          </div>
          <h1 className="title-gradient">Security & <span className="text-blue">Protocol</span></h1>
          <p className="subtitle">
            FraudShield implements bank-grade infrastructure and sovereign encryption protocols to ensure 
            institutional-level data protection and regulatory alignment.
          </p>
        </motion.div>

        {/* Primary Security Grid */}
        <div className="security-grid">
          {[
            { 
              icon: <Lock size={24} />, 
              title: "End-to-End Encryption", 
              desc: "Data at rest and in transit is secured with AES-256 and TLS 1.3. Evidence payloads use per-case encryption keys rotated periodically.",
              tag: "MIL-SPEC"
            },
            { 
              icon: <Database size={24} />, 
              title: "Granular Row Safety", 
              desc: "Hardware-level multi-tenancy logic ensures only verified jurisdictional nodal officers can access cross-institutional audit trails.",
              tag: "RLS-V2"
            },
            { 
              icon: <Scale size={24} />, 
              title: "DPDP 2023 Compliant", 
              desc: "Architected for India's Digital Personal Data Protection Act, supporting right to erasure and strict data residency on authorized servers.",
              tag: "REGULATORY"
            },
            { 
              icon: <Fingerprint size={24} />, 
              title: "Zero-Knowledge Proofs", 
              desc: "Verify identity and transaction legitimacy without exposing secondary PII, maintaining privacy while ensuring evidentiary weight.",
              tag: "PRIVACY"
            },
          ].map((item, idx) => (
            <motion.div className="sec-card" variants={itemVariants} key={idx}>
              <div className="card-top">
                <div className="icon-box">{item.icon}</div>
                <div className="card-tag">{item.tag}</div>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <div className="card-footer">
                <CheckCircle2 size={12} className="text-green" />
                <span>Verified Secure Agent</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Risk Mitigation Section */}
        <motion.div className="risk-interdiction" variants={itemVariants}>
          <div className="risk-panel-header">
            <div className="flex items-center gap-4">
              <AlertTriangle size={32} className="text-amber" />
              <div>
                <h2>Interdiction Risk Matrix</h2>
                <p className="text-muted">Strategic safeguards for automated legal dispatch systems</p>
              </div>
            </div>
            <div className="status-live">
              <span className="pulse-dot"></span>
              REAL-TIME MONITORING
            </div>
          </div>

          <div className="risk-details-grid">
            <div className="risk-detail-item">
              <div className="detail-icon"><Server size={18}/></div>
              <div>
                <h4>BIMI & SPF Enforcement</h4>
                <p>Preventing institutional impersonation via mandatory DMARC quarantine protocols for all automated banking emails.</p>
              </div>
            </div>
            <div className="risk-detail-item">
              <div className="detail-icon"><Shield size={18}/></div>
              <div>
                <h4>Anti-Abuse Heuristics</h4>
                <p>ML-driven detection of forged transaction screenshots and synthetic identity patterns before they enter the FIU queue.</p>
              </div>
            </div>
            <div className="risk-detail-item">
              <div className="detail-icon"><Globe size={18}/></div>
              <div>
                <h4>Data Sovereignty</h4>
                <p>100% of PII stays within Indian jurisdiction (MEITY empanelled clouds) with no international relay nodes.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Audit Log Footer */}
        <motion.div className="audit-scroller-wrap" variants={itemVariants}>
          <div className="audit-footer">
            <div className="audit-meta">
              <Cpu size={14} className="text-blue" />
              <span className="mono">SYSTEM_HASH: 0x8F2C...4D2E</span>
            </div>
            <div className="audit-meta">
              <Lock size={14} className="text-green" />
              <span className="mono">ENCRYPTION: AES_CBC_256</span>
            </div>
            <div className="audit-meta">
              <Scale size={14} className="text-amber" />
              <span>RBI/2021-22/75 ALIGNED</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

        :root {
          --bg: #020617;
          --bg-card: rgba(15, 23, 42, 0.5);
          --border: rgba(255, 255, 255, 0.08);
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
          --text-muted: #475569;
          --accent-blue: #0061FF;
          --accent-amber: #f59e0b;
          --accent-green: #10b981;
          --accent-red: #ef4444;
        }

        .security-page {
          background-color: var(--bg);
          min-height: 100vh;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          padding: 8rem 0;
          position: relative;
          overflow-x: hidden;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(var(--border) 1px, transparent 1px), 
                            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.1;
          pointer-events: none;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 1;
        }

        .security-header {
          text-align: center;
          margin-bottom: 5rem;
        }

        .security-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(0, 97, 255, 0.1);
          border: 1px solid rgba(0, 97, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: var(--accent-blue);
          margin-bottom: 2rem;
        }

        .title-gradient {
          font-size: 4rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin: 0 0 1.5rem 0;
          line-height: 1;
        }

        .text-blue { color: var(--accent-blue); }
        .text-green { color: var(--accent-green); }
        .text-amber { color: var(--accent-amber); }

        .subtitle {
          font-size: 1.15rem;
          color: var(--text-secondary);
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .security-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 4rem;
        }

        .sec-card {
          background: var(--bg-card);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2.5rem;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sec-card:hover {
          border-color: rgba(0, 97, 255, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -20px rgba(0,0,0,0.5);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .icon-box {
          width: 56px;
          height: 56px;
          background: #0f172a;
          border: 1px solid var(--border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-blue);
        }

        .card-tag {
          font-size: 0.65rem;
          font-weight: 900;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          background: rgba(255,255,255,0.03);
          padding: 0.3rem 0.6rem;
          border-radius: 4px;
        }

        .sec-card h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .sec-card p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }

        .card-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
        }

        .risk-interdiction {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, transparent 100%);
          border: 1px solid rgba(245, 158, 11, 0.15);
          border-radius: 20px;
          padding: 3.5rem;
          margin-bottom: 4rem;
        }

        .risk-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3.5rem;
        }

        .risk-panel-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
        }

        .status-live {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.65rem;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: var(--accent-amber);
        }

        .pulse-dot {
          width: 6px; height: 6px;
          background: var(--accent-amber);
          border-radius: 50%;
          animation: securityPulse 2s infinite;
        }

        @keyframes securityPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        .risk-details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3rem;
        }

        .risk-detail-item {
          display: flex;
          gap: 1.25rem;
        }

        .detail-icon {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          background: rgba(245, 158, 11, 0.1);
          color: var(--accent-amber);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .risk-detail-item h4 {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--accent-amber);
        }

        .risk-detail-item p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .audit-scroller-wrap {
          border-top: 1px solid var(--border);
          padding-top: 3rem;
        }

        .audit-footer {
          display: flex;
          justify-content: center;
          gap: 4rem;
          flex-wrap: wrap;
        }

        .audit-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .mono { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; }

        @media (max-width: 1024px) {
          .security-grid { grid-template-columns: 1fr; }
          .risk-details-grid { grid-template-columns: 1fr; gap: 2rem; }
          .title-gradient { font-size: 2.5rem; }
          .audit-footer { gap: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default SecurityPage;
