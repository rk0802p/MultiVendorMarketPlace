import PDFDocument from 'pdfkit';

export class InvoiceGenerator {
  /**
   * Generates a PDF tax invoice for an order and streams it to the HTTP response
   * @param {Object} order - Populated Order document
   * @param {Object} res - Express Response object
   */
  static generate(order, res) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    // Set HTTP response headers for PDF download/inline viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="invoice-${order.orderNumber || order._id}.pdf"`
    );

    doc.pipe(res);

    // Primary Colors
    const primaryColor = '#4F46E5'; // Indigo
    const textColor = '#1F2937';
    const mutedColor = '#6B7280';
    const lightBorder = '#E5E7EB';

    // 1. Header Section
    doc
      .fillColor(primaryColor)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('TechMart', 40, 45)
      .fontSize(10)
      .font('Helvetica')
      .fillColor(mutedColor)
      .text('Multi-Vendor E-Commerce Platform', 40, 72)
      .text('support@techmart-marketplace.com | www.techmart.local', 40, 85);

    // Invoice Title & Meta
    doc
      .fillColor(textColor)
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('TAX INVOICE', 350, 45, { align: 'right' })
      .fontSize(9)
      .font('Helvetica')
      .fillColor(mutedColor)
      .text(`Invoice No: INV-${order.orderNumber || order._id}`, 350, 68, { align: 'right' })
      .text(`Order Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString()}`, 350, 82, { align: 'right' })
      .text(`Payment Status: ${(order.paymentStatus || 'PAID').toUpperCase()}`, 350, 96, { align: 'right' });

    doc
      .moveTo(40, 115)
      .lineTo(555, 115)
      .strokeColor(lightBorder)
      .stroke();

    // 2. Billing & Shipping Info
    const shipping = order.shippingAddress || {};
    const customer = order.customerId || {};

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('Billed To / Shipping Address', 40, 130);

    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(textColor)
      .text(shipping.fullName || customer.name || 'Valued Customer', 40, 147)
      .text(shipping.addressLine1 || 'Marketplace Delivery Address', 40, 160)
      .text(`${shipping.city || ''} ${shipping.state || ''} ${shipping.postalCode || ''}`, 40, 173)
      .text(`Phone: ${shipping.phone || 'N/A'} | Email: ${customer.email || 'N/A'}`, 40, 186);

    doc
      .moveTo(40, 205)
      .lineTo(555, 205)
      .strokeColor(lightBorder)
      .stroke();

    // 3. Line Items Table Header
    let tableTop = 220;
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('Item Description', 40, tableTop)
      .text('Store / Vendor', 240, tableTop)
      .text('Qty', 370, tableTop, { width: 40, align: 'center' })
      .text('Unit Price', 420, tableTop, { width: 60, align: 'right' })
      .text('Total', 490, tableTop, { width: 65, align: 'right' });

    doc
      .moveTo(40, tableTop + 15)
      .lineTo(555, tableTop + 15)
      .strokeColor(primaryColor)
      .lineWidth(1)
      .stroke();

    // Line Items Content
    let yPosition = tableTop + 25;
    const items = order.items || [];

    doc.font('Helvetica').fontSize(9).fillColor(textColor);

    items.forEach((item) => {
      const storeName = item.storeId?.name || 'Verified Vendor';
      const itemTitle = item.title || 'Product Item';
      const unitPrice = item.price || 0;
      const quantity = item.quantity || 1;
      const lineTotal = item.itemSubtotal || unitPrice * quantity;

      doc
        .text(itemTitle, 40, yPosition, { width: 190 })
        .text(storeName, 240, yPosition, { width: 120 })
        .text(quantity.toString(), 370, yPosition, { width: 40, align: 'center' })
        .text(`Rs. ${unitPrice.toLocaleString('en-IN')}`, 420, yPosition, { width: 60, align: 'right' })
        .text(`Rs. ${lineTotal.toLocaleString('en-IN')}`, 490, yPosition, { width: 65, align: 'right' });

      yPosition += 22;
    });

    doc
      .moveTo(40, yPosition + 5)
      .lineTo(555, yPosition + 5)
      .strokeColor(lightBorder)
      .stroke();

    // 4. Totals Summary
    let summaryTop = yPosition + 15;
    const totals = order.totals || {
      subtotal: items.reduce((acc, i) => acc + (i.itemSubtotal || i.price * i.quantity), 0),
      discount: order.appliedCoupon?.discountAmount || 0,
      shipping: 0,
      tax: 0,
      grandTotal: 0,
    };

    const calculatedGrandTotal = totals.grandTotal || (totals.subtotal - totals.discount + totals.shipping + totals.tax);

    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(mutedColor)
      .text('Items Subtotal:', 380, summaryTop, { width: 90, align: 'right' })
      .fillColor(textColor)
      .text(`Rs. ${totals.subtotal.toLocaleString('en-IN')}`, 480, summaryTop, { width: 75, align: 'right' });

    summaryTop += 16;

    if (totals.discount > 0 || order.appliedCoupon?.discountAmount > 0) {
      const discount = totals.discount || order.appliedCoupon?.discountAmount;
      const couponCode = order.appliedCoupon?.code ? ` (${order.appliedCoupon.code})` : '';
      doc
        .fillColor('#10B981')
        .text(`Coupon Discount${couponCode}:`, 350, summaryTop, { width: 120, align: 'right' })
        .text(`- Rs. ${discount.toLocaleString('en-IN')}`, 480, summaryTop, { width: 75, align: 'right' });
      summaryTop += 16;
    }

    doc
      .fillColor(mutedColor)
      .text('Shipping & Delivery:', 380, summaryTop, { width: 90, align: 'right' })
      .fillColor(textColor)
      .text(totals.shipping === 0 ? 'FREE' : `Rs. ${totals.shipping}`, 480, summaryTop, { width: 75, align: 'right' });

    summaryTop += 16;

    doc
      .fillColor(mutedColor)
      .text('Taxes (Inclusive):', 380, summaryTop, { width: 90, align: 'right' })
      .fillColor(textColor)
      .text(`Rs. ${(totals.tax || 0).toLocaleString('en-IN')}`, 480, summaryTop, { width: 75, align: 'right' });

    summaryTop += 18;

    doc
      .moveTo(350, summaryTop - 4)
      .lineTo(555, summaryTop - 4)
      .strokeColor(primaryColor)
      .stroke();

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(primaryColor)
      .text('Grand Total:', 380, summaryTop, { width: 90, align: 'right' })
      .text(`Rs. ${calculatedGrandTotal.toLocaleString('en-IN')}`, 480, summaryTop, { width: 75, align: 'right' });

    // 5. Payment Details Box
    doc
      .rect(40, summaryTop - 30, 280, 65)
      .fillAndStroke('#F9FAFB', lightBorder);

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('Payment Information', 50, summaryTop - 22)
      .font('Helvetica')
      .fillColor(textColor)
      .text(`Method: Razorpay Test / Online Checkout`, 50, summaryTop - 8)
      .text(`Payment ID: ${order.paymentId || 'Verified Transaction'}`, 50, summaryTop + 4)
      .text(`Fulfillment: Multi-Vendor Isolated Dispatch`, 50, summaryTop + 16);

    // 6. Footer Note
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(mutedColor)
      .text(
        'This is a computer-generated tax invoice for order fulfillment. No physical signature is required.',
        40,
        760,
        { align: 'center', width: 515 }
      )
      .text(
        'TechMart Marketplace — Empowering independent vendors and verified merchants.',
        40,
        773,
        { align: 'center', width: 515 }
      );

    doc.end();
  }
}
