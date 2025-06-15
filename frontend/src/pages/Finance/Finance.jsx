import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const Finance = () => {
  console.log('Finance component is rendering');
  const navigate = useNavigate();

  const financeModules = [
    {
      title: 'Транзакції',
      description: 'Управління фінансовими транзакціями',
      icon: <MoneyIcon />,
      path: '/transactions',
      color: '#4caf50'
    },
    {
      title: 'Інвойси',
      description: 'Створення та управління інвойсами',
      icon: <ReceiptIcon />,
      path: '/invoices',
      color: '#2196f3'
    },
    {
      title: 'Звіти',
      description: 'Фінансові звіти та аналітика',
      icon: <TrendingUpIcon />,
      path: '/reports',
      color: '#ff9800'
    },
    {
      title: 'Рахунки',
      description: 'Управління банківськими рахунками',
      icon: <AccountIcon />,
      path: '/accounts',
      color: '#9c27b0'
    }
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Фінансовий модуль
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Оберіть розділ для роботи з фінансовими даними
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {financeModules.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => navigate(module.path)}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    bgcolor: module.color,
                    width: 64,
                    height: 64,
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {module.icon}
                </Avatar>
                <Typography variant="h6" component="h2" gutterBottom>
                  {module.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {module.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  variant="contained" 
                  sx={{ bgcolor: module.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(module.path);
                  }}
                >
                  Відкрити
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Швидкий доступ
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<MoneyIcon />}
              onClick={() => navigate('/transactions')}
            >
              Нова транзакція
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ReceiptIcon />}
              onClick={() => navigate('/invoices/new')}
            >
              Новий інвойс
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TrendingUpIcon />}
              onClick={() => navigate('/reports')}
            >
              Переглянути звіти
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AccountIcon />}
              onClick={() => navigate('/accounts')}
            >
              Рахунки
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Finance;
