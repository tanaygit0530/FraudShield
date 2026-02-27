import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Landmark, AlertTriangle, CheckCircle2, 
  Activity, Shield, Zap, Loader2,
  FileLock2, Lock, ArrowRight, ChevronRight,
  Database, Server, Globe, Cpu, Radio
} from 'lucide-react';
import axios from 'axios';

// --- Sub-components for Enterprise UI ---

const Counter = ({ value, duration = 1.5 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const endValue = Number(value) || 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setDisplayValue(Math.floor(progress * endValue));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{displayValue}</>;
};

const Shimmer = () => (
  <div className="shimmer-wrapper">
    <div className="shimmer"></div>
    <style>{`
      .shimmer-wrapper { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; }
      .shimmer { width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent); transform: skewX(-20deg); animation: shimmer 3s infinite; }
      @keyframes shimmer { 0% { transform: translateX(-150%) skewX(-20deg); } 100% { transform: translateX(250%) skewX(-20deg); } }
    `}</style>
  </div>
);

const Dashboard = () => {
  const [caseItem, setCaseItem] = useState(null);
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEscalating, setIsEscalating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120 * 60);
  const { id } = useParams();

  useEffect(() => {
    let interval;
    const fetchData = async () => {
      try {
        const casesRes = await axios.get('http://localhost:5001/api/cases');
        if (casesRes.data.length > 0) {
          // If ID is provided in URL, find it. Otherwise take the first (latest)
          let targetCase;
          if (id) {
            targetCase = casesRes.data.find(c => c.id === id);
          }
          
          if (!targetCase) {
            targetCase = casesRes.data[0];
          }

          setCaseItem(targetCase);
          
          const fetchIntel = async () => {
            try {
              if (isEscalating) return;
              const intelRes = await axios.get(`http://localhost:5001/api/cases/${targetCase.id}/intelligence`);
              
              setIntel(prev => {
                const currentStatus = prev?.current_status;
                const newStatus = intelRes.data.current_status;
                if (currentStatus === 'ESCALATED' && newStatus !== 'ESCALATED') {
                  return { ...intelRes.data, current_status: 'ESCALATED' };
                }
                return intelRes.data;
              });

              setTimeLeft(intelRes.data.recovery_window_mins * 60);
            } catch (err) {
              console.error('Intel Polling Error:', err);
            }
          };

          await fetchIntel();
          interval = setInterval(fetchIntel, 5000);
        }
      } catch (err) {
        console.error('Fetch Error:', err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchData();
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id]); // Re-fetch if the URL ID changes

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const caseStates = [
    { id: '1', label: 'Ingested', status: 'completed' },
    { id: '2', label: 'Verified', status: caseItem?.status === 'VERIFIED' ? 'current' : 'completed' },
    { id: '3', label: 'Node Routing', status: 'pending' },
    { id: '4', label: 'Freeze Request', status: 'pending' },
    { id: '5', label: 'Settled', status: 'pending' },
  ];

  const getRecoveryStatus = (prob) => {
    if (!prob) return { label: 'Calculating...', colorClass: 'dim', hex: 'var(--text-muted)' };
    if (prob < 30) return { label: 'Low Recovery', colorClass: 'danger', hex: 'var(--accent-red)' };
    if (prob < 70) return { label: 'Medium Recovery', colorClass: 'warning', hex: 'var(--accent-amber)' };
    return { label: 'High Recovery', colorClass: 'success', hex: 'var(--accent-green)' };
  };
  const recoveryStatus = getRecoveryStatus(intel?.recovery_probability);

  const handleEscalate = async () => {
    try {
      if (!caseItem || isEscalating) return;
      setIsEscalating(true);
      
      // 1. Immediate DB Update
      const res = await axios.post(`http://localhost:5001/api/cases/${caseItem.id}/escalate`);
      
      // 2. Immediate Local State Update (Don't wait for PDF)
      // This solves the 'flickering' and 'reverting' issue in the UI
      setIntel(prev => ({ ...prev, current_status: 'ESCALATED' }));
      setCaseItem(prev => ({ ...prev, status: 'ESCALATED' }));

      // 3. Background Legal PDF & Dispatch
      await axios.post(`http://localhost:5001/api/generate-legal`, {
        case_id: caseItem.id,
        institution: 'Beneficiary Bank'
      });

    } catch (err) {
      console.error('Escalation or PDF Generation failed', err);
      alert('Action failed. Ensure you have added the UPDATE policy to your Supabase cases table.');
    } finally {
      setIsEscalating(false);
    }
  };

  const milestones = [
    { label: 'Fraud Reported', state: 'CREATED' },
    { label: 'Freeze Sent', state: 'ROUTED' },
    { label: 'Bank Reviewing', state: 'UNDER_BANK_REVIEW' },
    { label: 'Freeze Confirmed', state: 'FREEZE_CONFIRMED' },
    { label: 'Partial Lien Marked', state: 'PARTIALLY_FROZEN' },
    { label: 'Escalated', state: 'ESCALATED' },
    { label: 'Funds Credited', state: 'FUNDS_CREDITED' },
  ];

  const getMilestoneStatus = (milestoneState) => {
    if (!intel) return 'pending';
    const currentIdx = intel.states.indexOf(intel.current_status);
    const targetIdx = intel.states.indexOf(milestoneState);
    if (currentIdx > targetIdx) return 'completed';
    if (currentIdx === targetIdx) return 'current';
    return 'pending';
  };

  if (loading) return (
    <div className="dash-loading">
      <div className="skeleton-grid">
        <div className="skeleton-header"></div>
        <div className="skeleton-kpi-row">
          <div className="skeleton-kpi"></div>
          <div className="skeleton-kpi"></div>
          <div className="skeleton-kpi"></div>
        </div>
        <div className="skeleton-main">
           <div className="skeleton-card large"></div>
           <div className="skeleton-card small"></div>
        </div>
      </div>
      <style>{`
        .dash-loading { background: #020617; height: 100vh; padding: 4rem; overflow: hidden; }
        .skeleton-header { width: 300px; height: 32px; background: #0f172a; border-radius: 4px; margin-bottom: 2rem; }
        .skeleton-kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        .skeleton-kpi { height: 80px; background: #0f172a; border-radius: 8px; }
        .skeleton-main { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
        .skeleton-card { height: 400px; background: #0f172a; border-radius: 8px; }
        .skeleton-card.large { height: 500px; }
        .skeleton-header, .skeleton-kpi, .skeleton-card { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
      `}</style>
    </div>
  );

  if (!caseItem) return (
    <div className="dash-loading-empty">
      <div className="empty-state">
        <Shield size={40} className="dim-icon" />
        <h2>Institutional Access Only</h2>
        <p>Awaiting payload ingestion for active shadow tracing.</p>
        <button onClick={() => window.location.href='/report'} className="btn-enterprise">Initialize Protocol</button>
      </div>
      <style>{`
        .dash-loading-empty { background: #020617; height: 100vh; display: flex; align-items: center; justify-content: center; color: white; text-align: center; }
        .empty-state h2 { font-size: 1.5rem; margin: 1rem 0; font-weight: 600; }
        .empty-state p { color: #64748b; font-size: 0.875rem; margin-bottom: 2rem; }
        .btn-enterprise { background: #0061FF; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; border: none; cursor: pointer; font-size: 0.875rem; }
        .dim-icon { color: #1e293b; }
      `}</style>
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="enterprise-dashboard">
      <div className="grid-overlay"></div>
      
      <motion.div 
        className="container-fluid"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Simplified Premium Header */}
        <div className="db-header">
           <div className="header-meta">
             <div className="breadcrumb">FINANCIAL INTELLIGENCE UNIT / TRACE</div>
             <h1 className="db-title">Recovery Command <span className="text-muted">Center</span></h1>
             <p className="db-subtitle">Tracking <span className="mono">ID-{caseItem.id.slice(0, 8).toUpperCase()}</span> • {caseItem.payload.rail_type || 'UPI_RAIL'}</p>
           </div>
            <div className="header-stats">
               <div className="live-badge mr-4">
                 <div className={`status-dot-large ${intel?.case_health || 'GREEN'}`}></div>
                 CASE HEALTH: {intel?.case_health || 'GREEN'}
               </div>
               <div className="live-badge">
                 <span className="live-pulse"></span>
                 SHADOW TRACING ACTIVE
               </div>
            </div>
         </div>

        {/* Compact KPI Row */}
        <div className="kpi-grid">
          <motion.div className="kpi-card" variants={itemVariants}>
            <div className="kpi-label">RECOVERY PROBABILITY</div>
            <div className="kpi-value">
              <span className="accent-white" style={{ borderBottom: `3px solid ${recoveryStatus.hex}` }}>
                <Counter value={intel?.recovery_probability} />%
              </span>
              <div className={`mini-trend ${recoveryStatus.colorClass}`}>{recoveryStatus.label}</div>
            </div>
            <div className="mini-progress">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${intel?.recovery_probability}%` }} 
                style={{ backgroundColor: recoveryStatus.hex }}
                className="fill-custom"
              ></motion.div>
            </div>
            <Shimmer />
          </motion.div>

          <motion.div className="kpi-card" variants={itemVariants}>
            <div className="kpi-label">RISK COEFFICIENT</div>
            <div className="kpi-value">
              <span className="accent-amber"><Counter value={intel?.risk_score} />.00</span>
              <div className="mini-trend warning">{intel?.previously_reported ? 'REPEAT_OFFENDER' : 'CLEAN_HISTORY'}</div>
            </div>
          </motion.div>

          <motion.div className="kpi-card" variants={itemVariants}>
            <div className="kpi-label">INCIDENT VALUE</div>
            <div className="kpi-value">
              <span className="accent-white">₹{caseItem.amount.toLocaleString('en-IN')}</span>
              <div className="mini-trend dim">Total Claim</div>
            </div>
            <div className="mini-progress">
               <div className="fill-custom" style={{ width: '100%', background: 'rgba(255,255,255,0.05)' }}></div>
            </div>
          </motion.div>

          <motion.div className="kpi-card" variants={itemVariants}>
            <div className="kpi-label">SLA: {intel?.sla_label || 'NEXT_ACTION'}</div>
            <div className="kpi-value">
              <span className={intel?.sla_remaining_mins < 10 ? 'accent-red' : 'accent-white'}>{intel?.sla_remaining_mins || 18}m</span>
              <div className="mini-trend">Remaining</div>
            </div>
            <div className="mini-progress">
              <div className="fill-custom" style={{ width: '40%', background: 'rgba(255,255,255,0.1)' }}></div>
            </div>
          </motion.div>

          <motion.div className="kpi-card" variants={itemVariants}>
            <div className="kpi-label">AI PARSING ENGINE</div>
            <div className="kpi-value">
              <span className="accent-blue text-xs uppercase">{intel?.email_parsing_active ? 'Active' : 'Standby'}</span>
              <div className="mini-trend success">Emails Scanned</div>
            </div>
            <div className="mini-progress">
              {intel?.email_parsing_active && <motion.div animate={{ x: [-40, 200] }} transition={{ repeat: Infinity, duration: 2 }} className="fill-blue-glow"></motion.div>}
            </div>
          </motion.div>
        </div>

        {/* 12-Column Main Layout */}
        <div className="main-layout">
          {/* Left Section: 8 Cols */}
          <div className="col-left">
            <motion.div className="ent-card" variants={itemVariants}>
              <div className="card-header">
                <div className="title-pair">
                  <Zap size={14} className="icon-blue" />
                  <h4>Trace Engine Matrix</h4>
                </div>
                <div className="rail-tag">{intel?.rail} RAIL</div>
              </div>
              <div className="matrix-grid">
                <div className="matrix-item">
                   <label>BENEFICIARY ACCOUNT / VPA</label>
                   <div className="data-val highlight mono">{caseItem.payload.beneficiary_vpa || 'XXXXXXXXXXXX'}</div>
                </div>
                <div className="matrix-item">
                   <label>DOMESTIC BANKING NODE</label>
                   <div className="data-val">{intel?.bank_detected || 'Detecting...'}</div>
                </div>
                <div className="matrix-item">
                   <label>RAIL SPEED FACTOR</label>
                   <div className="data-row">
                      <div className="data-val">{intel?.rail_speed}</div>
                      <div className="status-dot green"></div>
                   </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="ent-card" variants={itemVariants}>
              <div className="card-header">
                <div className="title-pair">
                  <Activity size={14} className="icon-blue" />
                  <h4>Live Recovery Timeline</h4>
                </div>
                <div className="current-state-badge">{intel?.current_status}</div>
              </div>
              <div className="horizontal-timeline">
                {milestones.map((milestone, idx) => {
                  const status = getMilestoneStatus(milestone.state);
                  return (
                    <React.Fragment key={milestone.label}>
                      <div className={`timeline-node ${status}`}>
                        <div className="dot">
                          {status === 'completed' && <CheckCircle2 size={10} />}
                          {status === 'current' && <Loader2 size={10} className="spin" />}
                        </div>
                        <div className="node-info">
                          <span className="node-label">{milestone.label}</span>
                          <span className="node-status text-muted">{status.toUpperCase()}</span>
                        </div>
                      </div>
                      {idx < milestones.length - 1 && <div className="timeline-connector"></div>}
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>

            <div className="background-graph-wrap">
               <svg width="100%" height="60" viewBox="0 0 1000 60" preserveAspectRatio="none">
                  <motion.path 
                    d="M0 50 Q 100 20 200 45 T 400 30 T 600 50 T 800 25 T 1000 40 L 1000 60 L 0 60 Z"
                    fill="url(#grad1)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.05 }}
                    transition={{ duration: 2 }}
                  />
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{stopColor:"#0061FF", stopOpacity:1}} />
                      <stop offset="100%" style={{stopColor:"#0061FF", stopOpacity:0}} />
                    </linearGradient>
                  </defs>
               </svg>
            </div>
          </div>

          {/* Right Section: 4 Cols */}
          <div className="col-right">
            <motion.div className="ent-card sidebar-card" variants={itemVariants}>
              <div className="card-header border-none mb-4">
                <div className="title-pair">
                   <Globe size={14} className="icon-dim" />
                   <h4>Institutional Visibility Panel</h4>
                </div>
              </div>
              <div className="node-stack">
                {intel?.institutional_visibility.map((inst, idx) => (
                  <div key={idx} className={`node-item ${inst.status === 'AWAITING' || inst.status === 'IDLE' ? 'dim' : ''}`}>
                     <div className="node-icon-enterprise"><Landmark size={16}/></div>
                     <div className="node-content">
                        <div className="node-name">{inst.name}</div>
                        <div className={`node-meta ${inst.status === 'COMPLETED' ? 'text-green' : inst.status === 'IN_PROGRESS' || inst.status === 'INVESTIGATING' ? 'text-blue' : ''}`}>
                          {inst.status}
                        </div>
                     </div>
                     <div className={`status-indicator ${inst.status === 'COMPLETED' ? 'online' : inst.status === 'IN_PROGRESS' || inst.status === 'INVESTIGATING' ? 'online pulse' : 'away'}`}></div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div className="ent-card sidebar-card highlight-card" variants={itemVariants}>
              <div className="card-header border-none mb-2">
                 <div className="title-pair">
                    <Shield size={14} className="icon-blue" />
                    <h4>Human-in-the-Loop</h4>
                 </div>
              </div>
              <p className="sidebar-text">Direct intervention protocol for high-value recoveries or complex nodes.</p>
              <button 
                onClick={handleEscalate}
                disabled={intel?.current_status === 'ESCALATED' || isEscalating}
                className="btn-escalate"
              >
                {isEscalating ? (
                  <><Loader2 size={12} className="spin mr-2" /> Initializing Interdiction...</>
                ) : (
                  intel?.current_status === 'ESCALATED' ? 'ESCALATED TO FIU' : 'Escalate to FIU/Ombudsman'
                )}
              </button>

              {intel?.current_status === 'ESCALATED' && (
                <button 
                  onClick={() => window.open(`http://localhost:5001/api/cases/${caseItem.id}/download-legal`, '_blank')}
                  className="btn-download-pdf"
                >
                  <FileLock2 size={12} /> Download Legal Request
                </button>
              )}
            </motion.div>

            <motion.div className="ent-card sidebar-card" variants={itemVariants}>
              <div className="card-header border-none mb-4">
                 <div className="title-pair">
                    <FileLock2 size={14} className="icon-dim" />
                    <h4>Vault Security</h4>
                 </div>
              </div>
              <div className="log-scroller">
                <div className="log-entry">
                   <span className="log-timestamp">14:28:01</span>
                   <span className="log-text">HASH_VALIDATED_SHA256</span>
                </div>
                <div className="log-entry highlight-log">
                   <span className="log-timestamp">14:27:12</span>
                   <span className="log-text">ENCRYPT_PAYLOAD_AES256</span>
                </div>
                <div className="log-entry">
                   <span className="log-timestamp">14:26:45</span>
                   <span className="log-text">AUTH_MOD_FIU_ROUTED</span>
                </div>
              </div>
              <div className="vault-footer">
                <Lock size={10} /> AES-256 MILITARY GRADE
              </div>
            </motion.div>
          </div>
        </div>
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

        .enterprise-dashboard {
          background-color: var(--bg);
          min-height: 100vh;
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          padding-top: 6rem;
          padding-bottom: 4rem;
          position: relative;
          overflow-x: hidden;
        }

        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(var(--border) 1px, transparent 1px), 
                            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.1;
          pointer-events: none;
        }

        .container-fluid {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
          z-index: 1;
        }

        /* Header Styling */
        .db-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 2rem;
        }

        .breadcrumb {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          color: var(--accent-blue);
          margin-bottom: 0.5rem;
        }

        .db-title {
          font-size: 2.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .db-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin: 0.5rem 0 0 0;
        }

        .mono { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #cbd5e1; }

        .live-badge {
          background: rgba(0, 97, 255, 0.05);
          border: 1px solid rgba(0, 97, 255, 0.15);
          padding: 0.6rem 1.25rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--accent-blue);
        }

        .mr-4 { margin-right: 1rem; }

        .status-dot-large { width: 10px; height: 10px; border-radius: 50%; }
        .status-dot-large.GREEN { background: var(--accent-green); box-shadow: 0 0 12px var(--accent-green); }
        .status-dot-large.YELLOW { background: var(--accent-amber); box-shadow: 0 0 12px var(--accent-amber); }
        .status-dot-large.RED { background: var(--accent-red); box-shadow: 0 0 12px var(--accent-red); }

        .live-pulse {
          width: 6px;
          height: 6px;
          background: var(--accent-blue);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--accent-blue);
          animation: anchorPulse 2s infinite;
        }

        @keyframes anchorPulse { 
          0% { transform: scale(1); opacity: 1; } 
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* KPI Row */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .kpi-card {
          background: var(--bg-card);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1.25rem;
          position: relative;
          overflow: hidden;
        }

        .kpi-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0.15em;
          margin-bottom: 1rem;
        }

        .kpi-value {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        .kpi-value span { font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; }
        .accent-blue { color: white; border-bottom: 3px solid var(--accent-blue); }
        .accent-amber { color: var(--accent-amber); }
        .accent-red { color: var(--accent-red); }
        .accent-white { color: white; }

        .mini-trend { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; }
        .mini-trend.success { color: var(--accent-green); }
        .mini-trend.warning { color: var(--accent-amber); }
        .mini-trend.danger { color: var(--accent-red); }
        .mini-trend.dim { color: var(--text-muted); }

        .mini-progress { height: 2px; width: 100%; background: rgba(255,255,255,0.05); margin-top: 1rem; border-radius: 2px; }
        .fill-custom { height: 100%; }

        /* Main Sections */
        .main-layout {
          display: grid;
          grid-template-columns: 8fr 4fr;
          gap: 1rem;
        }

        .ent-card {
          background: var(--bg-card);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          border-left: 3px solid var(--accent-blue);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ent-card:hover { border-color: rgba(0, 97, 255, 0.3); transform: translateY(-2px); box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5); }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .border-none { border: none !important; }

        .title-pair { display: flex; align-items: center; gap: 0.75rem; }
        .title-pair h4 { font-size: 0.95rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; margin: 0; color: var(--text-secondary); }
        .icon-blue { color: var(--accent-blue); }
        .icon-dim { color: var(--text-muted); }

        .rail-tag {
          font-size: 0.6rem;
          font-weight: 900;
          background: #0061FF20;
          color: var(--accent-blue);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }

        .matrix-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 2rem;
        }

        .matrix-item label {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          margin-bottom: 0.75rem;
        }

        .data-val { font-size: 1.15rem; font-weight: 600; color: white; }
        .data-val.highlight { color: var(--accent-blue); }
        .data-val.mono { font-family: 'JetBrains Mono', monospace; font-size: 1rem; word-break: break-all; }

        .data-row { display: flex; align-items: center; gap: 0.5rem; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-dot.green { background: var(--accent-green); box-shadow: 0 0 6px var(--accent-green); }

        /* Timeline Horizontal */
        .horizontal-timeline {
          display: flex;
          align-items: center;
          padding: 0.5rem 0;
        }

        .timeline-node { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; position: relative; }
        .timeline-node .dot {
          width: 20px;
          height: 20px;
          background: #0f172a;
          border: 1px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-blue);
          z-index: 2;
        }

        .timeline-node.completed .dot { background: var(--accent-blue); color: white; border-color: var(--accent-blue); }
        .timeline-node.current .dot { border-color: var(--accent-blue); background: #0061FF20; }

        .node-info { text-align: center; }
        .node-label { display: block; font-size: 0.75rem; font-weight: 700; color: white; white-space: nowrap; }
        .node-status { display: block; font-size: 0.65rem; font-weight: 800; color: var(--text-muted); margin-top: 0.15rem; }

        .timeline-connector { flex-grow: 1; height: 1px; background: var(--border); margin: 0 0.5rem; transform: translateY(-13px); }

        /* Sidebar Matrix */
        .node-stack { display: flex; flex-direction: column; gap: 0.75rem; }
        .node-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #1e293b20;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          border: 1px solid var(--border);
        }

        .node-icon-enterprise {
          width: 32px;
          height: 32px;
          background: #0f172a;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
        }

        .node-content { flex-grow: 1; }
        .node-name { font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); }
        .node-meta { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); margin-top: 0.1rem; }
        .text-green { color: var(--accent-green) !important; }

        .status-indicator { width: 4px; height: 4px; border-radius: 50%; }
        .status-indicator.online { background: var(--accent-green); }
        .status-indicator.away { background: var(--text-muted); }

        .dim { opacity: 0.5; }

        .log-scroller { display: flex; flex-direction: column; gap: 0.6rem; height: 120px; overflow-y: auto; }
        .log-entry { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; padding: 0.4rem 0.6rem; border-radius: 2px; }
        .log-timestamp { color: var(--text-muted); margin-right: 0.75rem; }
        .log-text { color: var(--text-secondary); }
        .highlight-log { background: #0061FF10; color: var(--accent-blue); }

        .vault-footer { 
          margin-top: 1.5rem; 
          font-size: 0.7rem; 
          font-weight: 800; 
          color: var(--accent-green); 
          letter-spacing: 0.12em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-escalate {
          width: 100%;
          background: var(--accent-red);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 1rem;
        }

        .btn-escalate:hover {
          filter: brightness(1.2);
          transform: translateY(-1px);
        }

        .btn-escalate:disabled {
          background: var(--text-muted);
          cursor: not-allowed;
          transform: none;
        }

        .btn-download-pdf {
          width: 100%;
          background: rgba(0, 97, 255, 0.1);
          color: var(--accent-blue);
          border: 1px solid var(--accent-blue);
          padding: 0.75rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-download-pdf:hover {
          background: rgba(0, 97, 255, 0.2);
        }

        .sidebar-text { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; margin: 0.5rem 0; }
        .highlight-card { border-left: 3px solid var(--accent-red) !important; background: rgba(239, 68, 68, 0.02); }
        .current-state-badge { font-size: 0.6rem; font-weight: 900; background: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: 4px; color: var(--text-secondary); }
        .text-xs { font-size: 0.75rem; }
        .text-blue { color: var(--accent-blue) !important; }
        .mr-2 { margin-right: 0.5rem; }
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .pulse { animation: pulse-opacity 2s infinite; }
        @keyframes pulse-opacity { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        .fill-blue-glow {
          height: 100%;
          width: 40px;
          background: linear-gradient(90deg, transparent, var(--accent-blue), transparent);
          box-shadow: 0 0 10px var(--accent-blue);
        }

        .background-graph-wrap { position: absolute; bottom: 0; left: 0; right: 0; pointer-events: none; opacity: 0.3; }

        @media (max-width: 1024px) {
          .kpi-grid { grid-template-columns: 1fr 1fr; }
          .main-layout { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .kpi-grid { grid-template-columns: 1fr; }
          .matrix-grid { grid-template-columns: 1fr; gap: 1rem; }
          .horizontal-timeline { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .timeline-connector { height: 20px; width: 1px; transform: none; margin: 0 10px; }
          .container-fluid { padding: 0 1rem; }
          .db-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Dashboard;
