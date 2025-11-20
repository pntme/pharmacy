import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  styled,
  CSSObject,
  Theme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  PointOfSale,
  Inventory,
  People,
  ShoppingCart,
  Assessment,
  Logout,
  LocalPharmacy,
} from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';

const drawerWidth = 240;
const drawerCollapsedWidth = 64;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'POS / Billing', icon: <PointOfSale />, path: '/pos' },
  { text: 'Products', icon: <LocalPharmacy />, path: '/products' },
  { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
  { text: 'Patients', icon: <People />, path: '/patients' },
  { text: 'Sales', icon: <ShoppingCart />, path: '/sales' },
  { text: 'Reports', icon: <Assessment />, path: '/reports' },
];

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: drawerCollapsedWidth,
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (isCollapsed: boolean) => (
    <div>
      <DrawerHeader>
        {!isCollapsed && (
          <Typography variant="h6" noWrap component="div" sx={{ ml: 1 }}>
            Pharmacy MS
          </Typography>
        )}
        {!isCollapsed && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={isCollapsed ? item.text : ''} placement="right" arrow>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: isCollapsed ? 'center' : 'initial',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isCollapsed ? 'auto' : 3,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: isCollapsed ? 0 : 1 }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <Tooltip title={isCollapsed ? 'Logout' : ''} placement="right" arrow>
            <ListItemButton
              onClick={logout}
              sx={{
                minHeight: 48,
                justifyContent: isCollapsed ? 'center' : 'initial',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isCollapsed ? 'auto' : 3,
                  justifyContent: 'center',
                }}
              >
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ opacity: isCollapsed ? 0 : 1 }} />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', sm: `calc(100% - ${open ? drawerWidth : drawerCollapsedWidth}px)` },
          ml: { sm: open ? `${drawerWidth}px` : `${drawerCollapsedWidth}px` },
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleMobileDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Pharmacy Management System
          </Typography>
          <Typography variant="body2">
            Welcome, {user?.full_name || user?.username}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: open ? drawerWidth : drawerCollapsedWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleMobileDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer(false)}
        </Drawer>

        {/* Desktop Drawer */}
        <StyledDrawer variant="permanent" open={open} sx={{ display: { xs: 'none', sm: 'block' } }}>
          {drawer(!open)}
        </StyledDrawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : drawerCollapsedWidth}px)` },
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
