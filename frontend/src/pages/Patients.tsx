import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import DataTable, { Column } from '../components/DataTable';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { patientsAPI } from '../services/api';

interface Patient {
  patient_id: number;
  patient_code: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  phone_number: string;
  alternate_phone?: string;
  email?: string;
  blood_group?: string;
  allergies?: string[];
  chronic_conditions?: string[];
  insurance_provider?: string;
  insurance_number?: string;
  loyalty_points?: number;
  total_purchases?: number;
  is_active: boolean;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    alternate_phone: '',
    email: '',
    blood_group: '',
    allergies: '',
    chronic_conditions: '',
    insurance_provider: '',
    insurance_number: '',
  });

  const genderOptions = ['Male', 'Female', 'Other'];
  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchPatients();
  }, []);

  // Auto-search as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        fetchPatients();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await patientsAPI.getAll() as any;
      setPatients(response.data?.patients || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPatients();
      return;
    }

    setLoading(true);
    try {
      const response = await patientsAPI.search(searchQuery) as any;
      setPatients(response.data?.patients || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (patient?: Patient) => {
    if (patient) {
      setSelectedPatient(patient);
      setFormData({
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth ? format(new Date(patient.date_of_birth), 'yyyy-MM-dd') : '',
        gender: patient.gender || '',
        phone_number: patient.phone_number,
        alternate_phone: patient.alternate_phone || '',
        email: patient.email || '',
        blood_group: patient.blood_group || '',
        allergies: patient.allergies ? patient.allergies.join(', ') : '',
        chronic_conditions: patient.chronic_conditions ? patient.chronic_conditions.join(', ') : '',
        insurance_provider: patient.insurance_provider || '',
        insurance_number: patient.insurance_number || '',
      });
    } else {
      setSelectedPatient(null);
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone_number: '',
        alternate_phone: '',
        email: '',
        blood_group: '',
        allergies: '',
        chronic_conditions: '',
        insurance_provider: '',
        insurance_number: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPatient(null);
  };

  const handleSavePatient = async () => {
    if (!formData.first_name || !formData.last_name || !formData.phone_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const patientData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth || undefined,
        gender: formData.gender || undefined,
        phone_number: formData.phone_number,
        alternate_phone: formData.alternate_phone || undefined,
        email: formData.email || undefined,
        blood_group: formData.blood_group || undefined,
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()).filter(Boolean) : undefined,
        chronic_conditions: formData.chronic_conditions ? formData.chronic_conditions.split(',').map(c => c.trim()).filter(Boolean) : undefined,
        insurance_provider: formData.insurance_provider || undefined,
        insurance_number: formData.insurance_number || undefined,
      };

      if (selectedPatient) {
        await patientsAPI.update(selectedPatient.patient_id, patientData);
        toast.success('Patient updated successfully');
      } else {
        await patientsAPI.create(patientData);
        toast.success('Patient created successfully');
      }

      handleCloseDialog();
      fetchPatients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save patient');
    }
  };

  const handleDeleteClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPatient) return;

    try {
      await patientsAPI.delete(selectedPatient.patient_id);
      toast.success('Patient deleted successfully');
      setDeleteDialog(false);
      setSelectedPatient(null);
      fetchPatients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete patient');
    }
  };

  const columns: Column[] = [
    {
      id: 'patient_code',
      label: 'Patient Code',
      minWidth: 120,
    },
    {
      id: 'full_name',
      label: 'Name',
      minWidth: 180,
      format: (_value, row) => `${row.first_name} ${row.last_name}`,
    },
    {
      id: 'phone_number',
      label: 'Phone',
      minWidth: 130,
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 180,
      format: (value) => value || '-',
    },
    {
      id: 'gender',
      label: 'Gender',
      minWidth: 80,
      align: 'center',
      format: (value) => value || '-',
    },
    {
      id: 'blood_group',
      label: 'Blood Group',
      minWidth: 100,
      align: 'center',
      format: (value) => value || '-',
    },
    {
      id: 'loyalty_points',
      label: 'Loyalty Points',
      minWidth: 120,
      align: 'center',
      format: (value) => (
        <Chip
          label={value || 0}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      id: 'total_purchases',
      label: 'Total Purchases',
      minWidth: 140,
      align: 'right',
      format: (value) => `₹${Number(value || 0).toFixed(2)}`,
    },
    {
      id: 'is_active',
      label: 'Status',
      minWidth: 100,
      align: 'center',
      format: (value) => (
        <Chip
          label={value ? 'Active' : 'Inactive'}
          size="small"
          color={value ? 'success' : 'default'}
        />
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Patients Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Patient
        </Button>
      </Box>

      <Box mb={3} display="flex" gap={2}>
        <TextField
          fullWidth
          placeholder="Search by name, code, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
        <Button variant="outlined" onClick={fetchPatients}>
          Clear
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={patients}
        loading={loading}
        onEdit={handleOpenDialog}
        onDelete={handleDeleteClick}
        emptyMessage="No patients found. Click 'Add Patient' to register a new patient."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPatient ? 'Edit Patient' : 'Register New Patient'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Phone Number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Alternate Phone"
                value={formData.alternate_phone}
                onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <MenuItem value="">Select Gender</MenuItem>
                {genderOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Blood Group"
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              >
                <MenuItem value="">Select Blood Group</MenuItem>
                {bloodGroupOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Allergies"
                placeholder="Comma-separated, e.g., Penicillin, Aspirin"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chronic Conditions"
                placeholder="Comma-separated, e.g., Diabetes, Hypertension"
                value={formData.chronic_conditions}
                onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Insurance Provider"
                value={formData.insurance_provider}
                onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Insurance Number"
                value={formData.insurance_number}
                onChange={(e) => setFormData({ ...formData, insurance_number: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePatient} variant="contained">
            {selectedPatient ? 'Update' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Patient"
        message={`Are you sure you want to delete patient "${selectedPatient?.first_name} ${selectedPatient?.last_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialog(false);
          setSelectedPatient(null);
        }}
      />
    </Box>
  );
}
