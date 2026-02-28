import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, ArrowLeft, ShieldCheck, PieChart, XCircle, ExternalLink, Shield, ChevronRight,
  Loader2, FileLock2
} from 'lucide-react';
import { ROLES } from '../../constants/roles';

const IntelligencePanel = ({ 
  selectedCase, 
  setSelectedCase, 
  auditLogs, 
  user, 
  isUpdating, 
  handleUpdateStatus, 
  handleEscalate,
  setShowPartialModal 
}) => {
  return (
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
                    <span className="text-xs font-bold text-blue">{log.metadata?.admin_name || 'SYSTEM'}</span>
                    <span className="text-xs text-muted">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-xs text-slate-300">{log.action?.replace(/_/g, ' ')} for #{log.case_id?.slice(0, 8)}</div>
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
                    disabled={isUpdating || !ROLES[user.role].permissions?.includes('FREEZE')}
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
                    disabled={isUpdating || !ROLES[user.role].permissions?.includes('FREEZE')}
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
                    disabled={isUpdating || !ROLES[user.role].permissions?.includes('REJECT')}
                  >
                    <div className="op-icon"><XCircle size={18} /></div>
                    <div className="op-text">
                      <span className="op-title">DISMISS_INTELLIGENCE</span>
                      <span className="op-sub">Mark as false-positive</span>
                    </div>
                  </button>

                  <div className="mt-8 pt-6 border-t border-white/5 h-in-loop-node">
                     <div className="section-label mb-3 flex items-center gap-2"><Shield size={12} className="text-blue" /> HUMAN-IN-THE-LOOP</div>
                     <p className="text-[0.65rem] text-slate-500 mb-4 leading-relaxed">Direct intervention protocol for high-value recoveries or complex nodes.</p>
                     
                     <div className="flex flex-col gap-3">
                        <button 
                          className={`w-full p-3 rounded-xl border font-bold text-[0.7rem] transition-all flex items-center justify-center gap-2 ${selectedCase.status === 'ESCALATED' ? 'bg-slate-800/10 border-white/5 text-slate-500' : 'bg-blue-500/5 border-blue-500/20 text-blue-400 hover:bg-blue-500/10'}`}
                          onClick={handleEscalate}
                          disabled={isUpdating || selectedCase.status === 'ESCALATED'}
                        >
                          {isUpdating ? <><Loader2 size={12} className="animate-spin" /> INITIALIZING...</> : (selectedCase.status === 'ESCALATED' ? 'ESCALATED TO FIU' : 'ESCALATE TO FIU / OMBUDSMAN')}
                        </button>

                        {selectedCase.status === 'ESCALATED' && (
                          <button 
                            className="w-full p-3 rounded-xl bg-blue-500 border border-blue-400 text-white font-bold text-[0.7rem] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                            onClick={() => window.open(`http://localhost:5001/api/cases/${selectedCase.id}/download-legal`, '_blank')}
                          >
                            <FileLock2 size={12} /> DOWNLOAD LEGAL REQUEST
                          </button>
                        )}
                     </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                     <a 
                      href={`/dashboard/${selectedCase.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-all group"
                     >
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <ExternalLink size={14} />
                          </div>
                          <div>
                            <div className="text-[0.7rem] font-bold text-blue-500 uppercase tracking-wider">Live Bridge</div>
                            <div className="text-xs text-slate-400">View Public Recovery Interface</div>
                          </div>
                       </div>
                       <ChevronRight size={14} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
                     </a>
                  </div>
          </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntelligencePanel;
