import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Fade,
  Grow,
} from '@mui/material';
import {
  TrendingUp,
  Inventory,
  People,
  ShoppingCart,
} from '@mui/icons-material';
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
  ResponsiveContainer,
} from 'recharts';
import { inventoryAPI, salesAPI } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    todaySales: 0,
    totalOrders: 0,
    lowStock: 0,
    patients: 0,
  });
  const [salesTrendData, setSalesTrendData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashboardStats, weeklySales, categoryBreakdown, topProducts, inventorySummary] = await Promise.all([
        salesAPI.getDashboardStats(),
        salesAPI.getWeeklySalesTrend(),
        salesAPI.getCategoryBreakdown(),
        salesAPI.getTopProducts(),
        inventoryAPI.getSummary({}),
      ]);

      setStats({
        todaySales: (salesReport as any)?.summary?.total_sales || 0,
        totalOrders: (salesReport as any)?.summary?.total_orders || 0,
        lowStock: (inventorySummary as any)?.low_stock_count || 0,
        patients: 0,
      });

      setSalesTrendData(weeklySales?.data || []);
      setCategoryData(categoryBreakdown?.data || []);
      setTopProductsData(topProducts?.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set fallback data on error
      setSalesTrendData([
        { day: 'Mon', sales: 0, orders: 0 },
        { day: 'Tue', sales: 0, orders: 0 },
        { day: 'Wed', sales: 0, orders: 0 },
        { day: 'Thu', sales: 0, orders: 0 },
        { day: 'Fri', sales: 0, orders: 0 },
        { day: 'Sat', sales: 0, orders: 0 },
        { day: 'Sun', sales: 0, orders: 0 },
      ]);
      setCategoryData([]);
      setTopProductsData([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, index }: any) => (
    <Grow in timeout={300 + index * 100}>
      <Card
        sx={{
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}30`,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `${color}10`,
            borderRadius: '0 0 0 100px',
          },
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ zIndex: 1 }}>
              <Typography
                color="textSecondary"
                gutterBottom
                sx={{ fontSize: '0.875rem', fontWeight: 500 }}
              >
                {title}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: color,
                  mb: 1,
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                }}
              >
                {typeof value === 'number' && title.includes('Sales')
                  ? `₹${value.toLocaleString()}`
                  : value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                ↑ 12.5% from yesterday
              </Typography>
            </Box>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                borderRadius: '16px',
                width: 64,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 20px ${color}40`,
                zIndex: 1,
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );

  return (
    <Box>
      <Fade in timeout={500}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Welcome back! Here's what's happening with your pharmacy today.
          </Typography>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Sales"
            value={stats.todaySales}
            icon={<TrendingUp sx={{ color: 'white', fontSize: 32 }} />}
            color="#953553"
            index={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart sx={{ color: 'white', fontSize: 32 }} />}
            color="#2196f3"
            index={1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={stats.lowStock}
            icon={<Inventory sx={{ color: 'white', fontSize: 32 }} />}
            color="#ff9800"
            index={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={stats.patients}
            icon={<People sx={{ color: 'white', fontSize: 32 }} />}
            color="#9c27b0"
            index={3}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Fade in timeout={800}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Sales Trend (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={salesTrendData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#953553" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#953553" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" style={{ fontSize: '0.875rem' }} />
                  <YAxis stroke="#666" style={{ fontSize: '0.875rem' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#953553"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>

        {/* Category Distribution */}
        <Grid item xs={12} lg={4}>
          <Fade in timeout={1000}>
            <Paper sx={{ p: 3, height: '400px' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Sales by Category
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12}>
          <Fade in timeout={1200}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Top Selling Products
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" style={{ fontSize: '0.875rem' }} />
                  <YAxis stroke="#666" style={{ fontSize: '0.875rem' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="sales" fill="#953553" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
}
