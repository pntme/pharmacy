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
  Tabs,
  Tab,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Warning as WarningIcon, Search as SearchIcon, QrCodeScanner as ScanIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import DataTable, { Column } from '../components/DataTable';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import BarcodeScanner from '../components/BarcodeScanner';
import { inventoryAPI, productsAPI } from '../services/api';

interface InventoryItem {
  inventory_id: number;
  product_id: number;
  product?: {
    product_name: string;
    item_code: string;
  };
  batch_number: string;
  quantity_on_hand: number;
  quantity_allocated: number;
  quantity_available: number;
  expiry_date: string;
  manufacture_date?: string;
  cost_per_unit: number;
  mrp?: number;
  status: string;
  bin_location?: string;
  rack_number?: string;
  shelf_number?: string;
}

interface Product {
  product_id: number;
  product_name: string;
  item_code: string;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [allInventory, setAllInventory] = useState<InventoryItem[]>([]);
  const [expiringItems, setExpiringItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    batch_number: '',
    quantity_on_hand: '',
    expiry_date: '',
    manufacture_date: '',
    cost_per_unit: '',
    mrp: '',
    bin_location: '',
    rack_number: '',
    shelf_number: '',
    status: 'available',
  });

  const statusOptions = ['available', 'quarantine', 'expired', 'returned', 'disposed'];

  useEffect(() => {
    fetchInventory();
    fetchExpiringItems();
    fetchProducts();
  }, []);

  // Filter inventory based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setInventory(allInventory);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allInventory.filter(item => {
      const productName = item.product?.product_name?.toLowerCase() || '';
      const itemCode = item.product?.item_code?.toLowerCase() || '';
      const batchNumber = item.batch_number?.toLowerCase() || '';
      const binLocation = item.bin_location?.toLowerCase() || '';
      const rackNumber = item.rack_number?.toLowerCase() || '';
      const shelfNumber = item.shelf_number?.toLowerCase() || '';

      return productName.includes(query) ||
             itemCode.includes(query) ||
             batchNumber.includes(query) ||
             binLocation.includes(query) ||
             rackNumber.includes(query) ||
             shelfNumber.includes(query);
    });

    setInventory(filtered);
  }, [searchQuery, allInventory]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await inventoryAPI.getAll() as any;
      const inventoryData = response.data?.inventory || [];
      setAllInventory(inventoryData);
      setInventory(inventoryData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiringItems = async () => {
    try {
      const response = await inventoryAPI.getExpiring() as any;
      setExpiringItems(response.data?.inventory || []);
    } catch (error: any) {
      console.error('Failed to fetch expiring items:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll() as any;
      setProducts(response.data?.products || []);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        product_id: item.product_id.toString(),
        batch_number: item.batch_number,
        quantity_on_hand: item.quantity_on_hand.toString(),
        expiry_date: item.expiry_date ? format(new Date(item.expiry_date), 'yyyy-MM-dd') : '',
        manufacture_date: item.manufacture_date ? format(new Date(item.manufacture_date), 'yyyy-MM-dd') : '',
        cost_per_unit: item.cost_per_unit.toString(),
        mrp: item.mrp?.toString() || '',
        bin_location: item.bin_location || '',
        rack_number: item.rack_number || '',
        shelf_number: item.shelf_number || '',
        status: item.status,
      });
    } else {
      setSelectedItem(null);
      setFormData({
        product_id: '',
        batch_number: '',
        quantity_on_hand: '',
        expiry_date: '',
        manufacture_date: '',
        cost_per_unit: '',
        mrp: '',
        bin_location: '',
        rack_number: '',
        shelf_number: '',
        status: 'available',
      });
    }
    setOpenDialog(true);
  };

  const handleBarcodeScan = (barcode: string) => {
    setSearchQuery(barcode);
    toast.success(`Barcode scanned: ${barcode}`);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedItem(null);
  };

  const handleSaveInventory = async () => {
    if (!formData.product_id || !formData.batch_number || !formData.quantity_on_hand || !formData.expiry_date || !formData.cost_per_unit) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const inventoryData = {
        product_id: parseInt(formData.product_id),
        batch_number: formData.batch_number,
        quantity_on_hand: parseInt(formData.quantity_on_hand),
        expiry_date: formData.expiry_date,
        manufacture_date: formData.manufacture_date || undefined,
        cost_per_unit: parseFloat(formData.cost_per_unit),
        mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
        bin_location: formData.bin_location || undefined,
        rack_number: formData.rack_number || undefined,
        shelf_number: formData.shelf_number || undefined,
        status: formData.status,
        location_id: 1, // Default location
      };

      if (selectedItem) {
        await inventoryAPI.update(selectedItem.inventory_id, inventoryData);
        toast.success('Inventory updated successfully');
      } else {
        await inventoryAPI.add(inventoryData);
        toast.success('Inventory added successfully');
      }

      handleCloseDialog();
      fetchInventory();
      fetchExpiringItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save inventory');
    }
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      // Set status to 'disposed' and quantity to 0
      await inventoryAPI.update(selectedItem.inventory_id, {
        status: 'disposed',
        quantity_on_hand: 0,
      });
      toast.success('Inventory item disposed successfully');
      setDeleteDialog(false);
      setSelectedItem(null);
      fetchInventory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to dispose inventory');
    }
  };

  const getExpiryColor = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysUntilExpiry < 0) return 'error';
    if (daysUntilExpiry <= 30) return 'error';
    if (daysUntilExpiry <= 90) return 'warning';
    return 'success';
  };

  const getExpiryLabel = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry <= 30) return `${daysUntilExpiry}d - Critical`;
    if (daysUntilExpiry <= 90) return `${daysUntilExpiry}d - Warning`;
    return format(expiry, 'MMM dd, yyyy');
  };

  const columns: Column[] = [
    {
      id: 'product',
      label: 'Product',
      minWidth: 200,
      format: (_value, row) => (
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {row.product?.product_name || 'Unknown'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.product?.item_code || ''}
          </Typography>
        </Box>
      ),
    },
    { id: 'batch_number', label: 'Batch Number', minWidth: 120 },
    {
      id: 'quantity_available',
      label: 'Available',
      minWidth: 100,
      align: 'center',
      format: (_value, row) => (
        <Box>
          <Typography variant="body2" fontWeight="bold" color="primary">
            {row.quantity_available || 0}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total: {row.quantity_on_hand}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'expiry_date',
      label: 'Expiry',
      minWidth: 130,
      format: (value) => (
        <Chip
          label={getExpiryLabel(value)}
          size="small"
          color={getExpiryColor(value)}
          icon={getExpiryColor(value) !== 'success' ? <WarningIcon /> : undefined}
        />
      ),
    },
    {
      id: 'cost_per_unit',
      label: 'Cost (₹)',
      minWidth: 100,
      align: 'right',
      format: (value) => {
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        return isNaN(numValue) ? '₹0.00' : `₹${numValue.toFixed(2)}`;
      },
    },
    {
      id: 'mrp',
      label: 'MRP (₹)',
      minWidth: 100,
      align: 'right',
      format: (value) => {
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        return isNaN(numValue) ? '-' : `₹${numValue.toFixed(2)}`;
      },
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      align: 'center',
      format: (value) => (
        <Chip
          label={value.toUpperCase()}
          size="small"
          color={value === 'available' ? 'success' : value === 'expired' ? 'error' : 'default'}
        />
      ),
    },
    {
      id: 'bin_location',
      label: 'Location',
      minWidth: 120,
      format: (_value, row) => {
        const location = [row.bin_location, row.rack_number, row.shelf_number]
          .filter(Boolean)
          .join('-');
        return location || '-';
      },
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Inventory Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Inventory
        </Button>
      </Box>

      {expiringItems && expiringItems.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningIcon />}>
          <strong>{expiringItems.length} items</strong> are expiring soon or have expired. Check the "Expiring Items" tab.
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by product name, item code, batch number, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setScannerOpen(true)}
                  title="Scan Barcode"
                >
                  <ScanIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Tabs value={currentTab} onChange={(_e, newValue) => setCurrentTab(newValue)} sx={{ mb: 2 }}>
        <Tab label="All Inventory" />
        <Tab label={`Expiring Items (${expiringItems?.length || 0})`} />
      </Tabs>

      {currentTab === 0 && (
        <DataTable
          columns={columns}
          data={inventory}
          loading={loading}
          onEdit={handleOpenDialog}
          onDelete={handleDeleteClick}
          emptyMessage="No inventory items found. Click 'Add Inventory' to add stock."
        />
      )}

      {currentTab === 1 && (
        <DataTable
          columns={columns}
          data={expiringItems}
          loading={loading}
          onEdit={handleOpenDialog}
          emptyMessage="No expiring items found."
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit Inventory' : 'Add New Inventory'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                select
                label="Product"
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                disabled={!!selectedItem}
              >
                <MenuItem value="">Select Product</MenuItem>
                {Array.isArray(products) && products.map((product) => (
                  <MenuItem key={product.product_id} value={product.product_id.toString()}>
                    {product.product_name} ({product.item_code})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Batch Number"
                value={formData.batch_number}
                onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Quantity"
                value={formData.quantity_on_hand}
                onChange={(e) => setFormData({ ...formData, quantity_on_hand: e.target.value })}
                inputProps={{ min: '0' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="Expiry Date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Manufacture Date"
                value={formData.manufacture_date}
                onChange={(e) => setFormData({ ...formData, manufacture_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Cost Per Unit (₹)"
                value={formData.cost_per_unit}
                onChange={(e) => setFormData({ ...formData, cost_per_unit: e.target.value })}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
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
                label="Bin Location"
                value={formData.bin_location}
                onChange={(e) => setFormData({ ...formData, bin_location: e.target.value })}
                placeholder="e.g., A1"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Rack Number"
                value={formData.rack_number}
                onChange={(e) => setFormData({ ...formData, rack_number: e.target.value })}
                placeholder="e.g., R2"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Shelf Number"
                value={formData.shelf_number}
                onChange={(e) => setFormData({ ...formData, shelf_number: e.target.value })}
                placeholder="e.g., S3"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveInventory} variant="contained">
            {selectedItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialog}
        title="Dispose Inventory"
        message={`Are you sure you want to dispose this inventory batch "${selectedItem?.batch_number}"? This will set the quantity to 0 and status to disposed.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialog(false);
          setSelectedItem(null);
        }}
      />

      {/* Barcode Scanner */}
      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleBarcodeScan}
        title="Scan Product Barcode"
      />
    </Box>
  );
}
