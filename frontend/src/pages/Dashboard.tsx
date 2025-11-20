import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp,
  Inventory,
  People,
  ShoppingCart,
} from '@mui/icons-material';
import { inventoryAPI, salesAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    todaySales: 0,
    totalOrders: 0,
    lowStock: 0,
    patients: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [salesReport, inventorySummary] = await Promise.all([
        salesAPI.getDailyReport({}),
        inventoryAPI.getSummary({}),
      ]);

      setStats({
        todaySales: (salesReport as any)?.summary?.total_sales || 0,
        totalOrders: (salesReport as any)?.summary?.total_orders || 0,
        lowStock: (inventorySummary as any)?.low_stock_count || 0,
        patients: 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {typeof value === 'number' && title.includes('Sales')
                ? `₹${value.toLocaleString()}`
                : value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '50%',
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        Welcome to your pharmacy management system
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Sales"
            value={stats.todaySales}
            icon={<TrendingUp sx={{ color: 'white' }} />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart sx={{ color: 'white' }} />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={stats.lowStock}
            icon={<Inventory sx={{ color: 'white' }} />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={stats.patients}
            icon={<People sx={{ color: 'white' }} />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Use the sidebar to navigate to different sections of the application.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                • <strong>POS / Billing:</strong> Process sales and generate invoices
              </Typography>
              <Typography variant="body2">
                • <strong>Products:</strong> Manage your product catalog
              </Typography>
              <Typography variant="body2">
                • <strong>Inventory:</strong> Track stock levels and expiry dates
              </Typography>
              <Typography variant="body2">
                • <strong>Patients:</strong> Manage customer information
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
