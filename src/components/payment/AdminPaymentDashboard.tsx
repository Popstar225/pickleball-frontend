/**
 * Admin Payment Dashboard Component
 * 
 * Display payment statistics, revenue analytics, and admin controls
 * Includes chart visualizations and profile statistics for SuperAdmin
 */

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertCircle,
  Loader2,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import PaymentService from '@/services/paymentService';
import type { PaymentStats, ProfileStats } from '@/services/paymentService';

interface AdminPaymentDashboardProps {
  isSuperAdmin?: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
];

export const AdminPaymentDashboard = ({
  isSuperAdmin = false,
}: AdminPaymentDashboardProps) => {
  // Fetch payment statistics
  const {
    data: paymentStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['paymentStats'],
    queryFn: async () => {
      const response = await PaymentService.getPaymentStats();
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch payment stats');
      }
      return response.data;
    },
  });

  // Fetch profile statistics (SuperAdmin only)
  const {
    data: profileStats,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['profileStats'],
    queryFn: async () => {
      const response = await PaymentService.getProfileStatistics();
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch profile stats');
      }
      return response.data;
    },
    enabled: isSuperAdmin,
  });

  const isLoading = statsLoading || (isSuperAdmin && profileLoading);
  const error = statsError || profileError;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load dashboard'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${paymentStats?.stats?.total_revenue ? (paymentStats.stats.total_revenue / 100).toFixed(2) : '0.00'}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold">{paymentStats?.stats?.total_payments || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600 opacity-20" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="profiles">Profile Analytics</TabsTrigger>}
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          {/* Payment Type Distribution */}
          {paymentStats?.stats?.by_type && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Payment Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(paymentStats.stats.by_type).map(
                      ([name, data]) => ({
                        name,
                        value: data.count || 0,
                      })
                    )}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(paymentStats.stats.by_type).map(
                      (_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Payment Status Breakdown */}
          {paymentStats?.stats?.by_method && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Payment Method Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(paymentStats.stats.by_method).map(([method, data]) => (
                  <div key={method} className="p-3 border rounded-lg">
                    <p className="text-gray-300 text-sm capitalize">{method}</p>
                    <p className="text-2xl font-bold">{data.count || 0}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Average Transaction */}
          {paymentStats?.stats?.average_payment && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold">Average Transaction Value</h3>
              <p className="text-3xl font-bold mt-2">
                ${(paymentStats.stats.average_payment / 100).toFixed(2)}
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Profile Analytics Tab (SuperAdmin Only) */}
        {isSuperAdmin && (
          <TabsContent value="profiles" className="space-y-4">
            {profileStats && (
              <>
                {/* User Type Distribution */}
                {profileStats?.stats?.by_user_type && (
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-4">Profile Types Created</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {Object.entries(profileStats.stats.by_user_type).map(
                        ([type, data]: [string, any]) => (
                          <div
                            key={type}
                            className="p-3 border rounded-lg text-center hover:bg-gray-50"
                          >
                            <p className="text-gray-300 text-sm capitalize">{type}</p>
                            <p className="text-2xl font-bold">{data.count || 0}</p>
                          </div>
                        )
                      )}
                    </div>
                  </Card>
                )}

                {/* Registration Revenue */}
                {profileStats?.stats?.total_revenue && (
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold">Registration Revenue</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                      <div>
                        <p className="text-gray-300 text-sm">Total Revenue</p>
                        <p className="text-2xl font-bold">
                          ${(profileStats.stats.total_revenue / 100).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">Total Registrations</p>
                        <p className="text-2xl font-bold">{profileStats.stats.total_registrations || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-300 text-sm">User Types</p>
                        <p className="text-2xl font-bold">{profileStats.stats.by_user_type ? Object.keys(profileStats.stats.by_user_type).length : 0}</p>
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminPaymentDashboard;
