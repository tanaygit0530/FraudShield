import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Landmark, AlertTriangle, CheckCircle2, 
  Download, Mail, Activity, Shield, AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const [timeLeft, setTimeLeft] = useState(1080); // 18 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const caseStates = [
    { id: 'CREATED', label: 'Fraud Reported', status: 'completed' },
    { id: 'VERIFIED', label: 'Identity Verified', status: 'completed' },
    { id: 'ROUTED', label: 'Freeze Sent', status: 'completed' },
    { id: 'ACK_PENDING', label: 'Ack Pending', status: 'current' },
    { id: 'ACK_RECEIVED', label: 'Ack Received', status: 'pending' },
    { id: 'UNDER_BANK_REVIEW', label: 'Bank Reviewing', status: 'pending' },
    { id: 'LIEN_REQUESTED', label: 'Lien Requested', status: 'pending' },
    { id: 'PARTIALLY_FROZEN', label: 'Partially Frozen', status: 'pending' },
    { id: 'FREEZE_CONFIRMED', label: 'Freeze Confirmed', status: 'pending' },
    { id: 'REVERSAL_IN_PROGRESS', label: 'Reversal Initiated', status: 'pending' },
    { id: 'FUNDS_CREDITED', label: 'Funds Credited', status: 'pending' },
    { id: 'ESCALATED', label: 'Escalated', status: 'pending' },
    { id: 'CLOSED', label: 'Case Closed', status: 'pending' },
  ];

  return (
    <div className="dashboard-page pb-12">
      <div className="container">
        {/* Dashboard Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="text-2xl mb-1">Recovery Command Center</h1>
            <p className="text-muted">Orchestrating institutional response for CASE-8842</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">
              <Download size={18} /> Export Case Bundle
            </button>
            <button className="btn-primary">
              <AlertTriangle size={18} /> Escalated Response
            </button>
          </div>
        </header>

        <div className="dashboard-grid">
          {/* Main Case Info */}
          <div className="dashboard-main">
            {/* 1. Recovery Probability Gauge */}
            <div className="glass-card mb-6 probability-card">
              <div className="card-top">
                <h3>Recovery Probability</h3>
                <span className="health-badge health-green">High Probability</span>
              </div>
              <div className="gauge-container">
                <div className="gauge-svg-wrapper">
                  <svg viewBox="0 0 100 50" className="gauge-svg">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <motion.path 
                      d="M 10 50 A 40 40 0 0 1 90 50" 
                      fill="none" 
                      stroke="var(--primary)" 
                      strokeWidth="8"
                      strokeDasharray="125.6"
                      initial={{ strokeDashoffset: 125.6 }}
                      animate={{ strokeDashoffset: 125.6 * (1 - 0.84) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="gauge-value">84%</div>
                </div>
                <div className="gauge-info">
                  <div className="fact">
                    <span className="label">Amount Tracked</span>
                    <span className="val">₹1,24,000</span>
                  </div>
                  <div className="fact">
                    <span className="label">Lien Potential</span>
                    <span className="val">₹1,02,000</span>
                  </div>
                  <div className="fact">
                    <span className="label">Est. Time</span>
                    <span className="val">2-4 Hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Live Timeline */}
            <div className="glass-card timeline-card">
              <div className="card-top">
                <h3>Incident Orchestration Timeline</h3>
                <div className="sla-timer">
                  <Clock size={16} />
                  <span>Beneficiary Bank SLA: <strong>{formatTime(timeLeft)}</strong></span>
                </div>
              </div>
              
              <div className="timeline-orchestrator">
                {caseStates.map((state, index) => (
                  <div key={state.id} className={`timeline-state ${state.status}`}>
                    <div className="state-line"></div>
                    <div className="state-node">
                      {state.status === 'completed' ? <CheckCircle2 size={16} /> : 
                       state.status === 'current' ? <Activity size={16} className="spinning" /> : index + 1}
                    </div>
                    <div className="state-content">
                      <span className="state-label">{state.label}</span>
                      {state.status === 'current' && (
                        <p className="state-detail">Routing legal payload to Nodal Officer...</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="dashboard-sidebar">
            <div className="glass-card mb-6 visibility-panel">
              <h3>Institutional Visibility</h3>
              <div className="institution-list">
                <div className="institution-item">
                  <Landmark className="text-primary" size={20} />
                  <div className="inst-info">
                    <span className="name">HDFC Bank (Remitter)</span>
                    <span className="status text-success">Active Connection</span>
                  </div>
                </div>
                <div className="institution-item">
                  <Landmark className="text-primary" size={20} />
                  <div className="inst-info">
                    <span className="name">ICICI Bank (Beneficiary)</span>
                    <span className="status text-warning">Awaiting Acknowledgement</span>
                  </div>
                </div>
                <div className="institution-item">
                  <Shield className="text-primary" size={20} />
                  <div className="inst-info">
                    <span className="name">NPCI (Network)</span>
                    <span className="status">Payload Verified</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card comm-log">
              <h3>System Communication</h3>
              <div className="log-entries">
                <div className="log-entry">
                  <span className="time text-dim">10:42 AM</span>
                  <p>Legal document generated with hash 0x82f...a42</p>
                </div>
                <div className="log-entry active">
                  <span className="time text-dim">10:45 AM</span>
                  <p>Awaiting manual acknowledgement from beneficiary...</p>
                </div>
              </div>
              <button className="btn-secondary w-full mt-4">
                <Mail size={16} /> Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .health-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .health-green {
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }
        .gauge-svg-wrapper {
          position: relative;
          width: 150px;
        }
        .gauge-value {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          font-size: 2rem;
          font-weight: 700;
          font-family: 'Outfit';
        }
        .gauge-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          flex: 1;
        }
        .fact .label {
          display: block;
          font-size: 0.7rem;
          color: var(--text-dim);
          text-transform: uppercase;
        }
        .fact .val {
          font-size: 1.1rem;
          font-weight: 600;
        }
        .sla-timer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          background: rgba(245, 158, 11, 0.1);
          color: var(--warning);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
        }
        .timeline-state.completed .state-node {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        .timeline-state.completed .state-line {
          background: var(--primary);
        }
        .timeline-state.current .state-node {
          border-color: var(--primary);
          color: var(--primary);
          box-shadow: 0 0 0 4px rgba(0, 97, 255, 0.2);
        }
        .state-label { font-weight: 500; font-size: 0.95rem; }
        .state-detail { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem; }
        
        .institution-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
        .institution-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 0.75rem;
          border: 1px solid var(--border);
        }
        .inst-info .name { display: block; font-size: 0.9rem; font-weight: 500; }
        .inst-info .status { font-size: 0.75rem; }
        
        .log-entries { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .log-entry { font-size: 0.85rem; border-left: 2px solid var(--border); padding-left: 1rem; }
        .log-entry.active { border-left-color: var(--primary); }
      `}</style>
    </div>
  );
};

export default Dashboard;
