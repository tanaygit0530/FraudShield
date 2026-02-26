import React from 'react';
import { Shield, Lock, Eye, Database, FileCheck, AlertTriangle, Scale } from 'lucide-react';

const SecurityPage = () => {
  return (
    <div className="security-page pt-32 pb-20">
      <div className="container">
        <div className="section-header text-center mb-16">
          <h1 className="text-4xl mb-4">Security & Compliance</h1>
          <p className="text-muted max-w-2xl mx-auto">
            FraudShield is built with bank-grade security protocols to ensure that sensitive fraud evidence and personal data remain protected at all times.
          </p>
        </div>

        <div className="security-grid">
          <div className="glass-card security-card">
            <Lock className="text-primary mb-4" size={32} />
            <h3>End-to-End Encryption</h3>
            <p>All data at rest is encrypted using AES-256. Screenshots and sensitive documents are stored in encrypted buckets with time-limited access tokens.</p>
          </div>

          <div className="glass-card security-card">
            <Database className="text-primary mb-4" size={32} />
            <h3>Row Level Security (RLS)</h3>
            <p>Powered by Supabase, our RLS policies ensure that only authorized investigators and the original victim can access specific case data. No cross-tenant leakage.</p>
          </div>

          <div className="glass-card security-card">
            <Scale className="text-active mb-4" size={32} />
            <h3>DPDP Act 2023 Compliance</h3>
            <p>FraudShield is architected to comply with India's Digital Personal Data Protection Act, implementing strict data residency and purpose limitation controls.</p>
          </div>

          <div className="glass-card security-card">
            <Eye className="text-primary mb-4" size={32} />
            <h3>Audit Logging</h3>
            <p>Every action taken by a user or an automated system is logged. These immutable logs are ready for judicial review or institutional audits.</p>
          </div>
        </div>

        <div className="risk-mitigation-section mt-20">
          <div className="glass-card risk-card">
            <div className="risk-header">
              <AlertTriangle className="text-warning" size={40} />
              <h2>Strategic Risk Mitigation</h2>
            </div>
            
            <div className="risk-grid">
              <div className="risk-item">
                <h4>SMTP Blacklist Prevention</h4>
                <p>We use dedicated IP pools with SPF, DKIM, and BIMI to ensure legal payloads reach bank nodal officers without being flagged as spam.</p>
              </div>
              <div className="risk-item">
                <h4>Fake Screenshot Abuse</h4>
                <p>Advanced image forensic analysis detects modified pixels and metadata inconsistencies to prevent fraudulent reporting on our platform.</p>
              </div>
              <div className="risk-item">
                <h4>Legal Tone Sensitivity</h4>
                <p>Our automation logic adapts the language of requests based on the specific banking rail (UPI vs NEFT) to ensure professional institutional compliance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .security-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }
        .security-card {
          padding: 2.5rem;
          transition: var(--transition);
        }
        .security-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
        }
        .security-card h3 {
          margin-bottom: 1rem;
        }
        .security-card p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }

        .risk-card {
          padding: 4rem;
          border-color: rgba(245, 158, 11, 0.2);
        }
        .risk-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .risk-header h2 {
          font-size: 2.5rem;
        }
        .risk-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 3rem;
        }
        .risk-item h4 {
          color: var(--warning);
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        .risk-item p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
      `}} />
    </div>
  );
};

export default SecurityPage;
