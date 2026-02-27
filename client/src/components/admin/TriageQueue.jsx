import React from 'react';
import { Database, Search, Clock, ChevronRight } from 'lucide-react';

const TriageQueue = ({ cases, selectedCase, setSelectedCase }) => {
  return (
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
  );
};

export default TriageQueue;
