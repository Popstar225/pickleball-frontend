/**
 * Payment History Component
 * 
 * Display user's payment transactions with filters and pagination
 * Admin can view refunded/disputed payments
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Download,
  MoreVertical,
  AlertCircle,
  Loader2,
  Eye,
  FileText,
  RotateCcw,
} from 'lucide-react';
import PaymentService from '@/services/paymentService';
import type { Payment } from '@/services/paymentService';

interface PaymentHistoryProps {
  userId?: string;
  isAdmin?: boolean;
  onRefund?: (paymentId: string) => Promise<void>;
}

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  profile_registration: 'Profile Registration',
  membership_fee: 'Membership Fee',
  tournament_registration: 'Tournament Registration',
  court_rental: 'Court Rental',
  equipment_purchase: 'Equipment Purchase',
  donation: 'Donation',
  subscription_upgrade: 'Subscription Upgrade',
  other: 'Other',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-orange-100 text-orange-800',
};

export const PaymentHistory = ({
  userId,
  isAdmin = false,
  onRefund,
}: PaymentHistoryProps) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  const {
    data: paymentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'paymentHistory',
      userId,
      page,
      pageSize,
      statusFilter,
      typeFilter,
      searchQuery,
    ],
    queryFn: async () => {
      if (!userId) return null;
      const response = await PaymentService.getUserPaymentHistory(userId);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch payment history');
      }
      return response.data;
    },
    enabled: !!userId,
  });

  // Filter and paginate data
  const filteredPayments = paymentsData?.filter((payment) => {
    let matches = true;

    if (statusFilter && payment.status !== statusFilter) matches = false;
    if (typeFilter && payment.payment_type !== typeFilter) matches = false;
    if (
      searchQuery &&
      !payment.id.includes(searchQuery)
    )
      matches = false;

    return matches;
  });

  const paginatedPayments = filteredPayments?.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = filteredPayments
    ? Math.ceil(filteredPayments.length / pageSize)
    : 0;

  const handleRefund = async (payment: Payment) => {
    if (!onRefund) return;

    setIsRefunding(true);
    setRefundError(null);

    try {
      await onRefund(payment.id);
      await refetch();
      setSelectedPayment(null);
      setIsDetailOpen(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Refund failed';
      setRefundError(errorMessage);
    } finally {
      setIsRefunding(false);
    }
  };

  const downloadReceipt = (payment: Payment) => {
    // Create a simple receipt
    const receiptContent = `
PAYMENT RECEIPT
_______________

Transaction ID: ${payment.id}
Date: ${new Date(payment.created_at).toLocaleDateString()}
Status: ${payment.status}

Type: ${PAYMENT_TYPE_LABELS[payment.payment_type]}
${payment.description ? `Description: ${payment.description}` : ''}

Amount: ${payment.currency.toUpperCase()} ${(payment.amount / 100).toFixed(2)}
${payment.refund_amount ? `Refunded Amount: ${payment.currency.toUpperCase()} ${(payment.refund_amount / 100).toFixed(2)}` : ''}${payment.refunded_at ? `\nRefund Date: ${new Date(payment.refunded_at).toLocaleDateString()}` : ''}

Payment Method: ${payment.payment_method || 'Unknown'}
    `.trim();

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent)
    );
    element.setAttribute('download', `receipt-${payment.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading payment history...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load payment history'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!paymentsData || paymentsData.length === 0) {
    return (
      <Card className="p-6 text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No payments found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Search by ID or description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
          <Select value={statusFilter} onValueChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="disputed">Disputed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(val) => {
            setTypeFilter(val);
            setPage(1);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="profile_registration">Profile Registration</SelectItem>
              <SelectItem value="membership_fee">Membership Fee</SelectItem>
              <SelectItem value="tournament_registration">Tournament</SelectItem>
              <SelectItem value="court_rental">Court Rental</SelectItem>
              <SelectItem value="equipment_purchase">Equipment</SelectItem>
              <SelectItem value="donation">Donation</SelectItem>
            </SelectContent>
          </Select>
          <Select value={pageSize.toString()} onValueChange={(val) => {
            setPageSize(parseInt(val));
            setPage(1);
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPayments?.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {PAYMENT_TYPE_LABELS[payment.payment_type]}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {payment.payment_method}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {payment.currency.toUpperCase()} {(payment.amount / 100).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge className={PAYMENT_STATUS_COLORS[payment.status]}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPayment(payment);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadReceipt(payment)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download Receipt
                        </DropdownMenuItem>
                        {isAdmin &&
                          payment.status === 'completed' &&
                          !payment.refund_amount && (
                            <DropdownMenuItem
                              onClick={() => handleRefund(payment)}
                              className="text-red-600"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Refund
                            </DropdownMenuItem>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious onClick={() => setPage(page - 1)} />
                </PaginationItem>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => setPage(pageNum)}
                    isActive={page === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {page < totalPages && (
                <PaginationItem>
                  <PaginationNext onClick={() => setPage(page + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Payment Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Transaction #{selectedPayment?.id}</DialogDescription>
          </DialogHeader>

          {refundError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{refundError}</AlertDescription>
            </Alert>
          )}

          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Amount</p>
                  <p className="text-2xl font-bold">
                    {selectedPayment.currency.toUpperCase()} {(selectedPayment.amount / 100).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <Badge className={PAYMENT_STATUS_COLORS[selectedPayment.status]}>
                    {selectedPayment.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-gray-600 text-sm">Type</p>
                <p>{PAYMENT_TYPE_LABELS[selectedPayment.payment_type]}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Payment Method</p>
                <p>{selectedPayment.payment_method}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Date</p>
                  <p>{new Date(selectedPayment.created_at).toLocaleString()}</p>
                </div>
                {selectedPayment.refund_amount && (
                  <div>
                    <p className="text-gray-600">Refund Amount</p>
                    <p>${(selectedPayment.refund_amount / 100).toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => downloadReceipt(selectedPayment)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                {isAdmin &&
                  selectedPayment.status === 'completed' &&
                  !selectedPayment.refund_amount && (
                    <Button
                      onClick={() => handleRefund(selectedPayment)}
                      variant="destructive"
                      disabled={isRefunding}
                      className="flex-1"
                    >
                      {isRefunding ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Refunding...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Refund
                        </>
                      )}
                    </Button>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentHistory;
