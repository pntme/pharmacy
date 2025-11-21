import { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Search as SearchIcon, Print as PrintIcon } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import DataTable, { Column } from '../components/DataTable';
import { salesAPI } from '../services/api';
import ThermalInvoice from '../components/ThermalInvoice';

interface SalesOrder {
  order_id: number;
  order_number: string;
  order_type: string;
  order_date: string;
  status: string;
  payment_status: string;
  subtotal: number;
  discount_amount?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  total_amount: number;
  amount_paid?: number;
  balance_due?: number;
  patient?: {
    first_name: string;
    last_name: string;
    phone_number: string;
    patient_code?: string;
  };
  SalesOrderItems?: Array<{
    order_item_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    discount_amount?: number;
    gst_amount?: number;
    Product?: {
      product_name: string;
      item_code?: string;
      generic_name?: string;
    };
  }>;
}

export default function Sales() {
  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [allSales, setAllSales] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  // Helper function to safely format numbers
  const formatCurrency = (value: any): string => {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // Filter sales based on search query (client-side filtering)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSales(allSales);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allSales.filter(sale => {
      const orderNumber = sale.order_number?.toLowerCase() || '';
      const patientName = sale.patient
        ? `${sale.patient.first_name} ${sale.patient.last_name}`.toLowerCase()
        : '';
      const patientPhone = sale.patient?.phone_number?.toLowerCase() || '';
      const patientCode = sale.patient?.patient_code?.toLowerCase() || '';

      return orderNumber.includes(query) ||
             patientName.includes(query) ||
             patientPhone.includes(query) ||
             patientCode.includes(query);
    });

    setSales(filtered);
  }, [searchQuery, allSales]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await salesAPI.getAll() as any;
      const salesData = response.data?.sales || [];
      setAllSales(salesData);
      setSales(salesData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (order: SalesOrder) => {
    try {
      const response = await salesAPI.getById(order.order_id) as any;
      setSelectedOrder(response.data?.order || response.data);
      setViewDialog(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch order details');
    }
  };

  const handleCloseDialog = () => {
    setViewDialog(false);
    setSelectedOrder(null);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${selectedOrder?.order_number}`,
    onAfterPrint: () => toast.success('Invoice printed successfully'),
  });

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      completed: 'success',
      processing: 'info',
      pending: 'warning',
      cancelled: 'error',
      draft: 'default',
    };
    return statusColors[status] || 'default';
  };

  const getPaymentStatusColor = (status: string) => {
    const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      paid: 'success',
      partial: 'warning',
      unpaid: 'error',
      refunded: 'info',
    };
    return statusColors[status] || 'default';
  };

  const columns: Column[] = [
    {
      id: 'order_number',
      label: 'Order #',
      minWidth: 120,
    },
    {
      id: 'order_date',
      label: 'Date',
      minWidth: 150,
      format: (value) => format(new Date(value), 'MMM dd, yyyy HH:mm'),
    },
    {
      id: 'order_type',
      label: 'Type',
      minWidth: 100,
      format: (value) => (
        <Chip
          label={value.toUpperCase()}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'patient',
      label: 'Customer',
      minWidth: 180,
      format: (_value, row) => {
        if (row.patient) {
          return (
            <Box>
              <Typography variant="body2">
                {row.patient.first_name} {row.patient.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.patient.phone_number}
              </Typography>
            </Box>
          );
        }
        return <Typography variant="body2" color="text.secondary">Walk-in</Typography>;
      },
    },
    {
      id: 'subtotal',
      label: 'Subtotal',
      minWidth: 100,
      align: 'right',
      format: (value) => {
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        return isNaN(numValue) ? '₹0.00' : `₹${numValue.toFixed(2)}`;
      },
    },
    {
      id: 'total_amount',
      label: 'Total',
      minWidth: 120,
      align: 'right',
      format: (value) => {
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        const formatted = isNaN(numValue) ? '0.00' : numValue.toFixed(2);
        return (
          <Typography variant="body2" fontWeight="bold">
            ₹{formatted}
          </Typography>
        );
      },
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      align: 'center',
      format: (value) => (
        <Chip
          label={value.toUpperCase()}
          size="small"
          color={getStatusColor(value)}
        />
      ),
    },
    {
      id: 'payment_status',
      label: 'Payment',
      minWidth: 120,
      align: 'center',
      format: (value) => (
        <Chip
          label={value.toUpperCase()}
          size="small"
          color={getPaymentStatusColor(value)}
        />
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Sales History</Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by order number, patient name, phone, or patient code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DataTable
        columns={columns}
        data={sales}
        loading={loading}
        onView={handleViewOrder}
        emptyMessage="No sales records found. Complete sales through the POS to see them here."
      />

      {/* Order Details Dialog */}
      <Dialog open={viewDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Order Details - {selectedOrder?.order_number}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Order Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Order Information
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Order Number
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {selectedOrder.order_number}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Date & Time
                        </Typography>
                        <Typography variant="body1">
                          {format(new Date(selectedOrder.order_date), 'MMM dd, yyyy HH:mm:ss')}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Type
                        </Typography>
                        <Chip
                          label={selectedOrder.order_type.toUpperCase()}
                          size="small"
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={selectedOrder.status.toUpperCase()}
                          size="small"
                          color={getStatusColor(selectedOrder.status)}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Customer Information */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Customer Information
                      </Typography>
                      {selectedOrder.patient ? (
                        <>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Name
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedOrder.patient.first_name} {selectedOrder.patient.last_name}
                            </Typography>
                          </Box>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Phone Number
                            </Typography>
                            <Typography variant="body1">
                              {selectedOrder.patient.phone_number}
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                          Walk-in Customer
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Items */}
                {selectedOrder.SalesOrderItems && selectedOrder.SalesOrderItems.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Items / Medicines Purchased
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell>Generic Name</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.isArray(selectedOrder.SalesOrderItems) && selectedOrder.SalesOrderItems.map((item: any) => (
                          <TableRow key={item.order_item_id}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {item.Product?.product_name || 'Unknown Product'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.Product?.item_code || ''}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {item.Product?.generic_name || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight="medium">
                                {item.quantity}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              ₹{Number(item.unit_price || 0).toFixed(2)}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">
                                ₹{Number(item.total_price || 0).toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Grid>
                )}

                {/* Payment Summary */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Payment Summary
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Subtotal</Typography>
                          <Typography variant="body2">₹{formatCurrency(selectedOrder.subtotal)}</Typography>
                        </Box>
                        {selectedOrder.discount_amount && selectedOrder.discount_amount > 0 && (
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="error">
                              Discount
                            </Typography>
                            <Typography variant="body2" color="error">
                              -₹{formatCurrency(selectedOrder.discount_amount)}
                            </Typography>
                          </Box>
                        )}
                        {selectedOrder.cgst_amount && selectedOrder.cgst_amount > 0 && (
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">CGST</Typography>
                            <Typography variant="body2">₹{formatCurrency(selectedOrder.cgst_amount)}</Typography>
                          </Box>
                        )}
                        {selectedOrder.sgst_amount && selectedOrder.sgst_amount > 0 && (
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">SGST</Typography>
                            <Typography variant="body2">₹{formatCurrency(selectedOrder.sgst_amount)}</Typography>
                          </Box>
                        )}
                        {selectedOrder.igst_amount && selectedOrder.igst_amount > 0 && (
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">IGST</Typography>
                            <Typography variant="body2">₹{formatCurrency(selectedOrder.igst_amount)}</Typography>
                          </Box>
                        )}
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between" mb={2}>
                          <Typography variant="h6">Total Amount</Typography>
                          <Typography variant="h6" color="primary">
                            ₹{formatCurrency(selectedOrder.total_amount)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Amount Paid</Typography>
                          <Typography variant="body2">
                            ₹{formatCurrency(selectedOrder.amount_paid)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Balance Due</Typography>
                          <Typography variant="body2" color={selectedOrder.balance_due && selectedOrder.balance_due > 0 ? 'error' : 'success'}>
                            ₹{formatCurrency(selectedOrder.balance_due)}
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            label={selectedOrder.payment_status.toUpperCase()}
                            color={getPaymentStatusColor(selectedOrder.payment_status)}
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Close
          </Button>
          <Button
            onClick={handlePrint}
            variant="contained"
            startIcon={<PrintIcon />}
            disabled={!selectedOrder}
          >
            Print Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden Thermal Invoice Component for Printing */}
      {selectedOrder && (
        <Box sx={{ display: 'none' }}>
          <ThermalInvoice
            ref={printRef}
            orderNumber={selectedOrder.order_number}
            orderDate={selectedOrder.order_date}
            customerName={
              selectedOrder.patient
                ? `${selectedOrder.patient.first_name} ${selectedOrder.patient.last_name}`
                : undefined
            }
            customerPhone={selectedOrder.patient?.phone_number}
            items={
              selectedOrder.SalesOrderItems?.map(item => ({
                product_name: item.Product?.product_name || 'Unknown Product',
                quantity: item.quantity,
                unit_price: item.unit_price,
                total_price: item.total_price,
                discount_amount: item.discount_amount,
              })) || []
            }
            subtotal={selectedOrder.subtotal}
            discountAmount={selectedOrder.discount_amount}
            cgstAmount={selectedOrder.cgst_amount}
            sgstAmount={selectedOrder.sgst_amount}
            igstAmount={selectedOrder.igst_amount}
            totalAmount={selectedOrder.total_amount}
            amountPaid={selectedOrder.amount_paid}
          />
        </Box>
      )}
    </Box>
  );
}
