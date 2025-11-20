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
  Menu,
  MenuItem,
  Avatar,
  Chip,
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  const drawer = (isCollapsed: boolean) => (
    <div>
      <DrawerHeader>
        {isCollapsed ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Box
              sx={{
                background: 'linear-gradient(135deg, #953553 0%, #7a2a43 100%)',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(149, 53, 83, 0.3)',
              }}
            >
              <LocalPharmacy sx={{ fontSize: 24, color: 'white' }} />
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #953553 0%, #7a2a43 100%)',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                  boxShadow: '0 2px 8px rgba(149, 53, 83, 0.3)',
                }}
              >
                <LocalPharmacy sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    lineHeight: 1.2,
                  }}
                >
                  Dev Systems
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                  }}
                >
                  Pharmacy Management
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleDrawerToggle}>
              <ChevronLeftIcon />
            </IconButton>
          </>
        )}
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <Tooltip title={isCollapsed ? item.text : ''} placement="right" arrow>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    minHeight: 48,
                    justifyContent: isCollapsed ? 'center' : 'initial',
                    px: 2.5,
                    borderRadius: isCollapsed ? 0 : '0 24px 24px 0',
                    mx: isCollapsed ? 0 : 1,
                    my: 0.5,
                    transition: 'all 0.2s ease-in-out',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(149, 53, 83, 0.08)',
                      borderLeft: isCollapsed ? '3px solid #953553' : 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(149, 53, 83, 0.12)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(149, 53, 83, 0.04)',
                      transform: isCollapsed ? 'none' : 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isCollapsed ? 'auto' : 3,
                      justifyContent: 'center',
                      color: isActive ? 'primary.main' : 'text.secondary',
                      transition: 'color 0.2s ease-in-out',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: isCollapsed ? 0 : 1,
                      '& .MuiTypography-root': {
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? 'primary.main' : 'text.primary',
                      },
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
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
                borderRadius: isCollapsed ? 0 : '0 24px 24px 0',
                mx: isCollapsed ? 0 : 1,
                my: 0.5,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'rgba(220, 0, 78, 0.08)',
                  transform: isCollapsed ? 'none' : 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isCollapsed ? 'auto' : 3,
                  justifyContent: 'center',
                  color: 'error.main',
                }}
              >
                <Logout />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                sx={{
                  opacity: isCollapsed ? 0 : 1,
                  '& .MuiTypography-root': {
                    fontWeight: 500,
                  },
                }}
              />
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
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Dev Systems
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
                Pharmacy Management
              </Typography>
            </Box>
          </Box>
          <Tooltip title="User Profile">
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.full_name || user?.username}
          </Typography>
          <Chip
            label={user?.role || 'User'}
            size="small"
            color="primary"
            sx={{ mt: 0.5, fontSize: '0.7rem', height: 20 }}
          />
        </Box>
        <MenuItem onClick={handleLogout} sx={{ py: 1.5, gap: 1.5 }}>
          <Logout fontSize="small" color="error" />
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>

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
