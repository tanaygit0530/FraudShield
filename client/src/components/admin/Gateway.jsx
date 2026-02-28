import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, UserCheck, Lock, ArrowRight, Loader2, 
  Database, AlertCircle, ExternalLink, PieChart, Clock, History, RotateCcw
} from 'lucide-react';

const Gateway = ({ loginForm, setLoginForm, handleLogin, isAuthenticating, gateStats }) => {
  return (
    <div className="login-viewport terminal-gateway">
      <div className="tactical-grid"></div>
      <div className="glow-orb"></div>
      
      {/* System Status Strip */}
      <div className="system-status-strip">
        <div className="status-item">
          <div className="status-dot pulse-emerald"></div>
          <span className="mono">NODE_STATUS: OPERATIONAL</span>
        </div>
        <div className="status-item">
          <Lock size={10} className="text-cobalt" />
          <span className="mono">ENCRYPTION: AES-256_MILITARY_GRADE</span>
        </div>
        <div className="status-item">
          <RotateCcw size={10} className="text-emerald" />
          <span className="mono">REALTIME_SYNC: ACTIVE</span>
        </div>
        <div className="status-item">
          <span className="mono">PROTOCOL: V4.2.0</span>
        </div>
      </div>

      <div className="gateway-split-container container">
        {/* Left: Terminal Access */}
        <motion.div 
          className="login-node glass-panel forensic-glow" 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="node-header">
            <div className="node-icon">
              <Building2 size={24} className="text-cobalt" />
            </div>
            <div className="node-title">
              <span className="node-label">GATEWAY_AUTHORIZATION // SECURE_PORT</span>
              <h2>B2B Fraud Operations Access</h2>
            </div>
          </div>

          <div className="node-body">
            <p className="node-description">Access to this terminal is restricted to authorized personnel. All keystrokes and session actions are recorded via high-fidelity forensic logging.</p>
            
            <div className="login-form-stack">
              <div className="terminal-input-group">
                <label>OPERATIONAL_ID</label>
                <div className="input-wrapper">
                  <UserCheck size={14} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="ENTER_OPERATIONAL_ID" 
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  />
                </div>
              </div>

              <div className="terminal-input-group">
                <div className="flex justify-between items-center">
                  <label>CLEARANCE_LEVEL</label>
                  <span className="status-pill-small nodal_officer">
                    🔴 TIER_3
                  </span>
                </div>
                <div className="input-wrapper">
                  <Lock size={14} className="input-icon" />
                  <select 
                    value={loginForm.role}
                    onChange={(e) => setLoginForm({...loginForm, role: e.target.value})}
                  >
                    <option value="NODAL_OFFICER">Nodal Officer (TIER_3)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="protocol-status-box">
              <div className="flex justify-between items-center mb-2">
                <span className="text-tiny mono text-muted">STRICT_PROTOCOL_STATUS</span>
                <span className="text-tiny mono text-emerald">READY</span>
              </div>
              <div className="protocol-bar">
                <div className="protocol-fill"></div>
              </div>
            </div>

            <button 
              className="terminal-btn-primary big-btn" 
              onClick={handleLogin}
              disabled={!loginForm.username || isAuthenticating}
            >
              {isAuthenticating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>SYNCHRONIZING_SESSION...</span>
                </>
              ) : (
                <>
                  <span>AUTHORIZE_TERMINAL_ACCESS</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Right: System Overview */}
        <motion.div 
          className="system-overview-node"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="section-title-tactical">
            <Database size={16} className="text-cobalt" />
            <span>LIVE_SYSTEM_TELEMETRY</span>
          </div>

          <div className="gateway-stats-grid">
            <div className="gate-card glass-panel">
              <div className="gate-icon"><AlertCircle size={18} className="text-rose" /></div>
              <div className="gate-val">
                <label>ACTIVE_CASES</label>
                <div className="num mono">{gateStats?.total_cases || 0}</div>
                <div className="trend text-emerald">+8 TODAY</div>
              </div>
            </div>

            <div className="gate-card glass-panel">
              <div className="gate-icon"><ExternalLink size={18} className="text-cobalt" /></div>
              <div className="gate-val">
                <label>ESCALATED_CASES</label>
                <div className="num mono">4</div>
                <div className="trend text-muted">STABLE</div>
              </div>
            </div>

            <div className="gate-card glass-panel">
              <div className="gate-icon"><PieChart size={18} className="text-amber" /></div>
              <div className="gate-val">
                <label>PARTIAL_FREEZES</label>
                <div className="num mono">{gateStats?.partial_freeze || 0}</div>
                <div className="trend text-amber">+2H</div>
              </div>
            </div>

            <div className="gate-card glass-panel border-rose/20">
              <div className="gate-icon"><Clock size={18} className="text-rose" /></div>
              <div className="gate-val">
                <label>SLA_VIOLATIONS</label>
                <div className="num mono text-rose">0</div>
                <div className="trend text-emerald">0.0%</div>
              </div>
            </div>
          </div>

          <div className="gateway-log-box glass-panel mt-6">
            <div className="log-header">
              <History size={12} />
              <span>RECENT_INTERNAL_ACTIVITY</span>
            </div>
            <div className="log-feed mono">
              <div className="log-entry"><span className="text-cobalt">[09:22:41]</span> CASE #823 FREEZE APPROVED</div>
              <div className="log-entry"><span className="text-cobalt">[09:20:15]</span> CASE #819 ESCALATED TO T2</div>
              <div className="log-entry"><span className="text-rose">[09:18:02]</span> SLA ALERT TRIGGERED: NODE_B</div>
              <div className="log-entry"><span className="text-emerald">[09:15:55]</span> SYSTEM_SYNC: NOMINAL</div>
              <div className="log-entry"><span className="text-muted">[09:12:00]</span> NODAL_AUDIT: COMPLETED</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="internal-footbar">
        <span className="mono">INTERNAL_USE_ONLY // FRAUDSHIELD_B2B_TERMINAL_V4</span>
        <span className="mono">SECURE_AUTH_LAYER_ACTIVE</span>
      </div>

      {/* Auth Transition Modal */}
      <AnimatePresence>
        {isAuthenticating && (
          <motion.div 
            className="auth-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="auth-loader">
              <div className="loader-ring"></div>
              <h3 className="mono">ESTABLISHING_SECURE_SESSION...</h3>
              <p className="text-tiny mono text-muted mt-2">LINKING_FRAUD_COMMAND_NODE_42</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gateway;
