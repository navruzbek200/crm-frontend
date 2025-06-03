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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
  Stack,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Videocam as VideocamIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Customer } from '../types';
import { customersAPI } from '../services/api';

const CONTACT_METHODS = ['EMAIL', 'PHONE', 'IN_PERSON', 'VIDEO_CALL'] as const;
type ContactMethod = typeof CONTACT_METHODS[number];

const ITEMS_PER_PAGE = 6;

const getContactMethodIcon = (method: ContactMethod) => {
  switch (method) {
    case 'EMAIL':
      return <EmailIcon />;
    case 'PHONE':
      return <PhoneIcon />;
    case 'IN_PERSON':
      return <PersonIcon />;
    case 'VIDEO_CALL':
      return <VideocamIcon />;
  }
};

export default function Customers() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    website: '',
    notes: '',
    preferredContactMethod: 'EMAIL' as ContactMethod,
  });

  const queryClient = useQueryClient();

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', page],
    queryFn: async () => {
      const response = await customersAPI.getAll(page, ITEMS_PER_PAGE);
      return response.data;
    },
  });

  const customers = customersData?.data || [];
  const totalPages = customersData?.meta?.totalPages || 1;



  const createMutation = useMutation({
    mutationFn: async (data: Partial<Customer>) => {
      const response = await customersAPI.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      handleClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
      const response = await customersAPI.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      handleClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await customersAPI.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const handleOpen = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        companyName: customer.companyName,
        contactName: customer.contactName,
        email: customer.email,
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || '',
        country: customer.country || '',
        website: customer.website || '',
        notes: customer.notes || '',
        preferredContactMethod: customer.preferredContactMethod,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        website: '',
        notes: '',
        preferredContactMethod: 'EMAIL',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCustomer(null);
    setFormData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      website: '',
      notes: '',
      preferredContactMethod: 'EMAIL',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateMutation.mutate({
        id: editingCustomer.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Customers</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Customer
        </Button>
      </Box>

      <Grid container spacing={3}>
        {customers.map((customer) => (
          <Grid item xs={12} sm={6} key={customer.id}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>{customer.companyName}</Typography>
                  <Box>
                    <IconButton onClick={() => handleOpen(customer)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => deleteMutation.mutate(customer.id)}
                      size="medium"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Contact: {customer.contactName}
                  </Typography>
                  
                  <Stack spacing={1}>
                    {customer.email && (
                      <Typography variant="body2">
                        <EmailIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        {customer.email}
                      </Typography>
                    )}
                    {customer.phone && (
                      <Typography variant="body2">
                        <PhoneIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        {customer.phone}
                      </Typography>
                    )}
                    {customer.address && (
                      <Typography variant="body2" color="text.secondary">
                        {customer.address}
                        {customer.city && customer.state && (
                          <>, {customer.city}, {customer.state} {customer.zipCode}</>
                        )}
                        {customer.country && <>, {customer.country}</>}
                      </Typography>
                    )}
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Chip
                      icon={getContactMethodIcon(customer.preferredContactMethod)}
                      label={`Prefers ${customer.preferredContactMethod.replace('_', ' ')}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  {customer.notes && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 2,
                        fontStyle: 'italic',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {customer.notes}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
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
          {editingCustomer ? 'Edit Customer' : 'Add Customer'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Company Name"
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Contact Name"
              value={formData.contactName}
              onChange={(e) =>
                setFormData({ ...formData, contactName: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              margin="normal"
              required
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              <TextField
                label="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                margin="normal"
                required
              />
              <TextField
                label="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                margin="normal"
                required
              />
              <TextField
                label="ZIP Code"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData({ ...formData, zipCode: e.target.value })
                }
                margin="normal"
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Website"
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Preferred Contact Method</InputLabel>
              <Select
                value={formData.preferredContactMethod}
                label="Preferred Contact Method"
                onChange={(e) =>
                  setFormData({ ...formData, preferredContactMethod: e.target.value as ContactMethod })
                }
              >
                {CONTACT_METHODS.map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={4}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 