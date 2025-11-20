import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { salesAPI, inventoryAPI } from '../services/api';

interface DailyReport {
  total_sales: number;
  total_orders: number;
  total_cgst: number;
  total_sgst: number;
  total_igst: number;
  avg_order_value: number;
}

interface InventorySummary {
  total_products: number;
  total_value: number;
  low_stock_count: number;
}

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [salesResponse, inventoryResponse] = await Promise.all([
        salesAPI.getDailyReport(),
        inventoryAPI.getSummary(),
      ]);

      setDailyReport(salesResponse.data || null);
      setInventorySummary(inventoryResponse.data || null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" component="div" fontWeight="bold" color={color}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color, fontSize: 48, opacity: 0.3 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Today's Report - {format(new Date(), 'MMMM dd, yyyy')}
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Sales"
            value={`₹${dailyReport?.total_sales?.toFixed(2) || '0.00'}`}
            icon={<TrendingUpIcon fontSize="inherit" />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={dailyReport?.total_orders?.toString() || '0'}
            icon={<ShoppingCartIcon fontSize="inherit" />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg Order Value"
            value={`₹${dailyReport?.avg_order_value?.toFixed(2) || '0.00'}`}
            icon={<PeopleIcon fontSize="inherit" />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={inventorySummary?.low_stock_count?.toString() || '0'}
            icon={<InventoryIcon fontSize="inherit" />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>

      {/* GST Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AccountBalanceIcon color="primary" />
                <Typography variant="h6">GST Summary (Today)</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Tax Type</strong></TableCell>
                      <TableCell align="right"><strong>Amount (₹)</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>CGST</TableCell>
                      <TableCell align="right">₹{dailyReport?.total_cgst?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>SGST</TableCell>
                      <TableCell align="right">₹{dailyReport?.total_sgst?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>IGST</TableCell>
                      <TableCell align="right">₹{dailyReport?.total_igst?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Total GST</strong></TableCell>
                      <TableCell align="right">
                        <strong>
                          ₹{((dailyReport?.total_cgst || 0) + (dailyReport?.total_sgst || 0) + (dailyReport?.total_igst || 0)).toFixed(2)}
                        </strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <InventoryIcon color="primary" />
                <Typography variant="h6">Inventory Summary</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Total Products</strong></TableCell>
                      <TableCell align="right">{inventorySummary?.total_products || 0}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Total Inventory Value</strong></TableCell>
                      <TableCell align="right">₹{inventorySummary?.total_value?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Low Stock Items</strong></TableCell>
                      <TableCell align="right">
                        <Typography
                          color={inventorySummary?.low_stock_count && inventorySummary.low_stock_count > 0 ? 'error' : 'success'}
                          fontWeight="medium"
                        >
                          {inventorySummary?.low_stock_count || 0}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Stock Status</strong></TableCell>
                      <TableCell align="right">
                        <Typography
                          color={inventorySummary?.low_stock_count && inventorySummary.low_stock_count > 0 ? 'warning.main' : 'success.main'}
                          fontWeight="medium"
                        >
                          {inventorySummary?.low_stock_count && inventorySummary.low_stock_count > 0 ? 'Needs Attention' : 'Good'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Information Box */}
      <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          About Reports & Analytics
        </Typography>
        <Typography variant="body2" paragraph>
          This dashboard provides real-time insights into your pharmacy's operations, including:
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography variant="body2">
              <strong>Daily Sales Reports:</strong> Track today's sales performance, order count, and average order value
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>GST Compliance:</strong> Monitor CGST, SGST, and IGST collections for tax filing
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Inventory Insights:</strong> Keep track of total inventory value and low stock alerts
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Real-time Updates:</strong> All metrics update automatically as transactions are processed
            </Typography>
          </li>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
          <em>Note: Historical reports and advanced analytics features can be added based on business requirements.</em>
        </Typography>
      </Paper>
    </Box>
  );
}
