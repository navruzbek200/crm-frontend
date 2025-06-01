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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Interaction } from '../types';
import { interactionsAPI, customersAPI } from '../services/api';

const INTERACTION_TYPES = ['CALL', 'EMAIL', 'MEETING', 'NOTE'] as const;

export default function Interactions() {
  const [open, setOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [formData, setFormData] = useState({
    type: 'CALL' as typeof INTERACTION_TYPES[number],
    subject: '',
    description: '',
    notes: '',
    scheduledAt: new Date().toISOString().split('.')[0],
    completedAt: '',
    customerId: '',
  });

  const queryClient = useQueryClient();

  const { data: interactionsData, isLoading: isLoadingInteractions } = useQuery({
    queryKey: ['interactions'],
    queryFn: async () => {
      const response = await interactionsAPI.getAll();
      return response.data;
    },
  });

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customersAPI.getAll();
      return response.data;
    },
  });

  const interactions = interactionsData?.data || [];
  const customers = customersData?.data || [];

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Interaction>) => {
      const response = await interactionsAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Interaction> }) => {
      const response = await interactionsAPI.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await interactionsAPI.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
    },
  });

  const handleOpen = (interaction?: Interaction) => {
    if (interaction) {
      setEditingInteraction(interaction);
      setFormData({
        type: interaction.type,
        subject: interaction.subject,
        description: interaction.description || '',
        notes: interaction.notes || '',
        scheduledAt: interaction.scheduledAt ? new Date(interaction.scheduledAt).toISOString().split('.')[0] : new Date().toISOString().split('.')[0],
        completedAt: interaction.completedAt ? new Date(interaction.completedAt).toISOString().split('.')[0] : '',
        customerId: interaction.customerId,
      });
    } else {
      setEditingInteraction(null);
      setFormData({
        type: 'CALL',
        subject: '',
        description: '',
        notes: '',
        scheduledAt: new Date().toISOString().split('.')[0],
        completedAt: '',
        customerId: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingInteraction(null);
    setFormData({
      type: 'CALL',
      subject: '',
      description: '',
      notes: '',
      scheduledAt: new Date().toISOString().split('.')[0],
      completedAt: '',
      customerId: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
      completedAt: formData.completedAt ? new Date(formData.completedAt).toISOString() : undefined,
    };
    
    if (editingInteraction) {
      updateMutation.mutate({
        id: editingInteraction.id,
        data: submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (isLoadingInteractions || isLoadingCustomers) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Interactions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Interaction
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gap: 2 }}>
        {interactions.map((interaction) => {
          const customer = customers.find((c) => c.id === interaction.customerId);
          return (
            <Paper key={interaction.id} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6">{interaction.subject}</Typography>
                  <Typography color="text.secondary" gutterBottom>
                    Type: {interaction.type}
                  </Typography>
                  <Typography>{interaction.description}</Typography>
                  {interaction.notes && (
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      Notes: {interaction.notes}
                    </Typography>
                  )}
                  <Typography sx={{ mt: 1 }}>
                    Scheduled: {interaction.scheduledAt ? new Date(interaction.scheduledAt).toLocaleString() : 'Not scheduled'}
                  </Typography>
                  {interaction.completedAt && (
                    <Typography>
                      Completed: {new Date(interaction.completedAt).toLocaleString()}
                    </Typography>
                  )}
                  <Typography>
                    Customer: {customer?.companyName}
                  </Typography>
                </Box>
                <Box>
                  <IconButton onClick={() => handleOpen(interaction)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => deleteMutation.mutate(interaction.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingInteraction ? 'Edit Interaction' : 'Add Interaction'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as typeof INTERACTION_TYPES[number] })
                }
              >
                {INTERACTION_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              label="Subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              margin="normal"
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
            />

            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              margin="normal"
            />

            <TextField
              fullWidth
              required
              label="Scheduled At"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) =>
                setFormData({ ...formData, scheduledAt: e.target.value })
              }
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              fullWidth
              label="Completed At"
              type="datetime-local"
              value={formData.completedAt}
              onChange={(e) =>
                setFormData({ ...formData, completedAt: e.target.value })
              }
              margin="normal"
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
            {editingInteraction ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 