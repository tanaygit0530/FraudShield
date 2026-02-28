import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { ROLES } from '../constants/roles';
import * as caseService from '../services/caseService';
import * as adminService from '../services/adminService';
import AdminHeader from '../components/admin/AdminHeader';
import KPIGrid from '../components/admin/KPIGrid';
import TriageQueue from '../components/admin/TriageQueue';
import IntelligencePanel from '../components/admin/IntelligencePanel';
import Gateway from '../components/admin/Gateway';
import '../styles/AdminDashboard.css';

import { supabase } from '../lib/supabase';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', role: 'NODAL_OFFICER' });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [cases, setCases] = useState([]);
  const [stats, setStats] = useState(null);
  const [gateStats, setGateStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin_session');
    if (saved) setUser(JSON.parse(saved));
    fetchGateTelemetry();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      
      // Set up Realtime subscriptions
      const casesChannel = supabase
        .channel('cases-realtime')
        .on('postgres_changes', { event: '*', table: 'cases' }, (payload) => {
          console.log('Realtime Case Update:', payload);
          fetchDashboardData(); // Refresh all data on change for consistency
        })
        .subscribe();

      const auditChannel = supabase
        .channel('audit-realtime')
        .on('postgres_changes', { event: 'INSERT', table: 'audit_logs' }, (payload) => {
          fetchDashboardData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(casesChannel);
        supabase.removeChannel(auditChannel);
      };
    }
  }, [user]);

  // Keep selectedCase in sync with cases list
  useEffect(() => {
    if (selectedCase && cases.length > 0) {
      const freshCase = cases.find(c => c.id === selectedCase.id);
      if (freshCase && JSON.stringify(freshCase) !== JSON.stringify(selectedCase)) {
        setSelectedCase(freshCase);
      }
    }
  }, [cases, selectedCase]);

  const fetchGateTelemetry = async () => {
    try {
      const res = await adminService.getAnalytics();
      setGateStats(res.data);
    } catch (err) {
      console.error('Telemetry Error:', err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setSyncError(null);
      setIsUpdating(true);
      console.log('--- ADMIN_SYNC_START ---');

      // Individual fetches to prevent failure of one from breaking all
      const fetchCases = async () => {
        try {
          const res = await caseService.getCases();
          setCases(res.data || []);
        } catch (e) {
          console.error("Cases fetch failed", e.response?.data || e.message);
          setSyncError("Failed to fetch triage queue: " + (e.response?.data?.error || e.message));
        }
      };

      const fetchStats = async () => {
        try {
          const res = await adminService.getAnalytics();
          setStats(res.data);
        } catch (e) {
          console.error("Stats fetch failed", e.response?.data || e.message);
        }
      };

      const fetchAudit = async () => {
        try {
          const res = await adminService.getAuditLogs();
          console.log('[DEBUG_AUDIT] Received:', res.data);
          setAuditLogs(res.data || []);
        } catch (e) {
          console.error("Audit logs fetch failed", e.response?.data || e.message);
        }
      };

      await Promise.allSettled([fetchCases(), fetchStats(), fetchAudit()]);
      
      console.log('SYNC_DATA_CONCLUDED');
    } catch (err) {
      console.error('Core Sync Failure:', err);
      setSyncError(err.message || 'Failed to sync with node');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      const userData = { ...loginForm, id: 'OP-42', lastLogin: new Date() };
      setUser(userData);
      localStorage.setItem('admin_session', JSON.stringify(userData));
      setIsAuthenticating(false);
    }, 2000);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('admin_session');
    // Optional: Refresh data to clear any sensitive state
  };

  const handleEscalate = async () => {
    if (!selectedCase || isUpdating) return;
    setIsUpdating(true);
    try {
      // 1. Update Status to ESCALATED
      await caseService.escalateCase(selectedCase.id);
      
      // 2. Refresh so the sync effect updates the selectedCase status
      await fetchDashboardData();
      alert('Escalation Protocol Initialized. Legal Request Dispatched to Nodal Officer.');
    } catch (err) {
      console.error('Escalation Failed:', err.response?.data || err.message);
      alert('Escalation failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (status, extra = {}) => {
    if (!selectedCase) return;
    setIsUpdating(true);
    try {
      await caseService.updateCaseStatus(selectedCase.id, {
        status,
        ...extra,
        officer_name: user.username
      });
      setShowPartialModal(false);
      // Refresh list, the sync effect will update selectedCase with the new status
      await fetchDashboardData();
    } catch (err) {
      console.error('Action Failed:', err.response?.data || err.message);
      alert('Communication error: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <Gateway 
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={handleLogin}
        isAuthenticating={isAuthenticating}
        gateStats={gateStats}
      />
    );
  }

  return (
    <div className="admin-console dashboard-viewport">
      <div className="tactical-grid"></div>
      
      <AdminHeader 
        user={user} 
        onRefresh={fetchDashboardData} 
        onLogout={handleLogout}
        isSyncing={isUpdating} 
      />
      
      {syncError && (
        <div className="container mt-4">
          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-3 text-red-500 text-xs font-bold">
            <span className="animate-pulse">●</span> NODE_SYNC_FAILURE: {syncError}
          </div>
        </div>
      )}

      <KPIGrid stats={stats} />

      <main className="container mt-8 grid grid-cols-12 gap-6 pb-20">
        <TriageQueue 
          cases={cases}
          selectedCase={selectedCase}
          setSelectedCase={setSelectedCase}
        />

        <IntelligencePanel 
          selectedCase={selectedCase}
          setSelectedCase={setSelectedCase}
          auditLogs={auditLogs}
          user={user}
          isUpdating={isUpdating}
          handleUpdateStatus={handleUpdateStatus}
          handleEscalate={handleEscalate}
          setShowPartialModal={setShowPartialModal}
        />
      </main>

      {/* Partial Freeze Modal */}
      <AnimatePresence>
        {showPartialModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-card glass-card" 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 20, opacity: 0 }}
            >
              <h3>Institutional Partial Freeze</h3>
              <p className="text-muted text-sm mb-6">
                Enter the amount currently available in the beneficiary bank account. The system will calculate the delta.
              </p>
              
              <div className="modal-form">
                <div className="input-group mb-6">
                  <label>Available Balance (INR)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5400" 
                    value={partialAmount}
                    onChange={(e) => setPartialAmount(e.target.value)}
                  />
                  <div className="text-tiny mt-2 text-blue">
                    System will automatically lien: ₹{Math.min(selectedCase.amount, partialAmount || 0)}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 btn-secondary" onClick={() => setShowPartialModal(false)}>Cancel</button>
                  <button 
                    className="flex-1 btn-primary" 
                    onClick={() => handleUpdateStatus('PARTIALLY_FROZEN', { 
                      frozen_amount: parseFloat(partialAmount), 
                      total_balance: parseFloat(partialAmount) 
                    })}
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

      <div className="internal-footbar">
        <div className="flex gap-4">
          <span className="mono">INTERNAL_USE_ONLY // FRAUDSHIELD_B2B_TERMINAL_V4</span>
          <span className="text-muted">|</span>
          <span className="mono">LOGGED_IN_AS: {user.username.toUpperCase()}</span>
        </div>
        <div className="flex gap-4 items-center">
          <ShieldCheck size={10} className="text-emerald" />
          <span className="mono">SECURE_AUTH_LAYER_ACTIVE // NODE_42</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
