import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Class as ClassIcon,
  Assessment,
  FaceRetouchingNatural,
  CheckCircle,
  CalendarMonth,
  Logout,
  Settings,
  Brightness4,
  Brightness7,
  School,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useAppTheme } from '../../context/ThemeContext';

interface NavigationProps {
  children: React.ReactNode;
}

const Navigation: React.FC<NavigationProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useAppTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Navigation items based on user role
  const lecturerNavItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/lecturer/dashboard' },
    { text: 'Classes', icon: <ClassIcon />, path: '/lecturer/classes' },
    { text: 'Reports', icon: <Assessment />, path: '/lecturer/reports' },
  ];

  const studentNavItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/student/dashboard' },
    { text: 'Check In', icon: <CheckCircle />, path: '/student/checkin' },
    { text: 'My Attendance', icon: <CalendarMonth />, path: '/student/attendance' },
    { text: 'Register Face', icon: <FaceRetouchingNatural />, path: '/student/register-face' },
  ];

  const navItems = user?.role === 'lecturer' ? lecturerNavItems : studentNavItems;

  const drawer = (
    <Box sx={{ width: 240 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 2, minHeight: '64px' }}>
        <School sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          SATS
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <School sx={{ mr: 2, display: { xs: 'none', md: 'block' } }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}
            fontWeight="bold"
          >
            Student Attendance Tracking System
          </Typography>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'block', md: 'none' } }}
            fontWeight="bold"
          >
            SATS
          </Typography>

          {/* Theme Toggle */}
          <IconButton color="inherit" onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* User Menu */}
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar
              sx={{ bgcolor: 'secondary.main' }}
              alt={user?.firstName}
              src={user?.profileImage}
            >
              {user?.firstName?.charAt(0)}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                {user?.firstName} {user?.lastName}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer for Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
            position: 'fixed',
            top: 0,
            height: '100vh',
          },
        }}
        open
      >
        {drawer}
      </Drawer> 

      {/* Drawer for Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { md: '240px' },
          width: { xs: '100%', md: `calc(100% - 240px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Navigation;
