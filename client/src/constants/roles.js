export const ROLES = {
  FRAUD_OFFICER: { 
    name: 'Fraud Officer', 
    clearance: 1,
    permissions: ['VIEW', 'REJECT'] 
  },
  SENIOR_OFFICER: { 
    name: 'Senior Nodal', 
    clearance: 2,
    permissions: ['VIEW', 'REJECT', 'FREEZE'] 
  },
  SUPERVISOR: { 
    name: 'Operations Lead', 
    clearance: 3,
    permissions: ['VIEW', 'REJECT', 'FREEZE', 'ADMIN'] 
  }
};
