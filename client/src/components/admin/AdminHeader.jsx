import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, RefreshCw } from 'lucide-react';
import { ROLES } from '../../constants/roles';

const AdminHeader = ({ user, onRefresh, isSyncing }) => {
  return (
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
            <span className="meta-tag mono">TXN_ID: {Math.random().toString(36).slice(2, 10).toUpperCase()}</span>
            <span className="meta-divider"></span>
            
            <button 
              onClick={onRefresh}
              disabled={isSyncing}
              className={`flex items-center gap-2 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors text-[0.6rem] font-bold mono ${isSyncing ? 'opacity-50' : ''}`}
            >
              <RefreshCw size={10} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'SYNCING...' : 'FORCE_SYNC'}
            </button>
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
            <div className="profile-role">{ROLES[user.role]?.name}</div>
          </div>
          <div className="status-indicator online"></div>
        </motion.div>
      </div>
    </header>
  );
};

export default AdminHeader;
