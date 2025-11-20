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
  MenuItem,
  Chip,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import DataTable, { Column } from '../components/DataTable';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { productsAPI } from '../services/api';

interface Product {
  product_id: number;
  item_code: string;
  product_name: string;
  generic_name?: string;
  brand_name?: string;
  strength?: string;
  dosage_form?: string;
  schedule?: string;
  mrp: number;
  selling_price?: number;
  gst_rate: number;
  reorder_level?: number;
  is_active: boolean;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    item_code: '',
    product_name: '',
    generic_name: '',
    brand_name: '',
    strength: '',
    dosage_form: '',
    schedule: 'OTC',
    mrp: '',
    selling_price: '',
    gst_rate: '12',
    reorder_level: '10',
  });

  const scheduleOptions = ['OTC', 'H', 'H1', 'X', 'G', 'J'];
  const dosageFormOptions = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Powder', 'Lotion', 'Spray'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll() as any;
      setProducts(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }

    setLoading(true);
    try {
      const response = await productsAPI.search(searchQuery) as any;
      setProducts(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        item_code: product.item_code,
        product_name: product.product_name,
        generic_name: product.generic_name || '',
        brand_name: product.brand_name || '',
        strength: product.strength || '',
        dosage_form: product.dosage_form || '',
        schedule: product.schedule || 'OTC',
        mrp: product.mrp.toString(),
        selling_price: product.selling_price?.toString() || '',
        gst_rate: product.gst_rate.toString(),
        reorder_level: product.reorder_level?.toString() || '10',
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        item_code: '',
        product_name: '',
        generic_name: '',
        brand_name: '',
        strength: '',
        dosage_form: '',
        schedule: 'OTC',
        mrp: '',
        selling_price: '',
        gst_rate: '12',
        reorder_level: '10',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
  };

  const handleSaveProduct = async () => {
    if (!formData.item_code || !formData.product_name || !formData.mrp) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        ...formData,
        mrp: parseFloat(formData.mrp),
        selling_price: formData.selling_price ? parseFloat(formData.selling_price) : undefined,
        gst_rate: parseFloat(formData.gst_rate),
        reorder_level: formData.reorder_level ? parseInt(formData.reorder_level) : undefined,
      };

      if (selectedProduct) {
        await productsAPI.update(selectedProduct.product_id, productData);
        toast.success('Product updated successfully');
      } else {
        await productsAPI.create(productData);
        toast.success('Product created successfully');
      }

      handleCloseDialog();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      await productsAPI.delete(selectedProduct.product_id);
      toast.success('Product deleted successfully');
      setDeleteDialog(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const columns: Column[] = [
    { id: 'item_code', label: 'Item Code', minWidth: 100 },
    { id: 'product_name', label: 'Product Name', minWidth: 200 },
    {
      id: 'generic_name',
      label: 'Generic Name',
      minWidth: 150,
      format: (value) => value || '-'
    },
    {
      id: 'strength',
      label: 'Strength',
      minWidth: 80,
      format: (value) => value || '-'
    },
    {
      id: 'dosage_form',
      label: 'Form',
      minWidth: 100,
      format: (value) => value || '-'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      minWidth: 80,
      align: 'center',
      format: (value) => (
        <Chip
          label={value || 'OTC'}
          size="small"
          color={value === 'X' || value === 'H' || value === 'H1' ? 'error' : 'default'}
        />
      ),
    },
    {
      id: 'mrp',
      label: 'MRP (₹)',
      minWidth: 100,
      align: 'right',
      format: (value) => {
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        return isNaN(numValue) ? '₹0.00' : `₹${numValue.toFixed(2)}`;
      },
    },
    {
      id: 'gst_rate',
      label: 'GST %',
      minWidth: 80,
      align: 'center',
      format: (value) => `${value}%`,
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
        <Typography variant="h4">Products Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Product
        </Button>
      </Box>

      <Box mb={3} display="flex" gap={2}>
        <TextField
          fullWidth
          placeholder="Search by name, code, or generic name..."
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
        <Button variant="outlined" onClick={fetchProducts}>
          Clear
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        onEdit={handleOpenDialog}
        onDelete={handleDeleteClick}
        emptyMessage="No products found. Click 'Add Product' to create one."
      />

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Item Code"
                value={formData.item_code}
                onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Product Name"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Generic Name"
                value={formData.generic_name}
                onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Brand Name"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Strength"
                placeholder="e.g., 500mg"
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Dosage Form"
                value={formData.dosage_form}
                onChange={(e) => setFormData({ ...formData, dosage_form: e.target.value })}
              >
                <MenuItem value="">Select Form</MenuItem>
                {dosageFormOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Schedule"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              >
                {scheduleOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                type="number"
                label="MRP (₹)"
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Selling Price (₹)"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="GST Rate (%)"
                value={formData.gst_rate}
                onChange={(e) => setFormData({ ...formData, gst_rate: e.target.value })}
                inputProps={{ step: '0.01', min: '0', max: '100' }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Reorder Level"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                inputProps={{ min: '0' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveProduct} variant="contained">
            {selectedProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.product_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialog(false);
          setSelectedProduct(null);
        }}
      />
    </Box>
  );
}
