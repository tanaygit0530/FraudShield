import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, PieChart, XCircle, ShieldCheck } from 'lucide-react';

const KPIGrid = ({ stats }) => {
  const kpis = [
    { label: 'Total Inflow', val: stats?.total_cases || 0, icon: <AlertCircle size={16}/>, color: '#f8fafc', trend: '+12%' },
    { label: 'Full Freezes', val: stats?.full_freeze || 0, icon: <CheckCircle size={16}/>, color: '#10b981', trend: '+5%' },
    { label: 'Partial Liens', val: stats?.partial_freeze || 0, icon: <PieChart size={16}/>, color: '#f59e0b', trend: 'Stable' },
    { label: 'Rejected', val: stats?.rejected || 0, icon: <XCircle size={16}/>, color: '#ef4444', trend: '-2%' },
    { label: 'Recovered', val: `₹${(stats?.total_recovered || 0).toLocaleString()}`, icon: <ShieldCheck size={16}/>, color: '#3b82f6', trend: 'Live' }
  ];

  return (
    <div className="container mt-12 grid grid-cols-5 gap-5">
      {kpis.map((s, i) => (
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
  );
};

export default KPIGrid;
