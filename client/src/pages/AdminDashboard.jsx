import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, ShieldCheck, AlertCircle, Clock, 
  ArrowRight, Search, Filter, CheckCircle, 
  XCircle, RotateCcw, ExternalLink, Database, 
  PieChart, History, Lock, UserCheck, 
  ChevronRight, ArrowLeft, Loader2, Info
} from 'lucide-react';
import axios from 'axios';

const ROLES = {
  FRAUD_OFFICER: { name: 'Fraud Officer', permissions: ['REVIEW', 'FREEZE'] },
  SENIOR_OFFICER: { name: 'Senior Officer', permissions: ['REJECT', 'ESCALATE'] },
  SUPERVISOR: { name: 'Supervisor', permissions: ['REVERSE', 'CLOSE'] }
};

const AdminDashboard = () => {
  const [user, setUser] = useState(null); // { username, role }
  const [loginForm, setLoginForm] = useState({ username: '', role: 'FRAUD_OFFICER' });
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');

  const fetchData = async () => {
    try {
      // Use atomic fetching to prevent one failure from blocking the entire dashboard
      const results = await Promise.allSettled([
        axios.get('http://localhost:5001/api/cases'),
        axios.get('http://localhost:5001/api/admin/analytics'),
        axios.get('http://localhost:5001/api/admin/audit-logs')
      ]);

      if (results[0].status === 'fulfilled') {
        const newData = results[0].value.data;
        console.log(`[AdminEngine] Synced ${newData.length} cases at ${new Date().toLocaleTimeString()}`);
        setCases(newData);
        
        // Dynamic re-sync for selected case internal data
        if (selectedCase) {
          const freshSelected = newData.find(c => c.id === selectedCase.id);
          if (freshSelected) setSelectedCase(freshSelected);
        }
      } else {
        console.error('[AdminEngine] Case Inflow Failed:', results[0].reason);
      }

      if (results[1].status === 'fulfilled') setStats(results[1].value.data);
      if (results[2].status === 'fulfilled') setAuditLogs(results[2].value.data);
      
      setLoading(false);
    } catch (err) {
      console.error('[AdminEngine] Critical Sync Error:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      // Professional high-frequency polling for triage environments
      const interval = setInterval(fetchData, 3000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleUpdateStatus = async (status, extra = {}) => {
    try {
      setIsUpdating(true);
      await axios.patch(`http://localhost:5001/api/cases/${selectedCase.id}/status`, {
        status,
        officer_name: user.username,
        ...extra
      });
      fetchData();
      setSelectedCase(null);
      setShowPartialModal(false);
    } catch (err) {
      console.error('[AdminAction] Update Failed:', err);
      const errorMsg = err.response?.data?.details || err.response?.data?.error || 'Database connection error';
      alert(`POLICE ACTION FAILED: ${errorMsg}\n\nThis usually happens when Supabase RLS policies are missing.`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="login-viewport">
        <div className="tactical-grid"></div>
        <div className="glow-orb"></div>
        
        <motion.div 
          className="login-node glass-panel" 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="node-header">
            <div className="node-icon">
              <Building2 size={24} className="text-cobalt" />
            </div>
            <div className="node-title">
              <span className="node-label">BANKING_GATEWAY // NODE_42</span>
              <h2>B2B Triage Access</h2>
            </div>
          </div>

          <div className="node-body">
            <p className="node-description">Internal Fraud Operations Unit Terminal. All sessions are monitored and recorded via AES-256 encrypted logging.</p>
            
            <div className="login-form-stack">
              <div className="terminal-input-group">
                <label>OPERATIONAL_ID</label>
                <div className="input-wrapper">
                  <UserCheck size={14} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="ADMIN_USER_01" 
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  />
                </div>
              </div>

              <div className="terminal-input-group">
                <label>CLEARANCE_LEVEL</label>
                <div className="input-wrapper">
                  <Lock size={14} className="input-icon" />
                  <select 
                    value={loginForm.role}
                    onChange={(e) => setLoginForm({...loginForm, role: e.target.value})}
                  >
                    <option value="FRAUD_OFFICER">Fraud Officer (TIER_1)</option>
                    <option value="SENIOR_OFFICER">Senior Nodal (TIER_2)</option>
                    <option value="SUPERVISOR">Operations Lead (TIER_3)</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              className="terminal-btn-primary" 
              onClick={() => setUser(loginForm)}
              disabled={!loginForm.username}
            >
              <span>AUTHORIZE_TERMINAL</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="node-footer">
            <div className="security-tag">
              <ShieldCheck size={10} />
              <span>STRICT_PROTOCOL_ACTIVE</span>
            </div>
            <div className="node-version">V4.2.0</div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-console dashboard-viewport">
      <div className="tactical-grid"></div>
      
      <header className="admin-header container">
        <div className="flex justify-between items-end">
          <div className="header-left">
            <motion.div 
              className="admin-badge-new"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="pulse-ring"></div>
              <span>OPERATIONAL NODE: ACTIVE</span>
              <span className="live-indicator-pill">LIVE SYNC</span>
            </motion.div>
            <h1 className="title-gradient-major">B2B <span className="text-cobalt">Triage Center</span></h1>
            <div className="institutional-meta">
              <span className="meta-tag">FR-OPS // {user.role}</span>
              <span className="meta-divider"></span>
              <span className="meta-tag mono">LATENCY: 14ms</span>
              <span className="meta-divider"></span>
              <span className="meta-tag mono">TXN_ID: {Math.random().toString(36).slice(2, 10).toUpperCase()}</span>
            </div>
          </div>
          
          <motion.div 
            className="admin-user-profile-card glass-card"
            whileHover={{ y: -2 }}
          >
            <div className="profile-icon-wrap">
              <UserCheck size={18} />
            </div>
            <div className="profile-info">
              <div className="profile-name">{user.username}</div>
              <div className="profile-role">{ROLES[user.role].name}</div>
            </div>
            <div className="status-indicator online"></div>
          </motion.div>
        </div>
      </header>

      <div className="container mt-12 grid grid-cols-5 gap-5">
        {[
          { label: 'Total Inflow', val: stats?.total_cases || 0, icon: <AlertCircle size={16}/>, color: '#f8fafc', trend: '+12%' },
          { label: 'Full Freezes', val: stats?.full_freeze || 0, icon: <CheckCircle size={16}/>, color: '#10b981', trend: '+5%' },
          { label: 'Partial Liens', val: stats?.partial_freeze || 0, icon: <PieChart size={16}/>, color: '#f59e0b', trend: 'Stable' },
          { label: 'Rejected', val: stats?.rejected || 0, icon: <XCircle size={16}/>, color: '#ef4444', trend: '-2%' },
          { label: 'Recovered', val: `₹${(stats?.total_recovered || 0).toLocaleString()}`, icon: <ShieldCheck size={16}/>, color: '#3b82f6', trend: 'Live' }
        ].map((s, i) => (
          <motion.div 
            className="kpi-card glass-card-premium" 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="kpi-header">
              <div className="kpi-icon" style={{ backgroundColor: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <div className="kpi-trend" style={{ color: s.trend.includes('-') ? '#ef4444' : '#10b981' }}>{s.trend}</div>
            </div>
            <div className="kpi-body">
              <label>{s.label}</label>
              <div className="kpi-value mono" style={{ color: s.color }}>{s.val}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <main className="container mt-8 grid grid-cols-12 gap-6 pb-20">
        
        {/* Left: Queue */}
        <div className="col-span-8">
          <div className="glass-card queue-container-premium">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/40">
              <div className="flex items-center gap-3">
                <Database size={18} className="text-cobalt" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Incoming Triage Queue</h3>
              </div>
              <div className="search-bar-professional">
                <Search size={14} className="text-slate-500" />
                <input type="text" placeholder="Search by Case ID or amount..." />
              </div>
            </div>
            
            <div className="queue-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>CASE_ID</th>
                    <th>ORIGIN</th>
                    <th>VALUATION</th>
                    <th>RISK_COEF</th>
                    <th>SLA_REMAINING</th>
                    <th>STATUS</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cases.length > 0 ? (
                    cases.map(c => (
                      <tr key={c.id} className={selectedCase?.id === c.id ? 'active-row' : ''} onClick={() => setSelectedCase(c)}>
                        <td className="mono text-xs text-blue">#{c.id.slice(0, 8)}</td>
                        <td>
                          <span className={`origin-badge ${c.case_origin === 'OCR' ? 'ocr' : 'manual'}`}>
                            {c.case_origin === 'OCR' ? '🟢 OCR' : '🟡 MANUAL'}
                          </span>
                        </td>
                        <td className="mono">₹{c.amount.toLocaleString()}</td>
                        <td>
                          <div className="risk-indicator">
                            <div className="risk-bar" style={{ width: `${c.legitimacy_score || 50}%`, backgroundColor: (c.legitimacy_score || 50) > 70 ? 'var(--emerald)' : 'var(--amber)' }}></div>
                          </div>
                        </td>
                        <td>
                          <span className="sla-pill text-xs">
                            <Clock size={10} /> 12m
                          </span>
                        </td>
                        <td>
                          <span className={`status-tag st-${c.status.toLowerCase()}`}>
                            {c.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td><ChevronRight size={14} className="text-muted" /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        No pending cases in triage queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Actions & Audit */}
        <div className="col-span-4">
          <AnimatePresence mode="wait">
            {!selectedCase ? (
              <motion.div key="empty" className="glass-card audit-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="p-6 border-b border-white/5">
                  <h3 className="flex items-center gap-2"><History size={16} /> Operational Audit Log</h3>
                </div>
                <div className="audit-items">
                  {auditLogs.map((log, i) => (
                    <div className="audit-item" key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-blue">{log.admin_name}</span>
                        <span className="text-xs text-muted">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-xs text-slate-300">{log.action.replace(/_/g, ' ')} for #{log.case_id.slice(0, 8)}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="detail" className="detail-node glass-panel" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
                <div className="node-header forensic-header">
                  <button onClick={() => setSelectedCase(null)} className="back-link">
                    <ArrowLeft size={14} /> <span>BACK_TO_QUEUE</span>
                  </button>
                  <div className="case-id-tag mono">CASE_{selectedCase.id.slice(0, 8)}</div>
                </div>
                
                <div className="node-body scrollable">
                  <section className="intel-section">
                    <div className="section-label">TRANSACTION_INTEL</div>
                    <div className="intel-grid">
                      <div className="intel-field">
                        <label>VALUATION (INR)</label>
                        <div className="value mono">₹{selectedCase.amount.toLocaleString()}</div>
                      </div>
                      <div className="intel-field">
                        <label>SOURCE_ORIGIN</label>
                        <div className="value">{selectedCase.case_origin}</div>
                      </div>
                      <div className="intel-field">
                        <label>RAIL_TYPE</label>
                        <div className="value mono">UPI/IMPS</div>
                      </div>
                      <div className="intel-field">
                        <label>INTEGRITY_SCORE</label>
                        <div className="value mono text-emerald">{selectedCase.legitimacy_score || 88}%</div>
                      </div>
                    </div>
                  </section>

                  <section className="ops-section">
                    <div className="section-label">COMMAND_CENTER</div>
                    <div className="action-grid-ops">
                      <button 
                        className="op-btn op-freeze"
                        onClick={() => handleUpdateStatus('FREEZE_CONFIRMED', { frozen_amount: selectedCase.amount })}
                        disabled={isUpdating || !ROLES[user.role].permissions.includes('FREEZE')}
                      >
                        <div className="op-icon"><ShieldCheck size={18} /></div>
                        <div className="op-text">
                          <span className="op-title">CONFIRM_FULL_LIEN</span>
                          <span className="op-sub">Freeze entire balance</span>
                        </div>
                      </button>

                      <button 
                        className="op-btn op-partial"
                        onClick={() => setShowPartialModal(true)}
                        disabled={isUpdating || !ROLES[user.role].permissions.includes('FREEZE')}
                      >
                        <div className="op-icon"><PieChart size={18} /></div>
                        <div className="op-text">
                          <span className="op-title">PARTIAL_BALANCE_LIEN</span>
                          <span className="op-sub">Freeze available funds only</span>
                        </div>
                      </button>

                      <button 
                        className="op-btn op-reject"
                        onClick={() => handleUpdateStatus('REJECTED')}
                        disabled={isUpdating || !ROLES[user.role].permissions.includes('REJECT')}
                      >
                        <div className="op-icon"><XCircle size={18} /></div>
                        <div className="op-text">
                          <span className="op-title">DISMISS_INTELLIGENCE</span>
                          <span className="op-sub">Mark as false-positive</span>
                        </div>
                      </button>

                      <button 
                        className="op-btn op-escalate"
                        onClick={() => handleUpdateStatus('ESCALATED')}
                        disabled={isUpdating || !ROLES[user.role].permissions.includes('REJECT')}
                      >
                        <div className="op-icon"><ExternalLink size={18} /></div>
                        <div className="op-text">
                          <span className="op-title">ESCALATE_TO_SENIOR</span>
                          <span className="op-sub">Route to tier-2 nodal officer</span>
                        </div>
                      </button>
                    </div>
                  </section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Partial Freeze Modal */}
      <AnimatePresence>
        {showPartialModal && (
          <div className="modal-overlay">
            <motion.div className="modal-card glass-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <h3>Institutional Partial Freeze</h3>
              <p className="text-muted text-sm mb-6">Enter the amount currently available in the beneficiary bank account. The system will calculate the delta.</p>
              
              <div className="modal-form">
                <div className="input-group mb-6">
                  <label>Available Balance (INR)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5400" 
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                  />
                  <div className="text-tiny mt-2 text-blue">System will automatically lien: ₹{Math.min(selectedCase.amount, partialAmount || 0)}</div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 btn-secondary" onClick={() => setShowPartialModal(false)}>Cancel</button>
                  <button 
                    className="flex-1 btn-primary" 
                    onClick={() => handleUpdateStatus('PARTIALLY_FROZEN', { frozen_amount: parseFloat(partialAmount), total_balance: parseFloat(partialAmount) })}
                    disabled={!partialAmount || isUpdating}
                  >
                    Execute Freeze
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="admin-footer-static container">
        <div className="footer-line"></div>
        <div className="footer-content flex justify-between items-center">
          <div className="text-tiny text-muted uppercase tracking-widest">© 2026 FraudShield B2B Core • Version 4.2.0_TRIAGE</div>
          <div className="flex gap-6 text-tiny text-muted">
            <span className="footer-stat"><span className="dot emerald"></span> SLA_HEALTH: NOMINAL</span>
            <span className="footer-stat"><span className="dot cobalt"></span> SECURE_NODE_ACTIVE</span>
          </div>
        </div>
      </footer>

      <style>{`
        :root {
          --cobalt: #3b82f6;
          --cobalt-dim: rgba(59, 130, 246, 0.1);
          --emerald: #10b981;
          --amber: #f59e0b;
          --rose: #f43f5e;
          --glass-border: rgba(255, 255, 255, 0.08);
          --glass-bg: rgba(15, 23, 42, 0.6);
        }
        .dashboard-viewport {
          background-color: #020617;
          min-height: 100vh;
          position: relative;
          color: #f1f5f9;
          overflow-x: hidden;
          padding-top: 6rem;
        }

        .tactical-grid {
          position: absolute; inset: 0;
          background-image: 
            linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          mask-image: radial-gradient(circle at 40% 40%, black, transparent 90%);
          z-index: 0;
        }

        .login-viewport {
          height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center;
          background: #020617; position: fixed; inset: 0; z-index: 99999;
        }

        .glow-orb {
          position: absolute; width: 600px; height: 600px; background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
          top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;
        }

        .glass-panel {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        /* Login Node */
        .login-node {
          width: 100%; max-width: 480px; padding: 2.5rem; border-radius: 20px; position: relative;
        }
        .node-header { display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem; }
        .node-icon { 
          width: 48px; height: 48px; background: rgba(59, 130, 246, 0.1); 
          display: flex; align-items: center; justify-content: center; border-radius: 12px;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .node-label { font-size: 0.6rem; font-family: 'JetBrains Mono'; color: var(--cobalt); display: block; margin-bottom: 0.25rem; font-weight: 800; }
        .node-title h2 { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; }

        .node-description { font-size: 0.85rem; color: #94a3b8; line-height: 1.6; margin-bottom: 2rem; }
        .login-form-stack { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 2rem; }

        .terminal-input-group label { display: block; font-size: 0.65rem; font-family: 'JetBrains Mono'; font-weight: 800; color: #475569; margin-bottom: 0.6rem; }
        .input-wrapper {
          position: relative; display: flex; align-items: center;
          background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; transition: all 0.2s;
        }
        .input-wrapper:focus-within { border-color: var(--cobalt); background: rgba(0,0,0,0.5); box-shadow: 0 0 15px rgba(59, 130, 246, 0.15); }
        .input-icon { position: absolute; left: 1rem; color: #475569; }
        .input-wrapper input, .input-wrapper select {
          width: 100%; background: transparent; border: none; padding: 0.85rem 1rem 0.85rem 2.75rem; color: white; outline: none; font-size: 0.9rem;
        }

        .terminal-btn-primary {
          width: 100%; padding: 1rem; background: var(--cobalt); color: white; border-radius: 10px; border: none; font-weight: 800;
          font-family: 'JetBrains Mono'; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 0.75rem;
          transition: all 0.2s; cursor: pointer;
        }
        .terminal-btn-primary:hover { filter: brightness(1.2); transform: translateY(-1px); box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4); }

        .node-footer { display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.05); }
        .security-tag { display: flex; align-items: center; gap: 0.5rem; color: var(--emerald); font-size: 0.6rem; font-family: 'JetBrains Mono'; font-weight: 800; }
        .node-version { font-size: 0.6rem; color: #475569; font-weight: 800; font-family: 'JetBrains Mono'; }

        /* Detail Node */
        .detail-node { border-radius: 16px; display: flex; flex-direction: column; height: fit-content; }
        .forensic-header { justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .back-link { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #64748b; font-size: 0.7rem; font-weight: 800; cursor: pointer; }
        .case-id-tag { background: rgba(59, 130, 246, 0.1); color: var(--cobalt); padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.65rem; }

        .intel-section { padding: 1.5rem; }
        .section-label { font-size: 0.65rem; font-family: 'JetBrains Mono'; font-weight: 800; color: #475569; margin-bottom: 1.25rem; }
        .intel-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .intel-field { background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.03); }
        .intel-field label { display: block; font-size: 0.55rem; color: #475569; font-weight: 800; margin-bottom: 0.5rem; }
        .intel-field .value { font-size: 1.1rem; font-weight: 800; }

        .ops-section { padding: 1.5rem; background: rgba(0,0,0,0.15); border-radius: 0 0 16px 16px; }
        .action-grid-ops { display: flex; flex-direction: column; gap: 0.75rem; }
        .op-btn { 
          display: flex; gap: 1rem; align-items: center; width: 100%; padding: 1rem; 
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px;
          text-align: left; transition: all 0.2s; cursor: pointer; color: #f1f5f9;
        }
        .op-btn:hover:not(:disabled) { background: rgba(255,255,255,0.06); transform: translateX(4px); }
        .op-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .op-title { display: block; font-size: 0.75rem; font-weight: 800; font-family: 'JetBrains Mono'; }
        .op-sub { display: block; font-size: 0.6rem; color: #64748b; margin-top: 0.1rem; }

        .op-partial .op-icon { background: rgba(245, 158, 11, 0.1); color: var(--amber); }
        .op-partial:hover { border-color: var(--amber); }

        .op-reject .op-icon { background: rgba(244, 63, 94, 0.1); color: var(--rose); }
        .op-reject:hover { border-color: var(--rose); }

        .op-escalate .op-icon { background: rgba(59, 130, 246, 0.1); color: var(--cobalt); }
        .op-escalate:hover { border-color: var(--cobalt); }

        .scrollable { max-height: 80vh; overflow-y: auto; }
        .scrollable::-webkit-scrollbar { width: 4px; }
        
        /* Utils update */
        .text-emerald { color: var(--emerald) !important; }
        .mt-12 { margin-top: 3rem; }
        .mt-8 { margin-top: 2rem; }
        .pb-20 { padding-bottom: 5rem; }
        .container { max-width: 1540px; margin: 0 auto; padding: 0 4rem; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-end { align-items: flex-end; }
        .grid { display: grid; }
        .grid-cols-5 { grid-template-columns: repeat(5, 1fr); }
        .grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
        .col-span-8 { grid-column: span 8 / span 8; }
        .col-span-4 { grid-column: span 4 / span 4; }
        .gap-5 { gap: 1.25rem; }
        .gap-6 { gap: 1.5rem; }
        .mono { font-family: 'JetBrains Mono', monospace; }

        .title-gradient-major {
          font-size: 3.25rem; font-weight: 900; letter-spacing: -0.04em;
          background: linear-gradient(135deg, #fff 0%, #64748b 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          line-height: 1.1; margin-bottom: 1rem;
        }
        .text-cobalt { color: var(--cobalt) !important; -webkit-text-fill-color: var(--cobalt) !important; }

        .institutional-meta { display: flex; align-items: center; gap: 1.25rem; }
        .meta-tag { font-size: 0.75rem; color: #475569; font-weight: 700; letter-spacing: 0.02em; }
        .meta-divider { width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.1); }

        .admin-user-profile-card {
          display: flex; align-items: center; gap: 1.25rem; padding: 0.85rem 1.75rem;
          background: var(--glass-bg) !important; border: 1px solid var(--glass-border) !important;
          border-radius: 14px; position: relative;
        }
        .profile-icon-wrap {
          width: 44px; height: 44px; border-radius: 12px;
          background: var(--cobalt-dim); color: var(--cobalt);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }
        .profile-name { font-weight: 700; font-size: 1rem; color: #f8fafc; }
        .profile-role { font-size: 0.65rem; color: #64748b; font-weight: 800; text-transform: uppercase; margin-top: 0.15rem; }
        .status-indicator.online { 
          position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; 
          background: var(--emerald); border-radius: 50%; box-shadow: 0 0 12px var(--emerald); 
        }

        /* KPI Cards */
        .kpi-card {
          padding: 1.75rem; display: flex; flex-direction: column; gap: 1.5rem;
          background: rgba(13, 21, 38, 0.45) !important; 
          border: 1px solid var(--glass-border) !important;
          border-bottom: 2px solid rgba(255,255,255,0.03) !important;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .kpi-card:hover { transform: translateY(-5px); border-bottom-color: var(--cobalt) !important; background: rgba(13, 21, 38, 0.65) !important; }
        .kpi-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .kpi-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
        .kpi-trend { font-size: 0.6rem; font-weight: 900; padding: 0.25rem 0.6rem; background: rgba(0,0,0,0.2); border-radius: 6px; border: 1px solid rgba(255,255,255,0.03); }
        .kpi-body label { font-size: 0.65rem; color: #475569; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem; display: block; }
        .kpi-value { font-size: 1.85rem; font-weight: 900; letter-spacing: -0.02em; }

        /* Queue Styling */
        .queue-container-premium { 
          background: var(--glass-bg) !important; border: 1px solid var(--glass-border) !important; border-radius: 16px; overflow: hidden; 
          box-shadow: 0 20px 40px -20px rgba(0,0,0,0.5);
        }
        .bg-slate-900\/40 { background: rgba(15, 23, 42, 0.4); border-bottom: 1px solid var(--glass-border); }
        .search-bar-professional {
          display: flex; align-items: center; gap: 1rem;
          background: rgba(0,0,0,0.3); padding: 0.65rem 1.25rem; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1); width: 340px; transition: all 0.3s;
        }
        .search-bar-professional:focus-within { border-color: var(--cobalt); background: rgba(0,0,0,0.5); }
        .search-bar-professional input {
          background: transparent; border: none; color: white; width: 100%; outline: none; font-size: 0.85rem; font-weight: 500;
        }

        .admin-table { width: 100%; border-collapse: collapse; }
        .admin-table th { padding: 1.25rem 1.75rem; font-size: 0.65rem; font-weight: 800; color: #475569; text-align: left; text-transform: uppercase; letter-spacing: 0.12em; background: rgba(0,0,0,0.2); }
        .admin-table td { padding: 1.25rem 1.75rem; font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: middle; }
        .admin-table tr { cursor: pointer; transition: all 0.2s; }
        .admin-table tr:hover { background: rgba(59, 130, 246, 0.04); }
        .admin-table tr.active-row { background: rgba(59, 130, 246, 0.08); }

        .origin-badge { font-size: 0.6rem; font-weight: 900; padding: 0.35rem 0.75rem; border-radius: 6px; letter-spacing: 0.02em; }
        .origin-badge.ocr { background: rgba(16, 185, 129, 0.1); color: var(--emerald); border: 1px solid rgba(16, 185, 129, 0.2); }
        .origin-badge.manual { background: rgba(245, 158, 11, 0.1); color: var(--amber); border: 1px solid rgba(245, 158, 11, 0.2); }

        .status-tag { 
          font-size: 0.65rem; font-weight: 900; padding: 0.35rem 0.85rem; border-radius: 6px; text-transform: uppercase;
          background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.05);
        }
        .st-freeze_confirmed { background: rgba(16, 185, 129, 0.2); color: var(--emerald); border-color: rgba(16, 185, 129, 0.3); }
        .st-partially_frozen { background: rgba(245, 158, 11, 0.2); color: var(--amber); border-color: rgba(245, 158, 11, 0.3); }
        .st-rejected { background: rgba(244, 63, 94, 0.2); color: var(--rose); border-color: rgba(244, 63, 94, 0.3); }

        /* Sidebar Audit */
        .audit-panel { background: var(--glass-bg); border-radius: 16px; border: 1px solid var(--glass-border); padding: 0; }
        .audit-item { padding: 1.25rem 1.75rem; border-left: 3px solid var(--cobalt); background: rgba(0,0,0,0.1); margin: 1rem; border-radius: 0 8px 8px 0; }
        
        /* Action buttons */
        .btn-action {
          width: 100%; padding: 1.25rem 1.5rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02); transition: all 0.3s; color: #94a3b8;
        }
        .btn-action:hover:not(:disabled) { background: rgba(255,255,255,0.06); color: white; transform: scale(1.02); }
        .btn-action.approve:hover { border-color: var(--emerald); color: var(--emerald); }
        .btn-action.partial:hover { border-color: var(--amber); color: var(--amber); }
        .btn-action.reject:hover { border-color: var(--rose); color: var(--rose); }

        .login-overlay { 
          position: fixed; top: 0; left: 0; bottom: 0; right: 0;
          background: var(--slate-950); z-index: 99999; 
          display: flex; align-items: center; justify-content: center; 
        }
        .login-card { 
          width: 100%; max-width: 440px; padding: 4rem; text-align: center; 
          background: rgba(15, 23, 42, 0.8); border: 1px solid var(--glass-border);
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8); backdrop-filter: blur(30px); border-radius: 24px;
        }

        .admin-footer-static {
          padding: 4rem 2rem;
          margin-top: 4rem;
        }
        .footer-line { width: 100%; height: 1px; background: linear-gradient(to right, var(--glass-border), transparent); margin-bottom: 2rem; }
        .footer-stat { display: flex; align-items: center; gap: 0.5rem; font-weight: 800; letter-spacing: 0.05em; }
        .dot { width: 6px; height: 6px; border-radius: 50%; }
        .dot.emerald { background: var(--emerald); box-shadow: 0 0 8px var(--emerald); }
        .dot.cobalt { background: var(--cobalt); box-shadow: 0 0 8px var(--cobalt); }

        /* Utils */
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .items-end { align-items: flex-end; }
        .gap-3 { gap: 0.75rem; }
        .gap-5 { gap: 1.5rem; }
        .grid { display: grid; }
        .grid-cols-5 { grid-template-columns: repeat(5, 1fr); }
        .grid-cols-12 { grid-template-columns: repeat(12, 1fr); }
        .col-span-8 { grid-column: span 8 / span 8; }
        .col-span-4 { grid-column: span 4 / span 4; }
        .container { max-width: 1400px; margin: 0 auto; padding: 0 2rem; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .mt-12 { margin-top: 3rem; }
        .mt-8 { margin-top: 2rem; }
        .p-6 { padding: 1.5rem; }

        /* Modals */
        .modal-overlay { 
          position: fixed; inset: 0; background: rgba(0,0,0,0.85); 
          backdrop-filter: blur(8px); z-index: 100000; 
          display: flex; align-items: center; justify-content: center; 
        }
        .modal-card { width: 100%; max-width: 480px; padding: 3rem; background: var(--slate-900); border-radius: 20px; border: 1px solid var(--glass-border); }
        .input-group label { display: block; font-size: 0.7rem; font-weight: 800; margin-bottom: 0.75rem; color: #475569; text-transform: uppercase; }
        .input-group input { 
          background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); padding: 1rem; border-radius: 10px; 
          color: white; width: 100%; font-size: 1.5rem; font-family: 'JetBrains Mono', monospace; outline: none; 
          transition: border-color 0.2s;
        }
        .input-group input:focus { border-color: var(--cobalt); }

        .text-green { color: var(--emerald); }
        .text-blue { color: var(--cobalt); }
        .text-muted { color: #64748b; }
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.875rem; }
        .font-bold { font-weight: 700; }
        .flex-1 { flex: 1; }
        .w-full { width: 100%; }

        .risk-indicator { width: 80px; height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
        .risk-bar { height: 100%; border-radius: 10px; transition: width 1s ease-out; }

        .sla-pill { 
          background: rgba(244, 63, 94, 0.1); color: var(--rose); padding: 0.35rem 0.75rem; 
          border-radius: 6px; font-weight: 800; display: inline-flex; align-items: center; gap: 0.5rem;
          border: 1px solid rgba(244, 63, 94, 0.2); font-size: 0.65rem;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
