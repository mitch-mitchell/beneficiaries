import React, { useState, useEffect } from 'react';
import { 
  User, 
  Plus, 
  Edit3, 
  Trash2, 
  Building2, 
  Shield, 
  FileText, 
  Send,
  Check,
  AlertCircle,
  Eye,
  Download,
  RefreshCw,
  X
} from 'lucide-react';

// Mock data and utilities
const mockInstitutions = [
  { id: 'fidelity', name: 'Fidelity Investments', connected: true, apiVersion: 'v2.1' },
  { id: 'schwab', name: 'Charles Schwab', connected: true, apiVersion: 'v1.8' },
  { id: 'vanguard', name: 'Vanguard', connected: false, apiVersion: null },
  { id: 'tdameritrade', name: 'TD Ameritrade', connected: true, apiVersion: 'v2.0' }
];

const accountTypes = [
  'Traditional IRA',
  'Roth IRA', 
  'SEP IRA',
  'SIMPLE IRA',
  'Brokerage Account',
  'Checking Account',
  'Savings Account',
  'TOD Account'
];

const relationshipTypes = [
  'Spouse',
  'Child', 
  'Parent',
  'Sibling',
  'Other Relative',
  'Trust',
  'Charity',
  'Other'
];

const BeneficiaryDesignationAPI = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accounts, setAccounts] = useState([
    {
      id: '1',
      accountNumber: 'IRA-001234',
      accountType: 'Traditional IRA',
      institution: 'fidelity',
      balance: 125000,
      hasUnsavedChanges: false,
      beneficiaries: [
        { id: '1', name: 'Sarah Johnson', relationship: 'Spouse', percentage: 60, ssn: '***-**-1234', isPrimary: true },
        { id: '2', name: 'Michael Johnson', relationship: 'Child', percentage: 40, ssn: '***-**-5678', isPrimary: true }
      ],
      lastUpdated: new Date('2024-01-15')
    },
    {
      id: '2', 
      accountNumber: 'BRK-567890',
      accountType: 'Brokerage Account',
      institution: 'schwab',
      balance: 85000,
      hasUnsavedChanges: false,
      beneficiaries: [
        { id: '3', name: 'Sarah Johnson', relationship: 'Spouse', percentage: 100, ssn: '***-**-1234', isPrimary: true }
      ],
      lastUpdated: new Date('2024-02-10')
    }
  ]);

  const [auditLog, setAuditLog] = useState([
    {
      id: '1',
      timestamp: new Date('2024-02-10T14:30:00'),
      action: 'UPDATE_BENEFICIARY',
      accountId: '1',
      details: 'Updated beneficiary percentage for Sarah Johnson from 50% to 60%',
      status: 'SUCCESS',
      institutionResponse: 'ACK_RECEIVED'
    },
    {
      id: '2',
      timestamp: new Date('2024-02-09T10:15:00'),
      action: 'ADD_BENEFICIARY',
      accountId: '2',
      details: 'Added new beneficiary: Michael Johnson (40%)',
      status: 'SUCCESS',
      institutionResponse: 'PROCESSED'
    },
    {
      id: '3',
      timestamp: new Date('2024-02-08T16:45:00'),
      action: 'SYNC_ACCOUNT',
      accountId: '1',
      details: 'Synchronized account data with Fidelity',
      status: 'SUCCESS',
      institutionResponse: 'DATA_SYNCED'
    }
  ]);

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [showEditBeneficiary, setShowEditBeneficiary] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editingBeneficiary, setEditingBeneficiary] = useState(null);
  const [newAccount, setNewAccount] = useState({
    accountNumber: '',
    accountType: '',
    institution: '',
    balance: ''
  });
  const [newBeneficiary, setNewBeneficiary] = useState({
    name: '',
    relationship: '',
    percentage: '',
    ssn: '',
    isPrimary: true
  });
  const [editBeneficiary, setEditBeneficiary] = useState({
    name: '',
    relationship: '',
    percentage: '',
    ssn: '',
    isPrimary: true
  });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedSubmitAccount, setSelectedSubmitAccount] = useState(null);
  const [pendingChanges, setPendingChanges] = useState(new Set());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [submittedInstitution, setSubmittedInstitution] = useState('');

  const calculateTotalPercentage = (beneficiaries) => {
    return beneficiaries.reduce((total, beneficiary) => total + beneficiary.percentage, 0);
  };

  const calculatePrimaryPercentage = (beneficiaries) => {
    return beneficiaries
      .filter(beneficiary => beneficiary.isPrimary)
      .reduce((total, beneficiary) => total + beneficiary.percentage, 0);
  };

  const calculateContingentPercentage = (beneficiaries) => {
    return beneficiaries
      .filter(beneficiary => !beneficiary.isPrimary)
      .reduce((total, beneficiary) => total + beneficiary.percentage, 0);
  };

  const getPrimaryBeneficiaries = (beneficiaries) => {
    return beneficiaries.filter(beneficiary => beneficiary.isPrimary);
  };

  const getContingentBeneficiaries = (beneficiaries) => {
    return beneficiaries.filter(beneficiary => !beneficiary.isPrimary);
  };

  const canSubmitChanges = (account) => {
    const primaryPercentage = calculatePrimaryPercentage(account.beneficiaries);
    const contingentBeneficiaries = getContingentBeneficiaries(account.beneficiaries);
    const contingentPercentage = calculateContingentPercentage(account.beneficiaries);
    
    // Must have primary beneficiaries totaling 100%
    if (primaryPercentage !== 100) return false;
    
    // If there are contingent beneficiaries, they must also total 100%
    if (contingentBeneficiaries.length > 0 && contingentPercentage !== 100) return false;
    
    return true;
  };

  const handleAddAccount = () => {
    if (!newAccount.accountNumber || !newAccount.accountType || !newAccount.institution) return;
    
    const account = {
      id: Date.now().toString(),
      ...newAccount,
      balance: parseFloat(newAccount.balance) || 0,
      beneficiaries: [],
      lastUpdated: new Date(),
      hasUnsavedChanges: false
    };
    
    setAccounts([...accounts, account]);
    setNewAccount({ accountNumber: '', accountType: '', institution: '', balance: '' });
    setShowAddAccount(false);
    
    // Add audit log entry
    setAuditLog([{
      id: Date.now().toString(),
      timestamp: new Date(),
      action: 'ADD_ACCOUNT',
      accountId: account.id,
      details: `Added new ${account.accountType} account ${account.accountNumber}`,
      status: 'SUCCESS',
      institutionResponse: 'PENDING_SYNC'
    }, ...auditLog]);
  };

  const handleAddBeneficiary = () => {
    if (!newBeneficiary.name || !newBeneficiary.relationship || !newBeneficiary.percentage) return;
    
    const beneficiary = {
      id: Date.now().toString(),
      ...newBeneficiary,
      percentage: parseFloat(newBeneficiary.percentage),
      ssn: `***-**-${Math.floor(Math.random() * 9000) + 1000}`
    };
    
    const updatedAccounts = accounts.map(account => 
      account.id === selectedAccount.id 
        ? { 
            ...account, 
            beneficiaries: [...account.beneficiaries, beneficiary], 
            lastUpdated: new Date(),
            hasUnsavedChanges: true
          }
        : account
    );
    
    setAccounts(updatedAccounts);
    setPendingChanges(new Set([...pendingChanges, selectedAccount.id]));
    setNewBeneficiary({ name: '', relationship: '', percentage: '', ssn: '', isPrimary: true });
    setShowAddBeneficiary(false);
    setSelectedAccount(null);
    
    // Add audit log entry
    setAuditLog([{
      id: Date.now().toString(),
      timestamp: new Date(),
      action: 'ADD_BENEFICIARY',
      accountId: selectedAccount.id,
      details: `Added new beneficiary: ${beneficiary.name} (${beneficiary.percentage}%) - PENDING SUBMISSION`,
      status: 'PENDING',
      institutionResponse: 'NOT_SUBMITTED'
    }, ...auditLog]);
  };

  const handleEditBeneficiary = () => {
    if (!editBeneficiary.name || !editBeneficiary.relationship || !editBeneficiary.percentage) return;
    
    const updatedBeneficiary = {
      ...editingBeneficiary,
      name: editBeneficiary.name,
      relationship: editBeneficiary.relationship,
      percentage: parseFloat(editBeneficiary.percentage),
      isPrimary: editBeneficiary.isPrimary
    };
    
    const updatedAccounts = accounts.map(account => 
      account.id === selectedAccount.id 
        ? { 
            ...account, 
            beneficiaries: account.beneficiaries.map(ben => 
              ben.id === editingBeneficiary.id ? updatedBeneficiary : ben
            ),
            lastUpdated: new Date(),
            hasUnsavedChanges: true
          }
        : account
    );
    
    setAccounts(updatedAccounts);
    setPendingChanges(new Set([...pendingChanges, selectedAccount.id]));
    setEditBeneficiary({ name: '', relationship: '', percentage: '', ssn: '', isPrimary: true });
    setShowEditBeneficiary(false);
    setSelectedAccount(null);
    setEditingBeneficiary(null);
    
    // Add audit log entry
    setAuditLog([{
      id: Date.now().toString(),
      timestamp: new Date(),
      action: 'UPDATE_BENEFICIARY',
      accountId: selectedAccount.id,
      details: `Updated beneficiary: ${updatedBeneficiary.name} (${updatedBeneficiary.percentage}%) - PENDING SUBMISSION`,
      status: 'PENDING',
      institutionResponse: 'NOT_SUBMITTED'
    }, ...auditLog]);
  };

  const handleDeleteBeneficiary = (accountId, beneficiaryId, beneficiaryName) => {
    const updatedAccounts = accounts.map(account => 
      account.id === accountId 
        ? { 
            ...account, 
            beneficiaries: account.beneficiaries.filter(ben => ben.id !== beneficiaryId),
            lastUpdated: new Date(),
            hasUnsavedChanges: true
          }
        : account
    );
    
    setAccounts(updatedAccounts);
    setPendingChanges(new Set([...pendingChanges, accountId]));
    
    // Add audit log entry
    setAuditLog([{
      id: Date.now().toString(),
      timestamp: new Date(),
      action: 'DELETE_BENEFICIARY',
      accountId: accountId,
      details: `Removed beneficiary: ${beneficiaryName} - PENDING SUBMISSION`,
      status: 'PENDING',
      institutionResponse: 'NOT_SUBMITTED'
    }, ...auditLog]);
  };

  const openEditBeneficiary = (account, beneficiary) => {
    setSelectedAccount(account);
    setEditingBeneficiary(beneficiary);
    setEditBeneficiary({
      name: beneficiary.name,
      relationship: beneficiary.relationship,
      percentage: beneficiary.percentage.toString(),
      ssn: beneficiary.ssn,
      isPrimary: beneficiary.isPrimary
    });
    setShowEditBeneficiary(true);
  };

  const openSubmitModal = (account) => {
    setSelectedSubmitAccount(account);
    setShowSubmitModal(true);
  };

  const handleSubmitChanges = () => {
    const institutionName = getInstitutionName(selectedSubmitAccount.institution);
    setSubmittedInstitution(institutionName);
    
    // Update the account to remove unsaved changes flag
    const updatedAccounts = accounts.map(account => 
      account.id === selectedSubmitAccount.id 
        ? { ...account, hasUnsavedChanges: false, lastSubmitted: new Date() }
        : account
    );
    setAccounts(updatedAccounts);
    
    // Remove from pending changes
    const newPendingChanges = new Set(pendingChanges);
    newPendingChanges.delete(selectedSubmitAccount.id);
    setPendingChanges(newPendingChanges);
    
    // Add audit log entry
    setAuditLog([{
      id: Date.now().toString(),
      timestamp: new Date(),
      action: 'SUBMIT_CHANGES',
      accountId: selectedSubmitAccount.id,
      details: `Successfully submitted beneficiary changes to ${institutionName}`,
      status: 'SUCCESS',
      institutionResponse: 'CHANGES_ACCEPTED'
    }, ...auditLog]);
    
    setShowSubmitModal(false);
    setShowSuccessModal(true);
  };

  const handleCancelSubmit = () => {
    setShowSubmitModal(false);
    setShowCancelModal(true);
  };

  const getChangeSummary = (account) => {
    // This would normally compare with saved state, but for demo we'll show current beneficiaries
    const changes = [];
    account.beneficiaries.forEach(beneficiary => {
      changes.push(`${beneficiary.name} - ${beneficiary.percentage}% (${beneficiary.relationship})`);
    });
    return changes;
  };

  const generatePDF = (accountId) => {
    // Simulate PDF generation
    setAuditLog([{
      id: Date.now().toString(),
      timestamp: new Date(),
      action: 'GENERATE_PDF',
      accountId: accountId,
      details: 'Generated beneficiary designation form PDF',
      status: 'SUCCESS',
      institutionResponse: 'DOCUMENT_READY'
    }, ...auditLog]);
  };

  const getInstitutionName = (id) => {
    const inst = mockInstitutions.find(i => i.id === id);
    return inst ? inst.name : id;
  };

  const getInstitutionStatus = (id) => {
    const inst = mockInstitutions.find(i => i.id === id);
    return inst ? inst.connected : false;
  };

  const DashboardView = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Account Dashboard</h2>
        <button
          onClick={() => setShowAddAccount(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Add Account
        </button>
      </div>

      <div className="grid gap-6">
        {accounts.map(account => {
          const primaryBeneficiaries = getPrimaryBeneficiaries(account.beneficiaries);
          const contingentBeneficiaries = getContingentBeneficiaries(account.beneficiaries);
          const primaryPercentage = calculatePrimaryPercentage(account.beneficiaries);
          const contingentPercentage = calculateContingentPercentage(account.beneficiaries);
          const canSubmit = canSubmitChanges(account);
          
          return (
            <div key={account.id} className="card animate-slide-up">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-gray-900">{account.accountType}</h3>
                    {account.hasUnsavedChanges && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Unsaved Changes
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">{account.accountNumber}</p>
                  <p className="text-sm text-gray-500">{getInstitutionName(account.institution)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ${account.balance.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {getInstitutionStatus(account.institution) ? (
                      <span className="status-connected">
                        <Check size={16} />
                        Connected
                      </span>
                    ) : (
                      <span className="status-disconnected">
                        <AlertCircle size={16} />
                        Manual Only
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-4">
                    <h4 className="font-semibold text-gray-900">Beneficiaries</h4>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAccount(account);
                      setShowAddBeneficiary(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 transition-colors"
                  >
                    <Plus size={16} />
                    Add Beneficiary
                  </button>
                </div>

                {account.beneficiaries.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-medium">
                        <AlertCircle size={20} />
                        <span>No Beneficiary Designation</span>
                      </div>
                      <p className="text-gray-500">
                        This account has no beneficiaries designated. Add beneficiaries to ensure proper estate planning.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Primary Beneficiaries Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h5 className="font-medium text-gray-900">Primary Beneficiaries</h5>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            primaryPercentage === 100 
                              ? 'bg-green-100 text-green-800' 
                              : primaryPercentage > 100 
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            Total: {primaryPercentage}%
                          </div>
                        </div>
                      </div>
                      
                      {primaryPercentage !== 100 && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-red-50 rounded-lg">
                          <AlertCircle size={16} className="text-red-600" />
                          <span className="text-sm text-red-700">
                            {primaryPercentage > 100 
                              ? 'Primary beneficiaries exceed 100%. Please adjust percentages.' 
                              : primaryPercentage === 0
                                ? 'Primary beneficiaries are required and must total 100%.'
                                : 'Primary beneficiaries must total 100% to submit changes.'}
                          </span>
                        </div>
                      )}

                      {primaryBeneficiaries.length === 0 ? (
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <p className="text-orange-700 text-sm">No primary beneficiaries designated. Primary beneficiaries are required.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {primaryBeneficiaries.map(beneficiary => (
                            <div key={beneficiary.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{beneficiary.name}</p>
                                <p className="text-sm text-gray-600">{beneficiary.relationship} • {beneficiary.ssn}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">{beneficiary.percentage}%</p>
                                  <p className="text-xs text-gray-500">Primary</p>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => openEditBeneficiary(account, beneficiary)}
                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit beneficiary"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBeneficiary(account.id, beneficiary.id, beneficiary.name)}
                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                    title="Delete beneficiary"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contingent Beneficiaries Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h5 className="font-medium text-gray-900">Contingent Beneficiaries</h5>
                          {contingentBeneficiaries.length > 0 && (
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              contingentPercentage === 100 
                                ? 'bg-green-100 text-green-800' 
                                : contingentPercentage > 100 
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              Total: {contingentPercentage}%
                            </div>
                          )}
                        </div>
                      </div>

                      {contingentBeneficiaries.length > 0 && contingentPercentage !== 100 && (
                        <div className="flex items-center gap-2 mb-3 p-2 bg-red-50 rounded-lg">
                          <AlertCircle size={16} className="text-red-600" />
                          <span className="text-sm text-red-700">
                            {contingentPercentage > 100 
                              ? 'Contingent beneficiaries exceed 100%. Please adjust percentages.' 
                              : 'Contingent beneficiaries must total 100% when designated.'}
                          </span>
                        </div>
                      )}

                      {contingentBeneficiaries.length === 0 ? (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-blue-700 text-sm">
                            <strong>Recommendation:</strong> Consider adding contingent beneficiaries. 
                            They receive assets if primary beneficiaries are unavailable.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {contingentBeneficiaries.map(beneficiary => (
                            <div key={beneficiary.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{beneficiary.name}</p>
                                <p className="text-sm text-gray-600">{beneficiary.relationship} • {beneficiary.ssn}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">{beneficiary.percentage}%</p>
                                  <p className="text-xs text-gray-500">Contingent</p>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => openEditBeneficiary(account, beneficiary)}
                                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit beneficiary"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBeneficiary(account.id, beneficiary.id, beneficiary.name)}
                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                    title="Delete beneficiary"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-4 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Last updated: {account.lastUpdated.toLocaleDateString()}
                  {account.lastSubmitted && (
                    <span className="ml-2">• Last submitted: {account.lastSubmitted.toLocaleDateString()}</span>
                  )}
                </p>
                <div className="flex gap-2">
                  {getInstitutionStatus(account.institution) ? (
                    <button
                      onClick={() => openSubmitModal(account)}
                      disabled={!account.hasUnsavedChanges || !canSubmit}
                      className={`px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors ${
                        account.hasUnsavedChanges && canSubmit
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      title={
                        !account.hasUnsavedChanges 
                          ? 'No changes to submit'
                          : !canSubmit
                            ? 'Cannot submit - primary beneficiaries must total 100%, and contingent beneficiaries (if any) must also total 100%'
                            : 'Submit changes to institution'
                      }
                    >
                      <Send size={14} />
                      Submit Changes
                    </button>
                  ) : (
                    <button
                      onClick={() => generatePDF(account.id)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                    >
                      <FileText size={14} />
                      Generate PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const IntegrationsView = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900">Institution Integrations</h2>
      
      <div className="grid gap-4">
        {mockInstitutions.map(institution => (
          <div key={institution.id} className="card animate-slide-up">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Building2 size={24} className="text-gray-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{institution.name}</h3>
                  {institution.connected && (
                    <p className="text-sm text-gray-600">API Version: {institution.apiVersion}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {institution.connected ? (
                  <span className="status-connected">
                    <Check size={20} />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-gray-500 font-medium">
                    <AlertCircle size={20} />
                    Not Connected
                  </span>
                )}
              </div>
            </div>
            
            {institution.connected && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Last Sync: 2 hours ago</span>
                  <span>Status: Active</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const AuditLogView = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
      
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Shield size={24} className="text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Security & Compliance</h3>
              <p className="text-gray-600">All actions are logged and encrypted</p>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {auditLog.map(entry => (
            <div key={entry.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 
                      entry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {entry.action.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {entry.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-900 mb-1">{entry.details}</p>
                  <p className="text-sm text-gray-500">
                    Institution Response: {entry.institutionResponse}
                  </p>
                </div>
                <div className="ml-4">
                  {entry.status === 'SUCCESS' ? (
                    <Check size={20} className="text-green-600" />
                  ) : entry.status === 'PENDING' ? (
                    <AlertCircle size={20} className="text-yellow-600" />
                  ) : (
                    <AlertCircle size={20} className="text-red-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Beneficiary Designation API
          </h1>
          <p className="text-gray-600 text-lg">
            Streamlined beneficiary management across financial institutions
          </p>
        </div>

        {/* Navigation */}
        <div className="card mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: User },
              { id: 'integrations', label: 'Integrations', icon: Building2 },
              { id: 'audit', label: 'Audit Log', icon: Shield }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-96">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'integrations' && <IntegrationsView />}
          {activeTab === 'audit' && <AuditLogView />}
        </div>

        {/* Add Account Modal */}
        {showAddAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Account</h3>
                <button
                  onClick={() => setShowAddAccount(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({...newAccount, accountNumber: e.target.value})}
                    className="input-field"
                    placeholder="Enter account number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <select
                    value={newAccount.accountType}
                    onChange={(e) => setNewAccount({...newAccount, accountType: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Select account type</option>
                    {accountTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution
                  </label>
                  <select
                    value={newAccount.institution}
                    onChange={(e) => setNewAccount({...newAccount, institution: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Select institution</option>
                    {mockInstitutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Balance
                  </label>
                  <input
                    type="number"
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
                    className="input-field"
                    placeholder="Enter balance"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddAccount(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAccount}
                  className="btn-primary flex-1"
                >
                  Add Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Beneficiary Modal */}
        {showAddBeneficiary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Beneficiary</h3>
                <button
                  onClick={() => setShowAddBeneficiary(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newBeneficiary.name}
                    onChange={(e) => setNewBeneficiary({...newBeneficiary, name: e.target.value})}
                    className="input-field"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <select
                    value={newBeneficiary.relationship}
                    onChange={(e) => setNewBeneficiary({...newBeneficiary, relationship: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Select relationship</option>
                    {relationshipTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Percentage
                  </label>
                  <input
                    type="number"
                    value={newBeneficiary.percentage}
                    onChange={(e) => setNewBeneficiary({...newBeneficiary, percentage: e.target.value})}
                    className="input-field"
                    placeholder="Enter percentage (0-100)"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={newBeneficiary.isPrimary}
                    onChange={(e) => setNewBeneficiary({...newBeneficiary, isPrimary: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isPrimary" className="text-sm text-gray-700">
                    Primary Beneficiary
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddBeneficiary(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBeneficiary}
                  className="btn-primary flex-1"
                >
                  Add Beneficiary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Beneficiary Modal */}
        {showEditBeneficiary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Beneficiary</h3>
                <button
                  onClick={() => setShowEditBeneficiary(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editBeneficiary.name}
                    onChange={(e) => setEditBeneficiary({...editBeneficiary, name: e.target.value})}
                    className="input-field"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <select
                    value={editBeneficiary.relationship}
                    onChange={(e) => setEditBeneficiary({...editBeneficiary, relationship: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Select relationship</option>
                    {relationshipTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Percentage
                  </label>
                  <input
                    type="number"
                    value={editBeneficiary.percentage}
                    onChange={(e) => setEditBeneficiary({...editBeneficiary, percentage: e.target.value})}
                    className="input-field"
                    placeholder="Enter percentage (0-100)"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editIsPrimary"
                    checked={editBeneficiary.isPrimary}
                    onChange={(e) => setEditBeneficiary({...editBeneficiary, isPrimary: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="editIsPrimary" className="text-sm text-gray-700">
                    Primary Beneficiary
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditBeneficiary(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditBeneficiary}
                  className="btn-primary flex-1"
                >
                  Update Beneficiary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Changes Confirmation Modal */}
        {showSubmitModal && selectedSubmitAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirm Changes Submission</h3>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure that you want to submit these changes to <strong>{getInstitutionName(selectedSubmitAccount.institution)}</strong>?
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Account: {selectedSubmitAccount.accountNumber}</h4>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Current Beneficiaries:</h5>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {getChangeSummary(selectedSubmitAccount).map((change, index) => (
                      <li key={index}>• {change}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleCancelSubmit}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitChanges}
                  className="btn-primary flex-1"
                >
                  Yes, confirm and submit changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check size={24} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Changes Submitted Successfully</h3>
                  <p className="text-gray-600">Your changes have been sent to {submittedInstitution}</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                The changes were successfully submitted to <strong>{submittedInstitution}</strong>. 
                You should receive confirmation within 24-48 hours.
              </p>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <X size={24} className="text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Submission Cancelled</h3>
                  <p className="text-gray-600">No changes were saved or sent</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                No changes have been saved or sent to your financial institution. 
                Your unsaved changes are still available for editing.
              </p>
              
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeneficiaryDesignationAPI;
