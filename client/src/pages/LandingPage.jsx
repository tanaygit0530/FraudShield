import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Zap, Lock, BarChart3, Clock, ArrowRight, CheckCircle2, XCircle, 
  FileText, Search, Send, Activity, RefreshCw 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as caseService from '../services/caseService';

const LandingPage = () => {
  const [latestCase, setLatestCase] = React.useState(null);
  const [intel, setIntel] = React.useState(null);

  React.useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await caseService.getCases();
        const data = res.data;
        if (data && data.length > 0) {
          const c = data[0];
          setLatestCase(c);
          const iRes = await caseService.getCaseIntelligence(c.id);
          const iData = iRes.data;
          setIntel(iData);
        }
      } catch (e) {
        console.error("Home fetch error", e);
      }
    };
    fetchLatest();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="landing-page">
      {/* 1. Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="glow glow-1"></div>
          <div className="glow glow-2"></div>
        </div>
        
        <div className="container hero-content">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="badge">Coordination Layer for Fintech</span>
            <h1 className="text-gradient">Report Fraud.<br />Freeze Faster.<br />Track Everything.</h1>
            <p>Reduce response time from hours to minutes with AI-powered routing and live institutional tracking. Not a bank, but the layer that makes them respond.</p>
            
            <div className="hero-btns">
              <Link to="/report" className="btn-primary">
                Report Fraud Now <ArrowRight size={20} />
              </Link>
              <a href="#how-it-works" className="btn-secondary">
                See How It Works
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero-card-container float-anim">
              <div className="glass-card hero-preview-card">
                <div className="card-header">
                  <Activity className="text-blue-500" size={24} />
                  <span>Real-time Recovery Panel</span>
                </div>
                <div className="card-stats">
                  <div className="stat">
                    <span className="label">Amount</span>
                    <span className="value">₹{latestCase ? latestCase.amount.toLocaleString('en-IN') : '1,24,000'}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Probability</span>
                    <span className="value text-success">{intel ? intel.recovery_probability : '84'}%</span>
                  </div>
                </div>
                <div className="timeline-mini">
                  <div className="line"></div>
                  <div className="step active"></div>
                  <div className="step active"></div>
                  <div className="step current outline-pulse"></div>
                  <div className="step"></div>
                </div>
                <p className="status-note">
                  {latestCase ? `Lien markup active for ${latestCase.payload.bank_name || 'beneficiary'} node...` : 'Lien request sent to HDFC Bank...'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Problem Section */}
      <section className="problem-section py-20">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="text-3xl">The Broken Status Quo</h2>
            <p className="text-muted">Why fraud recovery currently fails victims.</p>
          </div>
          
          <div className="comparison-table-wrapper">
            <table className="problem-table">
              <thead>
                <tr>
                  <th>Traditional Process</th>
                  <th>The FraudShield Way</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { p: "Victim confusion", s: "Structured step-by-step intake" },
                  { p: "Manual drafting", s: "Legal payload automation" },
                  { p: "Delayed reporting", s: "Instant routing to rail endpoints" },
                  { p: "No time awareness", s: "SLA countdown timers" },
                  { p: "No transaction insight", s: "Shadow Trace intelligence" },
                  { p: "No follow-up", s: "Live institutional tracking" },
                  { p: "No transparency", s: "Real-time state machine updates" },
                  { p: "No accountability", s: "Audit-ready logs & watermarks" }
                ].map((item, i) => (
                  <tr key={i}>
                    <td><XCircle size={16} className="text-error" /> {item.p}</td>
                    <td><CheckCircle2 size={16} className="text-success" /> {item.s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. How It Works - 5 Phase Architecture */}
      <section id="how-it-works" className="phases-section py-20">
        <div className="container">
          <div className="section-header text-center mb-16">
            <h2>5-Phase Orchestration Engine</h2>
            <p className="text-muted">Our proprietary framework for accelerated recovery.</p>
          </div>

          <div className="phases-grid">
            {/* Phase 1 */}
            <div className="phase-card glass-card">
              <div className="phase-number">01</div>
              <FileText className="phase-icon" size={40} />
              <h3>Rapid Ingestion</h3>
              <p>OCR-powered extraction, screenshot validation, and OTP verified declarations.</p>
              <ul>
                <li><CheckCircle2 size={14} /> AI OCR Extraction</li>
                <li><CheckCircle2 size={14} /> JSON Schema Validation</li>
                <li><CheckCircle2 size={14} /> Signed Declaration</li>
              </ul>
            </div>

            {/* Phase 2 */}
            <div className="phase-card glass-card">
              <div className="phase-number">02</div>
              <Search className="phase-icon" size={40} />
              <h3>Shadow Trace</h3>
              <p>Intelligence engine for rail identification (UPI/NEFT) and bank detection.</p>
              <ul>
                <li><CheckCircle2 size={14} /> Rail Identification</li>
                <li><CheckCircle2 size={14} /> Risk Scoring (0-100)</li>
                <li><CheckCircle2 size={14} /> Recovery Meter</li>
              </ul>
            </div>

            {/* Phase 3 */}
            <div className="phase-card glass-card active-phase">
              <div className="phase-number">03</div>
              <Send className="phase-icon" size={40} />
              <h3>Legal Payload</h3>
              <p>Compliance-based freeze requests and RBI framework references auto-generated.</p>
              <ul>
                <li><CheckCircle2 size={14} /> Auto PDF Generation</li>
                <li><CheckCircle2 size={14} /> SMTP SES/Postmark Routing</li>
                <li><CheckCircle2 size={14} /> Timestamp Watermarks</li>
              </ul>
            </div>

            {/* Phase 4 */}
            <div className="phase-card glass-card">
              <div className="phase-number">04</div>
              <Activity className="phase-icon" size={40} />
              <h3>Live Tracking</h3>
              <p>Institutional visibility panel and SLA countdowns for bank responses.</p>
              <ul>
                <li><CheckCircle2 size={14} /> Institutional Dashboard</li>
                <li><CheckCircle2 size={14} /> SLA Countdown Timer</li>
                <li><CheckCircle2 size={14} /> Escalation Watchdog</li>
              </ul>
            </div>

            {/* Phase 5 */}
            <div className="phase-card glass-card">
              <div className="phase-number">05</div>
              <RefreshCw className="phase-icon" size={40} />
              <h3>Recovery Cycle</h3>
              <p>Managing partial liens, reversal initiations, and final fund credits.</p>
              <ul>
                <li><CheckCircle2 size={14} /> Partial Freeze Support</li>
                <li><CheckCircle2 size={14} /> Reversal Tracking</li>
                <li><CheckCircle2 size={14} /> Case Closure Audit</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Positioning Statement */}
      <section className="positioning py-20">
        <div className="container text-center">
          <div className="glass-card positioning-card">
            <Shield className="large-icon" size={60} />
            <h2>FraudShield is not a bank.</h2>
            <p>It is the coordination layer that makes institutions respond faster.</p>
            <div className="tagline">"Response time is the only metric that matters."</div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .hero {
          position: relative;
          padding: 10rem 0 5rem;
          min-height: 90vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
        }
        .glow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
        }
        .glow-1 {
          top: -10%;
          left: -10%;
          background: var(--primary);
        }
        .glow-2 {
          bottom: -10%;
          right: -10%;
          background: var(--secondary);
        }
        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .badge {
          background: rgba(0, 97, 255, 0.1);
          color: var(--primary);
          padding: 0.4rem 1rem;
          border-radius: 2rem;
          font-weight: 600;
          font-size: 0.85rem;
          border: 1px solid rgba(0, 97, 255, 0.2);
          display: inline-block;
          margin-bottom: 1.5rem;
        }
        .hero-text h1 {
          font-size: 4.5rem;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }
        .hero-text p {
          font-size: 1.25rem;
          color: var(--text-muted);
          margin-bottom: 2.5rem;
          max-width: 500px;
        }
        .hero-btns {
          display: flex;
          gap: 1.5rem;
        }
        .hero-preview-card {
          padding: 2rem;
          max-width: 400px;
          margin-left: auto;
          position: relative;
          border-color: rgba(0, 97, 255, 0.3);
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          font-weight: 600;
        }
        .card-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat .label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat .value {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .timeline-mini {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin: 2rem 0;
        }
        .timeline-mini .line {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--border);
          z-index: 0;
          transform: translateY(-50%);
        }
        .timeline-mini .step {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 2px solid var(--border);
          position: relative;
          z-index: 1;
        }
        .timeline-mini .step.active {
          background: var(--primary);
          border-color: var(--primary);
        }
        .timeline-mini .step.current {
          background: var(--primary);
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(0, 97, 255, 0.2);
        }
        .status-note {
          font-size: 0.85rem;
          color: var(--text-dim);
          font-style: italic;
        }

        .section-header h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .problem-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 3rem;
        }
        .problem-table th {
          padding: 1.5rem;
          text-align: left;
          background: rgba(255, 255, 255, 0.02);
          border-bottom: 1px solid var(--border);
        }
        .problem-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          color: var(--text-muted);
        }
        .problem-table tr td:last-child {
          color: var(--text-main);
          font-weight: 500;
        }

        .phases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }
        .phase-card {
          padding: 2rem;
          position: relative;
          transition: var(--transition);
        }
        .phase-card:hover {
          border-color: var(--primary);
          transform: translateY(-5px);
        }
        .phase-number {
          position: absolute;
          top: 1rem;
          right: 1.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.05);
        }
        .phase-icon {
          color: var(--primary);
          margin-bottom: 1.5rem;
        }
        .phase-card h3 {
          margin-bottom: 1rem;
        }
        .phase-card p {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }
        .phase-card ul {
          list-style: none;
        }
        .phase-card ul li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-dim);
          margin-bottom: 0.5rem;
        }
        .active-phase {
          border-color: var(--primary);
          background: linear-gradient(135deg, var(--bg-card) 0%, rgba(0, 97, 255, 0.05) 100%);
        }

        .positioning-card {
          padding: 4rem;
          max-width: 800px;
          margin: 0 auto;
          border-color: var(--primary);
        }
        .large-icon {
          color: var(--primary);
          margin-bottom: 2rem;
        }
        .positioning-card h2 {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .positioning-card p {
          font-size: 1.5rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
        }
        .tagline {
          font-weight: 600;
          color: var(--secondary);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        @media (max-width: 968px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .hero-text p {
            margin: 0 auto 2.5rem;
          }
          .hero-btns {
            justify-content: center;
          }
          .hero-visual {
            display: none;
          }
          .hero-text h1 {
            font-size: 3rem;
          }
        }
      `}} />
    </div>
  );
};

export default LandingPage;
