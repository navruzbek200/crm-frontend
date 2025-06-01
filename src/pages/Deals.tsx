import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Pagination,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Deal } from '../types';
import { dealsAPI, customersAPI } from '../services/api';

const DEAL_STATUSES = ['OPEN', 'WON', 'LOST'] as const;
const DEAL_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
const ITEMS_PER_PAGE = 6;

export default function Deals() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    value: '',
    status: 'OPEN' as typeof DEAL_STATUSES[number],
    priority: 'MEDIUM' as typeof DEAL_PRIORITIES[number],
    expectedCloseDate: new Date().toISOString().split('T')[0],
    customerId: '',
  });

  const queryClient = useQueryClient();

  const { data: dealsData, isLoading: isLoadingDeals } = useQuery({
    queryKey: ['deals', page],
    queryFn: async () => {
      const response = await dealsAPI.getAll(page, ITEMS_PER_PAGE);
      return response.data;
    },
  });

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customersAPI.getAll(1, 100); // Get more customers for the dropdown
      return response.data;
    },
  });

  const deals = dealsData?.data || [];
  const customers = customersData?.data || [];
  const totalPages = dealsData?.meta?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Partial<Deal>, 'value'> & { value: string }) => {
      const valueAsNumber = parseFloat(data.value);
      if (isNaN(valueAsNumber)) {
        throw new Error('Please enter a valid number for value');
      }
      const response = await dealsAPI.create({
        ...data,
        value: valueAsNumber.toFixed(2),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<Partial<Deal>, 'value'> & { value: string } }) => {
      const valueAsNumber = parseFloat(data.value);
      if (isNaN(valueAsNumber)) {
        throw new Error('Please enter a valid number for value');
      }
      const response = await dealsAPI.update(id, {
        ...data,
        value: valueAsNumber.toFixed(2),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await dealsAPI.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  const handleOpen = (deal?: Deal) => {
    if (deal) {
      setEditingDeal(deal);
      setFormData({
        title: deal.title,
        description: deal.description,
        value: deal.value.toString(),
        status: deal.status as typeof DEAL_STATUSES[number],
        priority: deal.priority,
        expectedCloseDate: new Date(deal.expectedCloseDate).toISOString().split('T')[0],
        customerId: deal.customerId,
      });
    } else {
      setEditingDeal(null);
      setFormData({
        title: '',
        description: '',
        value: '',
        status: 'OPEN',
        priority: 'MEDIUM',
        expectedCloseDate: new Date().toISOString().split('T')[0],
        customerId: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingDeal(null);
    setFormData({
      title: '',
      description: '',
      value: '',
      status: 'OPEN',
      priority: 'MEDIUM',
      expectedCloseDate: new Date().toISOString().split('T')[0],
      customerId: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      title: formData.title,
      description: formData.description,
      value: formData.value,
      status: formData.status,
      priority: formData.priority,
      customerId: formData.customerId,
      expectedCloseDate: new Date(formData.expectedCloseDate).toISOString(),
    };

    if (editingDeal) {
      updateMutation.mutate({
        id: editingDeal.id,
        data: submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (isLoadingDeals || isLoadingCustomers) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Deals</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Deal
        </Button>
      </Box>

      <Grid container spacing={3}>
        {deals.map((deal) => {
          const customer = customers.find(c => c.id === deal.customerId);
          return (
            <Grid item xs={12} sm={6} key={deal.id}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{deal.title}</Typography>
                    <Box>
                      <IconButton onClick={() => handleOpen(deal)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => deleteMutation.mutate(deal.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography color="text.secondary" gutterBottom>
                      Value: ${Number(deal.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                    <Typography>{deal.description}</Typography>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Chip
                        label={deal.status.replace('_', ' ')}
                        color={deal.status === 'WON' ? 'success' : deal.status === 'LOST' ? 'error' : 'default'}
                      />
                      <Chip
                        label={deal.priority}
                        color={deal.priority === 'HIGH' ? 'error' : deal.priority === 'MEDIUM' ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    </Box>
                    <Typography sx={{ mt: 2 }}>
                      Expected Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                    </Typography>
                    <Typography>Customer: {customer?.companyName}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Created: {new Date(deal.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDeal ? 'Edit Deal' : 'Add Deal'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Value"
              type="number"
              value={formData.value}
              margin="normal"
              required
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              inputProps={{
                step: "1",
                min: "0",
                placeholder: "0.00"
              }}
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as typeof DEAL_STATUSES[number] })
                }
              >
                {DEAL_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as typeof DEAL_PRIORITIES[number] })
                }
              >
                {DEAL_PRIORITIES.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Expected Close Date"
              type="date"
              value={formData.expectedCloseDate}
              onChange={(e) =>
                setFormData({ ...formData, expectedCloseDate: e.target.value })
              }
              margin="normal"
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Customer</InputLabel>
              <Select
                value={formData.customerId}
                label="Customer"
                onChange={(e) =>
                  setFormData({ ...formData, customerId: e.target.value })
                }
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.companyName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDeal ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 