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
  RefreshCw
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
  const [selectedAccount, setSelectedAccount] = useState(null);
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

  const handleAddAccount = () => {
    if (!newAccount.accountNumber || !newAccount.accountType || !newAccount.institution) return;
    
    const account = {
      id: Date.now().toString(),
      ...newAccount,
      balance: parseFloat(newAccount.balance) || 0,
      beneficiaries: [],
      lastUpdated: new Date()
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
        ? { ...account, beneficiaries: [...account.beneficiaries, beneficiary], lastUpdated: new Date() }
        : account
    );
    
    setAccounts(updatedAccounts);
    setNewBeneficiary({ name: '', relationship: '', percentage: '', ssn: '', isPrimary: true });
    setShowAddBeneficiary(false);
    setSelectedAccount(null);
    
    // Add audit log entry
    setAuditLog([{
      id: Date.now().toString(),
      timestamp: new Date(),
      action: 'ADD_BENEFICIARY',
      accountId: selectedAccount.id,
      details: `Added new beneficiary: ${beneficiary.name} (${beneficiary.percentage}%)`,
      status: 'SUCCESS',
      institutionResponse: 'PROCESSED'
    }, ...auditLog]);
  };

  const pushToInstitution = (accountId) => {
    // Simulate API push
    setAuditLog([{
      id: Date.now().toString(),
      timestamp: new Date(),
      action: 'PUSH_UPDATE',
      accountId: accountId,
      details: 'Pushed beneficiary updates to institution',
      status: 'SUCCESS',
      institutionResponse: 'ACK_RECEIVED'
    }, ...auditLog]);
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
        {accounts.map(account => (
          <div key={account.id} className="card animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{account.accountType}</h3>
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
                <h4 className="font-semibold text-gray-900">Beneficiaries</h4>
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
                <p className="text-gray-500 text-center py-4">No beneficiaries designated</p>
              ) : (
                <div className="space-y-2">
                  {account.beneficiaries.map(beneficiary => (
                    <div key={beneficiary.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{beneficiary.name}</p>
                        <p className="text-sm text-gray-600">{beneficiary.relationship} • {beneficiary.ssn}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{beneficiary.percentage}%</p>
                        <p className="text-xs text-gray-500">
                          {beneficiary.isPrimary ? 'Primary' : 'Contingent'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4 mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Last updated: {account.lastUpdated.toLocaleDateString()}
              </p>
              <div className="flex gap-2">
                {getInstitutionStatus(account.institution) ? (
                  <button
                    onClick={() => pushToInstitution(account.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                  >
                    <Send size={14} />
                    Push Update
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
        ))}
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
                      entry.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
            <div className="bg-white rounded-xl p-6
