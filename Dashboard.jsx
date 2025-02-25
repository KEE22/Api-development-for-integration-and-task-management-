import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Divider,
  useTheme,
  CircularProgress,
  Chip,
  Tooltip,
  Fade,
  LinearProgress,
  Backdrop,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Flag as FlagIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import TodoItem from '../components/TodoItem';
import AddTodoDialog from '../components/AddTodoDialog';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../services/todoService';
import { logout, getCurrentUser } from '../services/authService';
import { getNotifications } from '../services/notificationService';

const drawerWidth = 280;

const Dashboard = () => {
  const [todos, setTodos] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0
  });
  
  const navigate = useNavigate();
  const theme = useTheme();
  const user = getCurrentUser();

  useEffect(() => {
    fetchData();
  }, [selectedSection]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [todosData, notificationsData] = await Promise.all([
        getTodos(),
        getNotifications()
      ]);
      setTodos(todosData);
      setNotifications(notificationsData);
      updateStats(todosData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (todosData) => {
    const newStats = {
      total: todosData.length,
      completed: todosData.filter(todo => todo.status === 'completed').length,
      pending: todosData.filter(todo => todo.status === 'pending').length,
      highPriority: todosData.filter(todo => todo.priority === 'high').length
    };
    setStats(newStats);
  };

  const handleAddTodo = async (todoData) => {
    try {
      const newTodo = await createTodo(todoData);
      setTodos([newTodo, ...todos]);
      setIsAddDialogOpen(false);
      updateStats([...todos, newTodo]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleUpdateTodo = async (id, updates) => {
    try {
      const updatedTodo = await updateTodo(id, updates);
      const updatedTodos = todos.map(todo => 
        todo._id === id ? updatedTodo : todo
      );
      setTodos(updatedTodos);
      updateStats(updatedTodos);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodo(id);
      const updatedTodos = todos.filter(todo => todo._id !== id);
      setTodos(updatedTodos);
      updateStats(updatedTodos);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredTodos = () => {
    switch (selectedSection) {
      case 'today':
        return todos.filter(todo => {
          const today = new Date().toISOString().split('T')[0];
          return todo.dueDate?.split('T')[0] === today;
        });
      case 'upcoming':
        return todos.filter(todo => {
          const today = new Date().toISOString().split('T')[0];
          return todo.dueDate?.split('T')[0] > today;
        });
      case 'important':
        return todos.filter(todo => todo.priority === 'high');
      case 'completed':
        return todos.filter(todo => todo.status === 'completed');
      default:
        return todos;
    }
  };

  const chartData = [
    { name: 'Completed', value: stats.completed, color: '#2e7d32' },
    { name: 'Pending', value: stats.pending, color: '#ed6c02' },
    { name: 'High Priority', value: stats.highPriority, color: '#d32f2f' }
  ];

  const renderWelcomeSection = () => (
    <Box
      sx={{
        mb: 4,
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(13,71,161,0.9) 0%, rgba(0,191,165,0.9) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }}
    >
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={8}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            You have {stats.pending} pending tasks and {stats.highPriority} high priority items today
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.9)',
              color: '#0d47a1',
              '&:hover': {
                bgcolor: 'white',
              },
              borderRadius: 2,
              px: 4,
              py: 1.5,
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
          >
            New Task
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderStats = () => (
    <Grid container spacing={3}>
      {[
        {
          title: 'Total Tasks',
          value: stats.total,
          icon: <AssignmentIcon />,
          gradient: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          increase: '+12%',
        },
        {
          title: 'Completed',
          value: stats.completed,
          icon: <CheckCircleIcon />,
          gradient: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          increase: '+5%',
        },
        {
          title: 'In Progress',
          value: stats.pending,
          icon: <PendingIcon />,
          gradient: 'linear-gradient(135deg, #ed6c02 0%, #e65100 100%)',
          increase: '-3%',
        },
        {
          title: 'High Priority',
          value: stats.highPriority,
          icon: <FlagIcon />,
          gradient: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
          increase: '+8%',
        },
      ].map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              sx={{
                background: stat.gradient,
                borderRadius: 3,
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  p: 2,
                  zIndex: 1,
                }}
              >
                {stat.icon}
              </Box>
              <CardContent sx={{ position: 'relative', zIndex: 2 }}>
                <Typography
                  variant="h3"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    mb: 2,
                  }}
                >
                  {stat.title}
                </Typography>
                <Chip
                  label={stat.increase}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '& .MuiChip-label': {
                      fontWeight: 500,
                    },
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );

  const renderChart = () => (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid item xs={12} md={8}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            background: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" color="primary">
              Task Progress Overview
            </Typography>
            <Box>
              <IconButton size="small" sx={{ mr: 1 }}>
                <FilterListIcon />
              </IconButton>
              <IconButton size="small">
                <DownloadIcon />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { name: 'Mon', completed: 4, pending: 3 },
                  { name: 'Tue', completed: 3, pending: 5 },
                  { name: 'Wed', completed: 6, pending: 2 },
                  { name: 'Thu', completed: 4, pending: 4 },
                  { name: 'Fri', completed: 7, pending: 3 },
                  { name: 'Sat', completed: 5, pending: 2 },
                  { name: 'Sun', completed: 3, pending: 4 },
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#00BFA5"
                  strokeWidth={2}
                  dot={{ fill: '#00BFA5' }}
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#FFA726"
                  strokeWidth={2}
                  dot={{ fill: '#FFA726' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            height: '100%',
            background: 'rgba(30, 30, 30, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          }}
        >
          <Typography variant="h6" color="primary" gutterBottom>
            Task Distribution
          </Typography>
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: stats.completed, color: '#00BFA5' },
                    { name: 'Pending', value: stats.pending, color: '#FFA726' },
                    { name: 'High Priority', value: stats.highPriority, color: '#F44336' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );

  const drawer = (
    <Box sx={{ bgcolor: 'background.paper', height: '100%' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {user?.name?.charAt(0) || 'U'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{user?.name || 'User'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {[
          { text: 'Dashboard', icon: <DashboardIcon />, value: 'dashboard' },
          { text: 'Today', icon: <TodayIcon />, value: 'today' },
          { text: 'Upcoming', icon: <DateRangeIcon />, value: 'upcoming' },
          { text: 'Important', icon: <StarIcon />, value: 'important' },
          { text: 'Completed', icon: <AssignmentIcon />, value: 'completed' },
        ].map((item) => (
          <ListItem
            button
            key={item.text}
            selected={selectedSection === item.value}
            onClick={() => setSelectedSection(item.value)}
            sx={{
              '&.Mui-selected': {
                bgcolor: 'primary.dark',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#121212' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="primary" sx={{ flexGrow: 1 }}>
            {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}
          </Typography>
          <IconButton
            onClick={(e) => setNotificationAnchor(e.currentTarget)}
          >
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ ml: 2 }}
          >
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: '#121212',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        {renderWelcomeSection()}
        {selectedSection === 'dashboard' && (
          <>
            {renderStats()}
            {renderChart()}
          </>
        )}

        <Box sx={{ mt: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'rgba(30, 30, 30, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="h5" color="primary">
                {selectedSection === 'dashboard' ? 'Recent Tasks' : 'Tasks'}
              </Typography>
              <Box>
                <IconButton size="small" sx={{ mr: 1 }}>
                  <SearchIcon />
                </IconButton>
                <IconButton size="small" sx={{ mr: 1 }}>
                  <FilterListIcon />
                </IconButton>
                <IconButton size="small">
                  <SortIcon />
                </IconButton>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress color="primary" />
              </Box>
            ) : (
              <AnimatePresence>
                {filteredTodos().map((todo, index) => (
                  <motion.div
                    key={todo._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TodoItem
                      todo={todo}
                      onUpdate={handleUpdateTodo}
                      onDelete={handleDeleteTodo}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </Paper>
        </Box>

        <SpeedDial
          ariaLabel="Task actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<AddIcon />}
            tooltipTitle="New Task"
            onClick={() => setIsAddDialogOpen(true)}
          />
          <SpeedDialAction
            icon={<PrintIcon />}
            tooltipTitle="Print"
            onClick={() => {}}
          />
          <SpeedDialAction
            icon={<ShareIcon />}
            tooltipTitle="Share"
            onClick={() => {}}
          />
        </SpeedDial>
      </Box>

      <AddTodoDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddTodo}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={() => setNotificationAnchor(null)}
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem key={notification._id}>
              {notification.message}
            </MenuItem>
          ))
        ) : (
          <MenuItem>No new notifications</MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default Dashboard;