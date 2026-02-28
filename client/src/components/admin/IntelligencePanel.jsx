import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, ArrowLeft, ShieldCheck, PieChart, XCircle, ExternalLink, Shield, ChevronRight,
  Loader2, FileLock2, Clock
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
                  {/* Phase 1: Initiation (Automatic INGESTED -> FREEZE_SENT) */}
                  {selectedCase.status === 'FREEZE_SENT' && (
                    <button 
                      className="op-btn op-freeze"
                      onClick={() => handleUpdateStatus('BANK_REVIEW')}
                      disabled={isUpdating}
                    >
                      <div className="op-icon"><ShieldCheck size={18} className="text-emerald" /></div>
                      <div className="op-text">
                        <span className="op-title">ACCEPT_FREEZE_REQUEST</span>
                        <span className="op-sub">Begin operational bank review</span>
                      </div>
                    </button>
                  )}

                  {/* Phase 2: Bank Actions (ONLY ALLOWED during BANK_REVIEW) */}
                  <button 
                    className="op-btn op-freeze"
                    onClick={() => handleUpdateStatus('FREEZE_CONFIRMED', { frozen_amount: selectedCase.amount })}
                    disabled={isUpdating || selectedCase.status !== 'BANK_REVIEW'}
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
                    disabled={isUpdating || selectedCase.status !== 'BANK_REVIEW'}
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
                    disabled={isUpdating || selectedCase.status !== 'BANK_REVIEW'}
                  >
                    <div className="op-icon"><XCircle size={18} /></div>
                    <div className="op-text">
                      <span className="op-title">REJECT_CASE</span>
                      <span className="op-sub">Mark as false-positive</span>
                    </div>
                  </button>

                  <div className="mt-8 pt-6 border-t border-white/5 h-in-loop-node">
                     <div className="section-label mb-3 flex items-center gap-2"><Shield size={12} className="text-[#3b82f6]" /> HUMAN-IN-THE-LOOP_PROTOCOL</div>
                     <p className="text-[0.65rem] text-slate-500 mb-5 leading-relaxed font-medium">Authoritative interdiction for high-value nodes and institutional recovery.</p>
                     
                     <div className="flex flex-col gap-3">
                        <button 
                          className={`btn-authoritative ghost`}
                          onClick={handleEscalate}
                          disabled={isUpdating || !['FREEZE_CONFIRMED', 'PARTIALLY_FROZEN'].includes(selectedCase.status)}
                        >
                          {isUpdating ? <><Loader2 size={12} className="animate-spin" /> INITIALIZING...</> : (selectedCase.status === 'ESCALATED' ? 'ESCALATED_TO_FIU' : 'TRIGGER_FIU_ESCALATION')}
                        </button>

                        {selectedCase.status === 'ESCALATED' && (
                          <button 
                            className="btn-authoritative primary"
                            onClick={() => handleUpdateStatus('FUNDS_CREDITED')}
                          >
                            <ShieldCheck size={14} /> MARK_FUNDS_CREDITED
                          </button>
                        )}

                        {['ESCALATED', 'FUNDS_CREDITED'].includes(selectedCase.status) && (
                          <button 
                            className="btn-authoritative primary"
                            onClick={() => window.open(`http://localhost:5001/api/cases/${selectedCase.id}/download-legal`, '_blank')}
                          >
                            <FileLock2 size={14} /> DOWNLOAD_LEGAL_LIEN
                          </button>
                        )}
                     </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5">
                     <a 
                      href={`/dashboard/${selectedCase.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bridge-card-tactical"
                     >
                       <div className="flex items-center gap-4">
                          <div className="bridge-icon-wrap">
                            <ExternalLink size={16} />
                          </div>
                          <div>
                            <div className="bridge-label-minor">Operational Bridge</div>
                            <div className="bridge-label-major font-mono uppercase tracking-tighter">Live Recovery Feed</div>
                          </div>
                       </div>
                       <ChevronRight size={14} className="text-[#3b82f6]/40" />
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
