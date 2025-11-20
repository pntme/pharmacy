import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import DataTable, { Column } from '../components/DataTable';
import { salesAPI } from '../services/api';

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
  };
  items?: any[];
}

export default function Sales() {
  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [viewDialog, setViewDialog] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const response = await salesAPI.getAll();
      setSales(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (order: SalesOrder) => {
    try {
      const response = await salesAPI.getById(order.order_id);
      setSelectedOrder(response.data);
      setViewDialog(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch order details');
    }
  };

  const handleCloseDialog = () => {
    setViewDialog(false);
    setSelectedOrder(null);
  };

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
      format: (value, row) => {
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
      format: (value) => `₹${value.toFixed(2)}`,
    },
    {
      id: 'total_amount',
      label: 'Total',
      minWidth: 120,
      align: 'right',
      format: (value) => (
        <Typography variant="body2" fontWeight="bold">
          ₹{value.toFixed(2)}
        </Typography>
      ),
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
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Items
                    </Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.product_name || 'Product'}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                            <TableCell align="right">₹{item.price?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell align="right">₹{item.total?.toFixed(2) || '0.00'}</TableCell>
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
                          <Typography variant="body2">₹{selectedOrder.subtotal.toFixed(2)}</Typography>
                        </Box>
                        {selectedOrder.discount_amount && selectedOrder.discount_amount > 0 && (
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="error">
                              Discount
                            </Typography>
                            <Typography variant="body2" color="error">
                              -₹{selectedOrder.discount_amount.toFixed(2)}
                            </Typography>
                          </Box>
                        )}
                        {selectedOrder.cgst_amount && selectedOrder.cgst_amount > 0 && (
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">CGST</Typography>
                            <Typography variant="body2">₹{selectedOrder.cgst_amount.toFixed(2)}</Typography>
                          </Box>
                        )}
                        {selectedOrder.sgst_amount && selectedOrder.sgst_amount > 0 && (
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">SGST</Typography>
                            <Typography variant="body2">₹{selectedOrder.sgst_amount.toFixed(2)}</Typography>
                          </Box>
                        )}
                        {selectedOrder.igst_amount && selectedOrder.igst_amount > 0 && (
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">IGST</Typography>
                            <Typography variant="body2">₹{selectedOrder.igst_amount.toFixed(2)}</Typography>
                          </Box>
                        )}
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between" mb={2}>
                          <Typography variant="h6">Total Amount</Typography>
                          <Typography variant="h6" color="primary">
                            ₹{selectedOrder.total_amount.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2">Amount Paid</Typography>
                          <Typography variant="body2">
                            ₹{(selectedOrder.amount_paid || 0).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2">Balance Due</Typography>
                          <Typography variant="body2" color={selectedOrder.balance_due && selectedOrder.balance_due > 0 ? 'error' : 'success'}>
                            ₹{(selectedOrder.balance_due || 0).toFixed(2)}
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
      </Dialog>
    </Box>
  );
}
