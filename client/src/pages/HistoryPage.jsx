import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Search, Filter, ArrowUpRight, 
  CheckCircle, Clock, AlertCircle, FileText,
  ShieldAlert, RefreshCw
} from 'lucide-react';
import * as caseService from '../services/caseService';
import { Link } from 'react-router-dom';

const HistoryPage = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');

  const fetchCases = async () => {
    try {
      const response = await caseService.getCases();
      const data = response.data;
      // Sort by newest first
      setCases(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setLoading(false);
    } catch (err) {
      console.error('Fetch Cases Error:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    const interval = setInterval(fetchCases, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'FUNDS_CREDITED':
      case 'FREEZE_CONFIRMED':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'RECOVERED' };
      case 'ESCALATED':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'ESCALATED' };
      case 'CLOSED':
        return { bg: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8', label: 'CLOSED' };
      default:
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'IN PROGRESS' };
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.amount.toString().includes(searchTerm);
    const matchesFilter = filter === 'ALL' || (filter === 'RECOVERED' && c.status === 'FUNDS_CREDITED') || 
                         (filter === 'PROGRESS' && !['FUNDS_CREDITED', 'CLOSED'].includes(c.status));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="history-page">
      <div className="grid-overlay"></div>
      
      <div className="container">
        <motion.div 
          className="history-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="history-badge">
                <History size={12} className="text-blue" />
                <span>CASE LEDGER</span>
              </div>
              <h1 className="title-gradient">Incident <span className="text-blue">Archives</span></h1>
              <p className="subtitle">Real-time audit trail of all reported fraudulent activities and recovery statuses.</p>
            </div>
            
            <button onClick={fetchCases} className="refresh-btn">
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              Refetch Live Data
            </button>
          </div>

          <div className="filter-bar glass-card">
            <div className="search-box">
              <Search size={18} className="text-muted" />
              <input 
                type="text" 
                placeholder="Search by Case ID or Amount..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-options">
              {['ALL', 'PROGRESS', 'RECOVERED'].map(f => (
                <button 
                  key={f} 
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="history-list">
          <AnimatePresence mode='popLayout'>
            {loading ? (
              <motion.div key="loading" className="loading-state">
                <div className="shimmer-card"></div>
                <div className="shimmer-card"></div>
                <div className="shimmer-card"></div>
              </motion.div>
            ) : filteredCases.length > 0 ? (
              filteredCases.map((caseItem, index) => {
                const style = getStatusStyle(caseItem.status);
                return (
                  <motion.div 
                    key={caseItem.id}
                    className="history-item glass-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <div className="item-main">
                      <div className="item-id">
                        <span className="mono text-muted text-xs">ID: {caseItem.id.slice(0, 8)}...</span>
                        <div className="status-pill" style={{ backgroundColor: style.bg, color: style.color }}>
                          <span className="dot" style={{ backgroundColor: style.color }}></span>
                          {style.label}
                        </div>
                      </div>
                      <div className="item-details">
                        <div className="detail-group">
                          <label>Incident Value</label>
                          <span className="amount">₹{caseItem.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="detail-group">
                          <label>Reporter Device</label>
                          <span>{caseItem.payload?.user_agent?.split(' ')[0] || 'Web Agent'}</span>
                        </div>
                        <div className="detail-group">
                          <label>Recorded On</label>
                          <span>{new Date(caseItem.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      <Link to={`/dashboard/${caseItem.id}`} className="action-btn">
                        Investigate <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div key="empty" className="empty-state glass-card">
                <ShieldAlert size={48} className="text-muted mb-4" />
                <h3>No Incidents Found</h3>
                <p>No fraudulent activities matching your criteria have been logged.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .history-page {
          background-color: #020617;
          min-height: 100vh;
          padding: 8rem 0;
          color: white;
          position: relative;
        }
        .container { max-width: 1000px; margin: 0 auto; padding: 0 2rem; position: relative; z-index: 2; }
        
        .history-badge {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: rgba(0, 97, 255, 0.1); border: 1px solid rgba(0, 97, 255, 0.2);
          padding: 0.4rem 0.8rem; border-radius: 100px;
          font-size: 0.65rem; font-weight: 800; color: #0061FF; margin-bottom: 1.5rem;
        }

        .refresh-btn {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8; padding: 0.6rem 1rem; border-radius: 8px;
          font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .refresh-btn:hover { background: rgba(255,255,255,0.1); color: white; }

        .filter-bar {
          display: flex; justify-between; align-items: center;
          padding: 1rem 1.5rem; margin-bottom: 3rem; gap: 2rem;
        }
        .search-box {
          flex: 1; display: flex; align-items: center; gap: 1rem;
          background: rgba(0,0,0,0.2); padding: 0.6rem 1rem; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .search-box input {
          background: transparent; border: none; color: white; width: 100%;
          outline: none; font-size: 0.9rem;
        }
        .filter-options { display: flex; gap: 0.5rem; }
        .filter-btn {
          background: transparent; border: none; color: #64748b;
          padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.75rem;
          font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .filter-btn.active { background: #0061FF; color: white; }

        .history-list { display: flex; flex-direction: column; gap: 1rem; }
        .history-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.5rem 2rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255,255,255,0.03);
        }
        .history-item:hover {
          border-color: rgba(0, 97, 255, 0.3);
          transform: scale(1.01);
          background: rgba(15, 23, 42, 0.8);
        }

        .item-main { display: flex; flex-direction: column; gap: 1rem; flex: 1; }
        .item-id { display: flex; align-items: center; gap: 1.5rem; }
        
        .status-pill {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.25rem 0.75rem; border-radius: 100px;
          font-size: 0.65rem; font-weight: 800; letter-spacing: 0.05em;
        }
        .dot { width: 6px; height: 6px; border-radius: 50%; }

        .item-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        .detail-group { display: flex; flex-direction: column; gap: 0.25rem; }
        .detail-group label { font-size: 0.65rem; color: #475569; font-weight: 700; text-transform: uppercase; }
        .detail-group span { font-size: 0.95rem; font-weight: 600; color: #f8fafc; }
        .amount { color: #f8fafc !important; font-family: 'JetBrains Mono', monospace; font-size: 1.1rem !important; }

        .action-btn {
          display: flex; align-items: center; gap: 0.5rem;
          color: #0061FF; font-size: 0.85rem; font-weight: 700;
          text-decoration: none; padding: 0.5rem 1rem; 
          border-radius: 8px; transition: all 0.2s;
          background: rgba(0, 97, 255, 0.05);
        }
        .action-btn:hover { background: rgba(0, 97, 255, 0.1); transform: translateX(4px); }

        .empty-state {
          padding: 5rem; text-align: center; display: flex; flex-direction: column;
          align-items: center; color: #475569;
        }
        .empty-state h3 { color: #94a3b8; margin-top: 1rem; }

        .loading-state { display: flex; flex-direction: column; gap: 1rem; }
        .shimmer-card {
          height: 120px; background: rgba(255,255,255,0.02); border-radius: 16px;
          animation: shimmer 1.5s infinite linear;
          background: linear-gradient(90deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.01) 100%);
          background-size: 200% 100%;
        }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .mono { font-family: 'JetBrains Mono', monospace; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-end { align-items: flex-end; }
        .mb-12 { margin-bottom: 3rem; }
        .text-blue { color: #0061FF; }
        .text-muted { color: #475569; }
        .text-xs { font-size: 0.75rem; }
      `}</style>
    </div>
  );
};

export default HistoryPage;
