import { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';
import { productsAPI, salesAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function POS() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!search.trim()) return;

    try {
      const response: any = await productsAPI.search(search);
      setSearchResults(response.data || []);
    } catch (error) {
      toast.error('Failed to search products');
    }
  };

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.product_id === product.product_id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1, unit_price: product.mrp }]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return Array.isArray(cart) ? cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0) : 0;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      await salesAPI.create({
        location_id: 1, // Default location
        items: cart,
        payment_method: 'cash',
      });

      toast.success('Sale completed successfully!');
      setCart([]);
      setSearchResults([]);
      setSearch('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete sale');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Point of Sale (POS)
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <TextField
              fullWidth
              label="Search Products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by product name, generic name, or item code..."
            />
            <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
              {Array.isArray(searchResults) && searchResults.map((product) => (
                <Paper
                  key={product.product_id}
                  sx={{ p: 2, mb: 1, cursor: 'pointer' }}
                  onClick={() => addToCart(product)}
                >
                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle1">
                        {product.product_name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {product.generic_name} | {product.item_code}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6">₹{product.mrp}</Typography>
                      <IconButton size="small" color="primary">
                        <Add />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Cart
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(cart) && cart.map((item) => (
                  <TableRow key={item.product_id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.product_id, parseInt(e.target.value))
                        }
                        size="small"
                        sx={{ width: 60 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      ₹{(item.unit_price * item.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => removeFromCart(item.product_id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h5" align="right">
                Total: ₹{calculateTotal().toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Complete Sale
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
