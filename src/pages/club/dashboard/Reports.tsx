import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { toast } from 'sonner';
import { 
  BarChart3, 
  Download, 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  FileText,
  RefreshCw,
  Filter,
  CalendarDays,
  Clock,
  Target,
  Activity,
  PieChart,
  LineChart,
  Settings
} from 'lucide-react';
import { api } from '../../../lib/api';

interface ReportData {
  courtUsage?: any;
  financial?: any;
  members?: any;
  tournaments?: any;
  invoices?: any;
  custom?: any;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface CustomReportCriteria {
  reportType: string;
  dateRange: DateRange;
  filters: {
    memberType?: string;
    courtType?: string;
    paymentStatus?: string;
    tournamentStatus?: string;
  };
}

const Reports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [reportData, setReportData] = useState<ReportData>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customCriteria, setCustomCriteria] = useState<CustomReportCriteria>({
    reportType: 'comprehensive',
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    filters: {}
  });

  // Set default date range when component mounts
  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }, []);

  const generateReport = async (type: string) => {
    if (!user?.club_id) {
      toast.error('User not authenticated');
      return;
    }

    setIsLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      let response;
      
      switch (type) {
        case 'court-usage':
          response = await api.get(`/clubs/${user.club_id}/court-stats`, {
            params: {
              start_date: dateRange.startDate,
              end_date: dateRange.endDate
            }
          }) as any;
          break;
          
        case 'financial':
          response = await api.get(`/clubs/${user.club_id}/payment-stats`, {
            params: {
              start_date: dateRange.startDate,
              end_date: dateRange.endDate
            }
          }) as any;
          break;
          
        case 'members':
          response = await api.get(`/clubs/${user.club_id}/stats`, {
            params: {
              start_date: dateRange.startDate,
              end_date: dateRange.endDate
            }
          }) as any;
          break;
          
        case 'tournaments':
          response = await api.get(`/tournaments/reports`, {
            params: {
              organizer_id: user.club_id,
              organizer_type: 'club',
              start_date: dateRange.startDate,
              end_date: dateRange.endDate
            }
          }) as any;
          break;
          
        case 'invoices':
          response = await api.get(`/clubs/${user.club_id}/payment-stats`, {
            params: {
              payment_type: 'membership_fee',
              start_date: dateRange.startDate,
              end_date: dateRange.endDate
            }
          }) as any;
          break;
          
        case 'custom':
          response = await generateCustomReport();
          break;
          
        default:
          throw new Error('Unknown report type');
      }

      if (response && response.success) {
        setReportData(prev => ({ ...prev, [type]: response.data }));
        toast.success(`${getReportTitle(type)} generated successfully!`);
        
        // Auto-download the report
        downloadReport(type, response.data);
      } else {
        const error = response?.message || 'Failed to generate report';
        toast.error(error);
      }
    } catch (error) {
      console.error(`Error generating ${type} report:`, error);
      toast.error(`Failed to generate ${getReportTitle(type)}`);
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const generateCustomReport = async () => {
    if (!user?.club_id) return null;

    try {
      // Combine multiple API calls for comprehensive report
      const [courtStats, memberStats, financialStats, tournamentStats] = await Promise.all([
        api.get(`/clubs/${user.club_id}/court-stats`, {
          params: {
            start_date: customCriteria.dateRange.startDate,
            end_date: customCriteria.dateRange.endDate
          }
        }) as any,
        api.get(`/clubs/${user.club_id}/stats`, {
          params: {
            start_date: customCriteria.dateRange.startDate,
            end_date: customCriteria.dateRange.endDate
          }
        }) as any,
        api.get(`/clubs/${user.club_id}/payment-stats`, {
          params: {
            start_date: customCriteria.dateRange.startDate,
            end_date: customCriteria.dateRange.endDate
          }
        }) as any,
        api.get(`/tournaments/reports`, {
          params: {
            organizer_id: user.club_id,
            organizer_type: 'club',
            start_date: customCriteria.dateRange.startDate,
            end_date: customCriteria.dateRange.endDate
          }
        }) as any
      ]);

      return {
        success: true,
        data: {
          court_stats: (courtStats as any).data,
          member_stats: (memberStats as any).data,
          financial_stats: (financialStats as any).data,
          tournament_stats: (tournamentStats as any).data,
          custom_criteria: customCriteria
        }
      };
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  };

  const downloadReport = (type: string, data: any) => {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'court-usage':
        csvContent = generateCourtUsageCSV(data);
        filename = `court-usage-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
        break;
        
      case 'financial':
        csvContent = generateFinancialCSV(data);
        filename = `financial-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
        break;
        
      case 'members':
        csvContent = generateMembersCSV(data);
        filename = `member-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
        break;
        
      case 'tournaments':
        csvContent = generateTournamentsCSV(data);
        filename = `tournament-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
        break;
        
      case 'invoices':
        csvContent = generateInvoicesCSV(data);
        filename = `invoice-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
        break;
        
      case 'custom':
        csvContent = generateCustomCSV(data);
        filename = `custom-report-${customCriteria.dateRange.startDate}-to-${customCriteria.dateRange.endDate}.csv`;
        break;
    }

    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const generateCourtUsageCSV = (data: any) => {
    if (!data || !data.court_stats) return '';
    
    const headers = ['Court Name', 'Total Reservations', 'Completed', 'Upcoming', 'Revenue', 'Utilization %'];
    const rows = data.court_stats.map((court: any) => [
      court.name,
      court.total_reservations,
      court.completed_reservations,
      court.upcoming_reservations,
      `$${court.total_revenue || 0}`,
      `${court.utilization_rate || 0}%`
    ]);
    
    return [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
  };

  const generateFinancialCSV = (data: any) => {
    if (!data) return '';
    
    const headers = ['Date', 'Payment Type', 'Amount', 'Status', 'Member'];
    const rows = data.payments?.map((payment: any) => [
      new Date(payment.created_at).toLocaleDateString(),
      payment.payment_type,
      `$${payment.amount}`,
      payment.status,
      payment.user?.full_name || 'Unknown'
    ]) || [];
    
    return [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
  };

  const generateMembersCSV = (data: any) => {
    if (!data || !data.stats) return '';
    
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Members', data.stats.total_members],
      ['Active Members', data.stats.active_members],
      ['Membership Rate', `${data.stats.membership_rate}%`],
      ['Courts', data.stats.courts],
      ['Tournaments Organized', data.stats.tournaments_organized]
    ];
    
    return [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
  };

  const generateTournamentsCSV = (data: any) => {
    if (!data || !data.tournaments) return '';
    
    const headers = ['Tournament Name', 'Start Date', 'End Date', 'Participants', 'Status', 'Revenue'];
    const rows = data.tournaments.map((tournament: any) => [
      tournament.name,
      new Date(tournament.start_date).toLocaleDateString(),
      new Date(tournament.end_date).toLocaleDateString(),
      tournament.participant_count || 0,
      tournament.status,
      `$${tournament.total_revenue || 0}`
    ]);
    
    return [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
  };

  const generateInvoicesCSV = (data: any) => {
    if (!data || !data.payments) return '';
    
    const headers = ['Invoice #', 'Member', 'Amount', 'Due Date', 'Status', 'Created Date'];
    const rows = data.payments.map((payment: any) => [
      payment.invoice_number || payment.id,
      payment.user?.full_name || 'Unknown',
      `$${payment.amount}`,
      payment.due_date ? new Date(payment.due_date).toLocaleDateString() : 'N/A',
      payment.status,
      new Date(payment.created_at).toLocaleDateString()
    ]);
    
    return [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
  };

  const generateCustomCSV = (data: any) => {
    if (!data) return '';
    
    let csvContent = 'Custom Report Summary\n\n';
    
    // Add court stats
    if (data.court_stats) {
      csvContent += 'Court Statistics\n';
      csvContent += 'Court Name,Total Reservations,Revenue,Utilization\n';
      data.court_stats.forEach((court: any) => {
        csvContent += `${court.name},${court.total_reservations},$${court.total_revenue || 0},${court.utilization_rate || 0}%\n`;
      });
      csvContent += '\n';
    }
    
    // Add member stats
    if (data.member_stats) {
      csvContent += 'Member Statistics\n';
      csvContent += 'Total Members,Active Members,Membership Rate\n';
      csvContent += `${data.member_stats.stats?.total_members || 0},${data.member_stats.stats?.active_members || 0},${data.member_stats.stats?.membership_rate || 0}%\n\n`;
    }
    
    // Add financial summary
    if (data.financial_stats) {
      csvContent += 'Financial Summary\n';
      csvContent += 'Total Revenue,Total Payments,Average Payment\n';
      const totalRevenue = data.financial_stats.payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
      const totalPayments = data.financial_stats.payments?.length || 0;
      const avgPayment = totalPayments > 0 ? totalRevenue / totalPayments : 0;
      csvContent += `$${totalRevenue},${totalPayments},$${avgPayment.toFixed(2)}\n\n`;
    }
    
    return csvContent;
  };

  const getReportTitle = (type: string) => {
    const titles: { [key: string]: string } = {
      'court-usage': 'Court Usage Report',
      'financial': 'Financial Report',
      'members': 'Member Report',
      'tournaments': 'Tournament Report',
      'invoices': 'Invoice Report',
      'custom': 'Custom Report'
    };
    return titles[type] || 'Report';
  };

  const getReportIcon = (type: string) => {
    const icons: { [key: string]: any } = {
      'court-usage': <Activity className="h-5 w-5 text-blue-500" />,
      'financial': <DollarSign className="h-5 w-5 text-green-500" />,
      'members': <Users className="h-5 w-5 text-purple-500" />,
      'tournaments': <Calendar className="h-5 w-5 text-orange-500" />,
      'invoices': <FileText className="h-5 w-5 text-red-500" />,
      'custom': <Settings className="h-5 w-5 text-gray-300" />
    };
    return icons[type] || <BarChart3 className="h-5 w-5 text-gray-300" />;
  };

  const getReportDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      'court-usage': 'Track court utilization, revenue, and booking patterns',
      'financial': 'Revenue, expenses, and profit analysis',
      'members': 'Member statistics and participation data',
      'tournaments': 'Tournament performance and financial data',
      'invoices': 'Payment status and outstanding invoices',
      'custom': 'Create comprehensive reports with specific criteria'
    };
    return descriptions[type] || 'Generate detailed analytics report';
  };

  return (
    <div className="space-y-6">
      {/* Header with Date Range Selector */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-purple-500" />
              <span>Reports & Analytics</span>
            </h2>
            <p className="text-gray-300 mt-1">Generate comprehensive business reports and analytics</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4 text-gray-300" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-300">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={() => {
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
                
                setDateRange({
                  startDate: startDate.toISOString().split('T')[0],
                  endDate: endDate.toISOString().split('T')[0]
                });
              }}
              className="px-3 py-2 text-sm text-gray-300 hover:text-gray-800 flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Report Generation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Court Usage Report */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <h4 className="text-sm font-medium text-blue-900 flex items-center space-x-2">
              {getReportIcon('court-usage')}
              <span>Court Usage Report</span>
            </h4>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-gray-300 mb-4">
              {getReportDescription('court-usage')}
            </p>
            <button 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              onClick={() => generateReport('court-usage')}
              disabled={isLoading['court-usage']}
            >
              {isLoading['court-usage'] ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{isLoading['court-usage'] ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </div>
        </div>

        {/* Financial Report */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
            <h4 className="text-sm font-medium text-green-900 flex items-center space-x-2">
              {getReportIcon('financial')}
              <span>Financial Report</span>
            </h4>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-gray-300 mb-4">
              {getReportDescription('financial')}
            </p>
            <button 
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              onClick={() => generateReport('financial')}
              disabled={isLoading['financial']}
            >
              {isLoading['financial'] ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{isLoading['financial'] ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </div>
        </div>

        {/* Member Report */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
            <h4 className="text-sm font-medium text-purple-900 flex items-center space-x-2">
              {getReportIcon('members')}
              <span>Member Report</span>
            </h4>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-gray-300 mb-4">
              {getReportDescription('members')}
            </p>
            <button 
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              onClick={() => generateReport('members')}
              disabled={isLoading['members']}
            >
              {isLoading['members'] ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{isLoading['members'] ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </div>
        </div>

        {/* Tournament Report */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <h4 className="text-sm font-medium text-orange-900 flex items-center space-x-2">
              {getReportIcon('tournaments')}
              <span>Tournament Report</span>
            </h4>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-gray-300 mb-4">
              {getReportDescription('tournaments')}
            </p>
            <button 
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              onClick={() => generateReport('tournaments')}
              disabled={isLoading['tournaments']}
            >
              {isLoading['tournaments'] ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{isLoading['tournaments'] ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </div>
        </div>

        {/* Invoice Report */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100">
            <h4 className="text-sm font-medium text-red-900 flex items-center space-x-2">
              {getReportIcon('invoices')}
              <span>Invoice Report</span>
            </h4>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-gray-300 mb-4">
              {getReportDescription('invoices')}
            </p>
            <button 
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              onClick={() => generateReport('invoices')}
              disabled={isLoading['invoices']}
            >
              {isLoading['invoices'] ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{isLoading['invoices'] ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </div>
        </div>

        {/* Custom Report */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h4 className="text-sm font-medium text-gray-900 flex items-center space-x-2">
              {getReportIcon('custom')}
              <span>Custom Report</span>
            </h4>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-gray-300 mb-4">
              {getReportDescription('custom')}
            </p>
            <button 
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              onClick={() => setShowCustomModal(true)}
              disabled={isLoading['custom']}
            >
              <Settings className="h-4 w-4" />
              <span>Configure & Generate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Reports Summary */}
      {Object.keys(reportData).length > 0 && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Reports Generated</h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(reportData).map(([type, data]) => (
                <div key={type} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{getReportTitle(type)}</h4>
                    <button
                      onClick={() => downloadReport(type, data)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-300">
                    Generated on {new Date().toLocaleDateString()}
                  </p>
                  {data && (
                    <div className="mt-2 text-xs text-gray-300">
                      {type === 'court-usage' && data.court_stats && (
                        <span>{data.court_stats.length} courts analyzed</span>
                      )}
                      {type === 'financial' && data.payments && (
                        <span>{data.payments.length} transactions</span>
                      )}
                      {type === 'members' && data.stats && (
                        <span>{data.stats.total_members} total members</span>
                      )}
                      {type === 'tournaments' && data.tournaments && (
                        <span>{data.tournaments.length} tournaments</span>
                      )}
                      {type === 'invoices' && data.payments && (
                        <span>{data.payments.length} invoices</span>
                      )}
                      {type === 'custom' && (
                        <span>Comprehensive analysis</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Report Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configure Custom Report</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select
                    value={customCriteria.reportType}
                    onChange={(e) => setCustomCriteria(prev => ({ ...prev, reportType: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="comprehensive">Comprehensive Analysis</option>
                    <option value="performance">Performance Metrics</option>
                    <option value="financial">Financial Summary</option>
                    <option value="operational">Operational Insights</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customCriteria.dateRange.startDate}
                    onChange={(e) => setCustomCriteria(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, startDate: e.target.value }
                    }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={customCriteria.dateRange.endDate}
                    onChange={(e) => setCustomCriteria(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, endDate: e.target.value }
                    }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowCustomModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  onClick={() => {
                    generateReport('custom');
                    setShowCustomModal(false);
                  }}
                  disabled={isLoading['custom']}
                >
                  {isLoading['custom'] ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports; 