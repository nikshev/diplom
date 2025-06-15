import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Avatar, 
  Menu, 
  MenuItem, 
  Tooltip, 
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShoppingCart as OrdersIcon,
  People as CustomersIcon,
  Inventory as ProductsIcon,
  AttachMoney as FinanceIcon,
  BarChart as AnalyticsIcon,
  Description as ReportsIcon,
  Person as UserIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { MODULES } from '../../config';

// Drawer width
const drawerWidth = 240;

const Layout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  console.log('Layout rendering, current location:', location.pathname);

  // State for drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState(true);

  // State for user menu
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle drawer open/close
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // Handle user menu open
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  // Handle user menu close
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Handle notifications menu open
  const handleOpenNotificationsMenu = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  // Handle notifications menu close
  const handleCloseNotificationsMenu = () => {
    setAnchorElNotifications(null);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Navigation items
  const navigationItems = [
    { 
      text: 'Дашборд', 
      icon: <DashboardIcon />, 
      path: '/dashboard', 
      enabled: MODULES.dashboard.enabled 
    },
    { 
      text: 'Замовлення', 
      icon: <OrdersIcon />, 
      path: '/orders', 
      enabled: MODULES.orders.enabled 
    },
    { 
      text: 'Клієнти', 
      icon: <CustomersIcon />, 
      path: '/customers', 
      enabled: MODULES.customers.enabled 
    },
    { 
      text: 'Товари', 
      icon: <ProductsIcon />, 
      path: '/products', 
      enabled: MODULES.inventory.enabled 
    },
    { 
      text: 'Фінанси', 
      icon: <FinanceIcon />, 
      path: '/finance', 
      enabled: MODULES.finance.enabled 
    },
    { 
      text: 'Аналітика', 
      icon: <AnalyticsIcon />, 
      path: '/analytics', 
      enabled: MODULES.analytics.enabled 
    },
    { 
      text: 'Звіти', 
      icon: <ReportsIcon />, 
      path: '/reports', 
      enabled: MODULES.reports.enabled 
    },
    { 
      text: 'Користувачі', 
      icon: <UserIcon />, 
      path: '/users', 
      enabled: MODULES.users.enabled 
    },
    { 
      text: 'Налаштування', 
      icon: <SettingsIcon />, 
      path: '/settings', 
      enabled: MODULES.settings.enabled 
    }
  ];

  // Drawer content
  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" noWrap component="div">
          BAMIS
        </Typography>
        {!isMobile && (
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {navigationItems.filter(item => item.enabled).map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Інформаційна система управління бізнес-діяльністю
          </Typography>
          
          {/* Notifications */}
          <Box sx={{ flexGrow: 0, mr: 2 }}>
            <Tooltip title="Сповіщення">
              <IconButton 
                onClick={handleOpenNotificationsMenu} 
                sx={{ p: 0, color: 'white' }}
              >
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-notifications"
              anchorEl={anchorElNotifications}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElNotifications)}
              onClose={handleCloseNotificationsMenu}
            >
              <MenuItem onClick={handleCloseNotificationsMenu}>
                <Typography textAlign="center">Нове замовлення #12345</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseNotificationsMenu}>
                <Typography textAlign="center">Низький запас товару "Товар 1"</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseNotificationsMenu}>
                <Typography textAlign="center">Звіт "Продажі за місяць" готовий</Typography>
              </MenuItem>
            </Menu>
          </Box>
          
          {/* User menu */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Профіль">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user?.name || 'User'} src={user?.avatar}>
                  {user?.name ? user.name.charAt(0) : <AccountIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                <ListItemIcon>
                  <AccountIcon fontSize="small" />
                </ListItemIcon>
                <Typography textAlign="center">Профіль</Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/settings'); }}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <Typography textAlign="center">Налаштування</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography textAlign="center">Вийти</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Drawer for mobile */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Drawer for desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
