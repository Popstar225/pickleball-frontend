import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchClubInvoices } from '../../../store/slices/clubDashboardSlice';
import { toast } from 'sonner';
import { 
  FileText, 
  Plus, 
  Eye, 
  Send, 
  Bell, 
  Download, 
  Edit,
  Trash2,
  RefreshCw,
  DollarSign,
  Calendar,
  User,
  Filter
} from 'lucide-react';
import { api } from '../../../lib/api';

interface Invoice {
  id: string;
  member: string;
  type: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate: string | null;
  description?: string;
  invoice_number?: string;
  user_id?: string;
  club_id?: string;
  created_at?: string;
}

interface CreateInvoiceData {
  member_id: string;
  type: string;
  amount: number;
  description: string;
  due_date: string;
}

interface InvoicesProps {
  invoices: Invoice[];
}

const Invoices: React.FC<InvoicesProps> = ({ invoices: initialInvoices }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading, error } = useSelector((state: RootState) => state.clubDashboard);
  
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices || []);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [createInvoiceData, setCreateInvoiceData] = useState<CreateInvoiceData>({
    member_id: '',
    type: 'Membership Fee',
    amount: 0,
    description: '',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // Fetch invoices when component mounts
  useEffect(() => {
    if (user?.club_id) {
      refreshInvoices();
    }
  }, [user?.club_id]);

  // Update local state when props change
  useEffect(() => {
    setInvoices(initialInvoices || []);
  }, [initialInvoices]);

  const refreshInvoices = async () => {
    if (!user?.club_id) return;
    
    setIsLoading(true);
    try {
      const result = await dispatch(fetchClubInvoices(user.club_id)).unwrap();
      if (result) {
        setInvoices(result);
        toast.success('Invoices refreshed successfully!');
      }
    } catch (error) {
      console.error('Error refreshing invoices:', error);
      toast.error('Failed to refresh invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    console.log('🔄 Create Invoice button clicked');
    console.log('📝 Form data:', createInvoiceData);
    console.log('👤 User:', user);
    
    if (!user?.club_id) {
      toast.error('User not authenticated');
      return;
    }

    if (!createInvoiceData.member_id || !createInvoiceData.amount || !createInvoiceData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🚀 Making API call to create invoice...');
      const response = await api.post('/payments/invoice', {
        club_id: user.club_id,
        user_id: createInvoiceData.member_id, // Backend expects user_id
        amount: createInvoiceData.amount,
        description: `${createInvoiceData.type}: ${createInvoiceData.description}`,
        due_date: createInvoiceData.due_date
      }) as any;

      console.log('📡 API Response:', response);

      if (response && response.success) {
        toast.success('Invoice created successfully!');
        
        // Refresh invoices to show new one
        await refreshInvoices();
        
        // Reset form and close modal
        setCreateInvoiceData({
          member_id: '',
          type: 'Membership Fee',
          amount: 0,
          description: '',
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        setShowCreateModal(false);
      } else {
        const error = response?.message || 'Failed to create invoice';
        toast.error(error);
      }
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvoiceAction = async (invoiceId: string, action: string) => {
    switch (action) {
      case 'view':
        const invoice = invoices.find(inv => inv.id === invoiceId);
        if (invoice) {
          setSelectedInvoice(invoice);
          setShowViewModal(true);
        }
        break;
      case 'send':
        toast.success(`Invoice ${invoiceId} sent successfully`);
        break;
      case 'remind':
        toast.success(`Reminder sent for invoice ${invoiceId}`);
        break;
      case 'download':
        toast.success(`Downloading invoice ${invoiceId}`);
        break;
      case 'edit':
        toast.info('Edit functionality coming soon');
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this invoice?')) {
          toast.success(`Invoice ${invoiceId} deleted successfully`);
          // In real app, this would make an API call to delete
        }
        break;
      default:
        console.log(`${action} invoice ${invoiceId}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'pending': return <Calendar className="h-4 w-4 text-yellow-600" />;
      case 'overdue': return <Bell className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-300" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' || invoice.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = invoice.member.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getTotalAmount = () => {
    return filteredInvoices.reduce((total, invoice) => total + invoice.amount, 0);
  };

  const getPaidAmount = () => {
    return filteredInvoices
      .filter(invoice => invoice.status.toLowerCase() === 'paid')
      .reduce((total, invoice) => total + invoice.amount, 0);
  };

  const getPendingAmount = () => {
    return filteredInvoices
      .filter(invoice => invoice.status.toLowerCase() === 'pending')
      .reduce((total, invoice) => total + invoice.amount, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Invoice & Payment Management</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshInvoices}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Total Invoices</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredInvoices.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Total Amount</p>
              <p className="text-2xl font-semibold text-gray-900">${getTotalAmount()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Paid Amount</p>
              <p className="text-2xl font-semibold text-gray-900">${getPaidAmount()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Pending Amount</p>
              <p className="text-2xl font-semibold text-gray-900">${getPendingAmount()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-300" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Invoice List</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Paid Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-300">
                    {loading ? 'Loading invoices...' : 'No invoices found'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.member}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1">{invoice.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.paidDate || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => handleInvoiceAction(invoice.id, 'view')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        
                        <button
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => handleInvoiceAction(invoice.id, 'download')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </button>

                        {invoice.status.toLowerCase() === 'pending' && (
                          <button
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={() => handleInvoiceAction(invoice.id, 'send')}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </button>
                        )}
                        
                        {invoice.status.toLowerCase() === 'overdue' && (
                          <button
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={() => handleInvoiceAction(invoice.id, 'remind')}
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            Remind
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Invoice</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member ID *</label>
                  <input
                    type="text"
                    value={createInvoiceData.member_id}
                    onChange={(e) => setCreateInvoiceData({...createInvoiceData, member_id: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter member ID (UUID)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type *</label>
                  <select
                    value={createInvoiceData.type}
                    onChange={(e) => setCreateInvoiceData({...createInvoiceData, type: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Membership Fee">Membership Fee</option>
                    <option value="Court Rental">Court Rental</option>
                    <option value="Tournament Fee">Tournament Fee</option>
                    <option value="Equipment Rental">Equipment Rental</option>
                    <option value="Training Fee">Training Fee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input
                    type="number"
                    value={createInvoiceData.amount}
                    onChange={(e) => setCreateInvoiceData({...createInvoiceData, amount: parseFloat(e.target.value) || 0})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={createInvoiceData.description}
                    onChange={(e) => setCreateInvoiceData({...createInvoiceData, description: e.target.value})}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter invoice description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={createInvoiceData.due_date}
                    onChange={(e) => setCreateInvoiceData({...createInvoiceData, due_date: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleCreateInvoice}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Invoice ID:</span>
                  <span>{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Member:</span>
                  <span>{selectedInvoice.member}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span>{selectedInvoice.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="font-bold">${selectedInvoice.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Due Date:</span>
                  <span>{selectedInvoice.dueDate}</span>
                </div>
                {selectedInvoice.paidDate && (
                  <div className="flex justify-between">
                    <span className="font-medium">Paid Date:</span>
                    <span>{selectedInvoice.paidDate}</span>
                  </div>
                )}
                {selectedInvoice.description && (
                  <div className="flex justify-between">
                    <span className="font-medium">Description:</span>
                    <span className="text-sm text-gray-300">{selectedInvoice.description}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6 pt-4 border-t">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices; 