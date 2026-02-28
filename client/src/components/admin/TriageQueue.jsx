import React, { useState, useEffect } from 'react';
import { Database, Search, Clock, ChevronRight } from 'lucide-react';

const SLACell = ({ createdAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const created = new Date(createdAt);
      const now = new Date();
      const diffMs = (created.getTime() + 30 * 60 * 1000) - now.getTime();
      const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
      
      if (diffMins === 0 && diffMs <= 0) return 'EXPIRED';
      return `${diffMins}m`;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 10000); // Update every 10s for performance

    return () => clearInterval(interval);
  }, [createdAt]);

  const isCritical = timeLeft !== 'EXPIRED' && parseInt(timeLeft) < 15;
  const isWarning = timeLeft !== 'EXPIRED' && parseInt(timeLeft) < 45;

  return (
    <span className={`sla-pill text-xs ${timeLeft === 'EXPIRED' ? 'critical' : isCritical ? 'critical pulse' : isWarning ? 'warning' : 'normal'}`}>
      <Clock size={10} /> {timeLeft}
    </span>
  );
};

const TriageQueue = ({ cases, selectedCase, setSelectedCase }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCases = cases.filter(c => 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.amount.toString().includes(searchTerm)
  );

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
            <input 
              type="text" 
              placeholder="Search by Case ID or amount..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
              {filteredCases.length > 0 ? (
                filteredCases.map(c => (
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
                      <SLACell createdAt={c.created_at} />
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
                    {cases.length === 0 ? "No pending cases in triage queue." : "No matching cases found." }
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
