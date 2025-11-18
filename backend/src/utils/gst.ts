/**
 * GST Calculation Utilities for India
 * Supports CGST/SGST (intra-state) and IGST (inter-state)
 */

export interface GSTCalculation {
  subtotal: number;
  discount_amount: number;
  taxable_amount: number;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_gst: number;
  total_amount: number;
  round_off: number;
  final_amount: number;
}

export interface LineItem {
  quantity: number;
  unit_price: number;
  discount_percentage?: number;
  gst_rate: number;
}

/**
 * Calculate GST for a single line item
 */
export const calculateLineItemGST = (
  item: LineItem,
  isInterState: boolean = false
): {
  line_total: number;
  discount_amount: number;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount: number;
} => {
  const line_total = item.quantity * item.unit_price;
  const discount_amount = line_total * ((item.discount_percentage || 0) / 100);
  const taxable_amount = line_total - discount_amount;

  let cgst_amount = 0;
  let sgst_amount = 0;
  let igst_amount = 0;

  if (isInterState) {
    // Inter-state: Apply IGST
    igst_amount = taxable_amount * (item.gst_rate / 100);
  } else {
    // Intra-state: Apply CGST + SGST
    const half_gst = item.gst_rate / 2;
    cgst_amount = taxable_amount * (half_gst / 100);
    sgst_amount = taxable_amount * (half_gst / 100);
  }

  const total_amount = taxable_amount + cgst_amount + sgst_amount + igst_amount;

  return {
    line_total,
    discount_amount,
    taxable_amount,
    cgst_amount,
    sgst_amount,
    igst_amount,
    total_amount,
  };
};

/**
 * Calculate GST for entire bill/invoice
 */
export const calculateBillGST = (
  items: LineItem[],
  isInterState: boolean = false,
  additionalDiscount: number = 0
): GSTCalculation => {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);

  // Calculate item-level discounts
  const itemDiscounts = items.reduce((sum, item) => {
    const line_total = item.quantity * item.unit_price;
    return sum + (line_total * ((item.discount_percentage || 0) / 100));
  }, 0);

  const discount_amount = itemDiscounts + additionalDiscount;
  const taxable_amount = subtotal - discount_amount;

  // Calculate GST for each item and sum up
  let total_cgst = 0;
  let total_sgst = 0;
  let total_igst = 0;

  items.forEach(item => {
    const itemGST = calculateLineItemGST(item, isInterState);
    total_cgst += itemGST.cgst_amount;
    total_sgst += itemGST.sgst_amount;
    total_igst += itemGST.igst_amount;
  });

  const total_gst = total_cgst + total_sgst + total_igst;
  const total_amount = taxable_amount + total_gst;

  // Round off to nearest rupee
  const final_amount = Math.round(total_amount);
  const round_off = final_amount - total_amount;

  return {
    subtotal,
    discount_amount,
    taxable_amount,
    cgst_rate: isInterState ? 0 : items[0]?.gst_rate / 2 || 0,
    sgst_rate: isInterState ? 0 : items[0]?.gst_rate / 2 || 0,
    igst_rate: isInterState ? items[0]?.gst_rate || 0 : 0,
    cgst_amount: parseFloat(total_cgst.toFixed(2)),
    sgst_amount: parseFloat(total_sgst.toFixed(2)),
    igst_amount: parseFloat(total_igst.toFixed(2)),
    total_gst: parseFloat(total_gst.toFixed(2)),
    total_amount: parseFloat(total_amount.toFixed(2)),
    round_off: parseFloat(round_off.toFixed(2)),
    final_amount,
  };
};

/**
 * Generate GST invoice number
 * Format: INV/YYYY-MM/XXXXX
 */
export const generateInvoiceNumber = (prefix: string = 'INV'): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');

  return `${prefix}/${year}-${month}/${random}`;
};

/**
 * Calculate reverse GST (find base price from MRP including GST)
 */
export const reverseGST = (
  mrp: number,
  gst_rate: number
): {
  base_price: number;
  gst_amount: number;
} => {
  const divisor = 1 + (gst_rate / 100);
  const base_price = mrp / divisor;
  const gst_amount = mrp - base_price;

  return {
    base_price: parseFloat(base_price.toFixed(2)),
    gst_amount: parseFloat(gst_amount.toFixed(2)),
  };
};

/**
 * Validate GSTIN (GST Identification Number)
 * Format: 22AAAAA0000A1Z5
 */
export const validateGSTIN = (gstin: string): boolean => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
};

/**
 * Extract state code from GSTIN
 */
export const getStateFromGSTIN = (gstin: string): string => {
  if (!validateGSTIN(gstin)) {
    throw new Error('Invalid GSTIN');
  }
  return gstin.substring(0, 2);
};

/**
 * Check if transaction is inter-state based on GSTIN
 */
export const isInterStateTransaction = (
  supplierGSTIN: string,
  customerGSTIN: string
): boolean => {
  if (!validateGSTIN(supplierGSTIN) || !validateGSTIN(customerGSTIN)) {
    throw new Error('Invalid GSTIN');
  }

  const supplierState = getStateFromGSTIN(supplierGSTIN);
  const customerState = getStateFromGSTIN(customerGSTIN);

  return supplierState !== customerState;
};
