import { forwardRef, useEffect, useRef } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { format } from 'date-fns';
import JsBarcode from 'jsbarcode';

interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount?: number;
}

interface ThermalInvoiceProps {
  orderNumber: string;
  orderDate: string;
  customerName?: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalAmount: number;
  amountPaid?: number;
  pharmacyName?: string;
  pharmacyAddress?: string;
  pharmacyPhone?: string;
}

const ThermalInvoice = forwardRef<HTMLDivElement, ThermalInvoiceProps>((props, ref) => {
  const {
    orderNumber,
    orderDate,
    customerName,
    customerPhone,
    items,
    subtotal,
    discountAmount = 0,
    cgstAmount = 0,
    sgstAmount = 0,
    igstAmount = 0,
    totalAmount,
    amountPaid,
    pharmacyName = 'Pharmacy Management System',
    pharmacyAddress,
    pharmacyPhone,
  } = props;

  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && orderNumber) {
      try {
        JsBarcode(barcodeRef.current, orderNumber, {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
          margin: 5,
        });
      } catch (error) {
        console.error('Barcode generation error:', error);
      }
    }
  }, [orderNumber]);

  const totalGST = cgstAmount + sgstAmount + igstAmount;

  return (
    <Box
      ref={ref}
      sx={{
        width: '80mm', // Standard thermal printer width
        maxWidth: '80mm',
        padding: '5mm',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: 1.4,
        backgroundColor: 'white',
        color: 'black',
        '@media print': {
          padding: 0,
          margin: 0,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'monospace' }}>
          {pharmacyName}
        </Typography>
        {pharmacyAddress && (
          <Typography sx={{ fontSize: '10px', fontFamily: 'monospace' }}>
            {pharmacyAddress}
          </Typography>
        )}
        {pharmacyPhone && (
          <Typography sx={{ fontSize: '10px', fontFamily: 'monospace' }}>
            Tel: {pharmacyPhone}
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

      {/* Invoice Number */}
      <Box sx={{ textAlign: 'center', my: 1 }}>
        <svg ref={barcodeRef} />
      </Box>

      {/* Date & Customer Info */}
      <Box sx={{ fontSize: '10px', mb: 1, fontFamily: 'monospace' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Date:</span>
          <span>{format(new Date(orderDate), 'dd/MM/yyyy HH:mm')}</span>
        </Box>
        {customerName && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Customer:</span>
            <span>{customerName}</span>
          </Box>
        )}
        {customerPhone && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Phone:</span>
            <span>{customerPhone}</span>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

      {/* Items */}
      <Box sx={{ fontSize: '10px', fontFamily: 'monospace' }}>
        {items.map((item, index) => (
          <Box key={index} sx={{ mb: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>{item.product_name}</span>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pl: 1 }}>
              <span>
                {item.quantity} x ₹{Number(item.unit_price).toFixed(2)}
              </span>
              <span>₹{Number(item.total_price).toFixed(2)}</span>
            </Box>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

      {/* Totals */}
      <Box sx={{ fontSize: '10px', fontFamily: 'monospace' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span>
          <span>₹{Number(subtotal).toFixed(2)}</span>
        </Box>

        {discountAmount > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Discount:</span>
            <span>-₹{Number(discountAmount).toFixed(2)}</span>
          </Box>
        )}

        {totalGST > 0 && (
          <>
            {cgstAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>CGST:</span>
                <span>₹{Number(cgstAmount).toFixed(2)}</span>
              </Box>
            )}
            {sgstAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SGST:</span>
                <span>₹{Number(sgstAmount).toFixed(2)}</span>
              </Box>
            )}
            {igstAmount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>IGST:</span>
                <span>₹{Number(igstAmount).toFixed(2)}</span>
              </Box>
            )}
          </>
        )}

        <Divider sx={{ borderStyle: 'dashed', my: 0.5 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '12px',
          }}
        >
          <span>TOTAL:</span>
          <span>₹{Number(totalAmount).toFixed(2)}</span>
        </Box>

        {amountPaid && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Paid:</span>
              <span>₹{Number(amountPaid).toFixed(2)}</span>
            </Box>
            {amountPaid !== totalAmount && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Balance:</span>
                <span>₹{Number(totalAmount - amountPaid).toFixed(2)}</span>
              </Box>
            )}
          </>
        )}
      </Box>

      <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

      {/* Footer */}
      <Box sx={{ textAlign: 'center', fontSize: '10px', fontFamily: 'monospace' }}>
        <Typography sx={{ fontSize: '10px', fontFamily: 'monospace' }}>
          Thank you for your business!
        </Typography>
        <Typography sx={{ fontSize: '8px', fontFamily: 'monospace', mt: 0.5 }}>
          {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
        </Typography>
      </Box>
    </Box>
  );
});

ThermalInvoice.displayName = 'ThermalInvoice';

export default ThermalInvoice;
