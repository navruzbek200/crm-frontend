import { useState } from 'react';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ForumIcon from '@mui/icons-material/Forum';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { dealsAPI, customersAPI, interactionsAPI } from '../services/api';
import type { Deal, Customer, Interaction } from '../types';

const COLORS = ['#f07067', '#4b944a', '#FFBB28'];
const DEAL_STATUS_COLORS = {
  OPEN: '#FFBB28',
  WON: '#4b944a',
  LOST: '#f07067',
};

const contactPreferenceColors = [
  "#4CAF50", // Call - Green
  "#2196F3", // Meeting - Blue
  "#FF9800", // Email - Orange
  "#9C27B0"  // Note - Purple
];

export default function Dashboard() {
  const { data: dealsData } = useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const response = await dealsAPI.getAll(1, 100);
      return response.data;
    },
  });

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customersAPI.getAll(1, 100);
      return response.data;
    },
  });

  const { data: interactionsData } = useQuery({
    queryKey: ['interactions'],
    queryFn: async () => {
      const response = await interactionsAPI.getAll(1, 100);
      return response.data;
    },
  });

  const deals = dealsData?.data || [];
  const customers = customersData?.data || [];
  const interactions = interactionsData?.data || [];

  // Calculate deal statistics
  const dealsByStatus = deals.reduce((acc: Record<string, number>, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1;
    return acc;
  }, {});

  const dealValueByStatus = deals.reduce((acc: Record<string, number>, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + Number(deal.value);
    return acc;
  }, {});

  const totalDealValue = Object.values(dealValueByStatus).reduce((a, b) => a + b, 0);

  // Calculate customer statistics
  const customersByContactMethod = customers.reduce((acc: Record<string, number>, customer) => {
    acc[customer.preferredContactMethod] = (acc[customer.preferredContactMethod] || 0) + 1;
    return acc;
  }, {});

  // Calculate interaction statistics
  const interactionsByType = interactions.reduce((acc: Record<string, number>, interaction) => {
    acc[interaction.type] = (acc[interaction.type] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for charts
  const dealStatusData = Object.entries(dealsByStatus).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const dealValueData = Object.entries(dealValueByStatus).map(([status, value]) => ({
    name: status,
    value: value,
  }));

  const customerContactData = Object.entries(customersByContactMethod).map(([method, count]) => ({
    name: method,
    value: count,
  }));

  const interactionTypeData = Object.entries(interactionsByType).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  // Get recent deals
  const recentDeals = [...deals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
  <Grid item xs={12} sm={6} md={3}>
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <WorkOutlineIcon color="primary" fontSize="large" />
          <Box>
            <Typography color="textSecondary" gutterBottom>Total Deals</Typography>
            <Typography variant="h4">{deals.length}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>

  <Grid item xs={12} sm={6} md={3}>
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <MonetizationOnIcon color="success" fontSize="large" />
          <Box>
            <Typography color="textSecondary" gutterBottom>Total Value</Typography>
            <Typography variant="h4">${totalDealValue.toLocaleString()}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>

  <Grid item xs={12} sm={6} md={3}>
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <PeopleIcon color="info" fontSize="large" />
          <Box>
            <Typography color="textSecondary" gutterBottom>Total Customers</Typography>
            <Typography variant="h4">{customers.length}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>

  <Grid item xs={12} sm={6} md={3}>
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <ForumIcon color="secondary" fontSize="large" />
          <Box>
            <Typography color="textSecondary" gutterBottom>Total Interactions</Typography>
            <Typography variant="h4">{interactions.length}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grid>
</Grid>


      {/* Charts */}
      <Grid container spacing={3}>
        {/* Deal Status Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Deal Status Distribution</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dealStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {dealStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Deal Value by Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 6, height: 400 }}>
            <Typography variant="h6" gutterBottom>Deal Value by Status</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dealValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#4a9ce8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Customer Contact Method Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Customer Contact Preferences</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerContactData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {customerContactData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={contactPreferenceColors[index % contactPreferenceColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Interaction Type Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, height: 400 }}>
            <Typography variant="h6" gutterBottom>Interaction Types</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={interactionTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                {/* <Legend /> */}
                <Bar dataKey="value" fill="#4CAF50"
                barSize={100}
                />
                
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Deals Table */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>Recent Deals</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentDeals.map((deal) => {
                const customer = customers.find(c => c.id === deal.customerId);
                return (
                  <TableRow key={deal.id}>
                    <TableCell>{deal.title}</TableCell>
                    <TableCell>{customer?.companyName}</TableCell>
                    <TableCell>${Number(deal.value).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={deal.status}
                        sx={{
                          bgcolor: DEAL_STATUS_COLORS[deal.status as keyof typeof DEAL_STATUS_COLORS],
                          color: 'red',
                        }}
                      />
                    </TableCell>
                    <TableCell>{new Date(deal.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
} 