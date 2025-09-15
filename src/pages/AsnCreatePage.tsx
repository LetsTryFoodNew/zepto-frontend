import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createAsn } from '../services/asnService';
import { PurchaseOrderDetails } from '../types';

interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: string;
  taxableAmount: number;
  grandTotalAmount: number;
  shippingDate: string;
  deliveryDate: string;
  dueDate: string;
}

const AsnCreatePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const po: PurchaseOrderDetails | null = location.state?.po ?? null;

  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    invoiceNumber: '',
    invoiceDate: '',
    taxableAmount: 0,
    grandTotalAmount: 0,
    shippingDate: '',
    deliveryDate: po?.deliveryDate || '',
    dueDate: po?.deliveryDate || '',
  });

  const initialQuantities = po?.poLineItems?.reduce((acc, item) => {
    acc[item.skuCode] = item.quantity;
    return acc;
  }, {} as Record<string, number>) || {};

  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(initialQuantities);
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [grandTotalError, setGrandTotalError] = useState<string | null>(null);

  const itemNetAmounts = po?.poLineItems?.map(item => {
    const qty = itemQuantities[item.skuCode] || 0;
    const basePrice = item.costPrice ?? 0;
    return qty * basePrice;
  }) || [];

  const calculatedGrandTotal = itemNetAmounts.reduce((a, b) => a + b, 0);

  if (!po) {
    return <div style={{ padding: 40, fontSize: 20, color: '#999' }}>Purchase Order details not found. Please navigate from PO list.</div>;
  }

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceDetails(prev => ({
      ...prev,
      [name]: (name === 'taxableAmount' || name === 'grandTotalAmount') ? Number(value) : value,
    }));
  };

  const handleQuantityChange = (skuCode: string, value: string) => {
    const numeric = Number(value);
    if (numeric < 0) return;
    const originalQty = po.poLineItems.find(item => item.skuCode === skuCode)?.quantity ?? 0;
    if (numeric > originalQty) {
      setQuantityError(`Quantity for SKU ${skuCode} cannot exceed PO quantity (${originalQty})`);
    } else {
      setQuantityError(null);
      setItemQuantities(prev => ({ ...prev, [skuCode]: numeric }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantityError) {
      alert(quantityError);
      return;
    }
    if (Math.abs(calculatedGrandTotal - invoiceDetails.grandTotalAmount) > 10) { // allow small difference
      setGrandTotalError(`Entered total (${invoiceDetails.grandTotalAmount.toFixed(2)}) does not match calculated total (${calculatedGrandTotal.toFixed(2)}).`);
      return;
    }
    setGrandTotalError(null);

    // Prepare API request body like earlier
    const itemDetails = po.poLineItems.map(item => ({
      productIdentifier: {
        buyerProductIdentifier: {
          skuCode: item.skuCode,
          materialCode: item.materialCode,
        },
        sellerProductIdentifier: {
          identifier: {
            identifierType: 'EAN',
            identifierValue: item.ean || '',
          },
          itemCode: '6987',
          itemName: item.productName,
        },
      },
      batchDetails: {
        batchNumber: '',
        manufacturingDate: '',
        expiryDate: '',
      },
      quantity: {
        invoicedQuantity: {
          amount: itemQuantities[item.skuCode],
          unitOfMeasure: 'PC',
        },
        freeQuantity: {
          amount: 0,
          unitOfMeasure: 'PC',
        },
      },
      mrp: item.mrp,
      basePrice: item.costPrice ?? 0,
      taxDetails: [
        { taxType: 'GST', rateType: 'SGST', currencyCode: 'INR', taxAmount: 0, taxRate: null },
        { taxType: 'GST', rateType: 'CGST', currencyCode: 'INR', taxAmount: 0, taxRate: null },
        { taxType: 'GST', rateType: 'IGST', currencyCode: 'INR', taxAmount: 0, taxRate: null },
      ],
      netAmount: itemQuantities[item.skuCode] * (item.costPrice ?? 0),
    }));

    const body = {
      purchaseOrderDetails: {
        purchaseOrderNumber: po.code,
        purchaseOrderDate: po.timestamp,
        expiryDate: po.expiryDate,
      },
      invoiceDetails: {
        invoiceNumber: invoiceDetails.invoiceNumber,
        invoiceType: 'SSI',
        invoiceDate: invoiceDetails.invoiceDate,
        shippingDate: invoiceDetails.shippingDate,
        deliveryDate: invoiceDetails.deliveryDate,
        dueDate: invoiceDetails.dueDate,
      },
      invoiceFile: '',
      invoiceTotals: {
        currencyCode: 'INR',
        discountDetails: { totalDiscountAmount: 0 },
        taxableAmount: invoiceDetails.taxableAmount,
        grandTotalAmount: invoiceDetails.grandTotalAmount,
      },
      itemDetails,
      seller: {
        soldFrom: {
          id: po.vendorCode,
          name: po.vendorName,
        },
      },
      buyer: {
        soldTo: {
          id: po.toStoreCode,
          name: po.toStoreName,
        },
      },
    };

    try {
      console.log('Submitting ASN:', body);
      await createAsn(body);
      alert('ASN created successfully!');
      navigate('/asn');
    } catch (error) {
      alert('Failed to create ASN. Please try again.');
    }
  };

  return (
    <div style={{ padding: 32, maxWidth: 900, margin: 'auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h2 style={{ color: '#2962ff', marginBottom: 24, fontWeight: 800 }}>Create ASN for PO: {po.code}</h2>

      <section
        style={{
          backgroundColor: '#e3f2fd',
          borderRadius: 22,
          padding: 24,
          marginBottom: 32,
          boxShadow: '0 6px 12px rgba(66, 133, 244, 0.1)',
          fontSize: 16,
          color: '#264',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
        }}
      >
        <div><strong>Date:</strong> {po.timestamp}</div>
        <div><strong>Expiry:</strong> {po.expiryDate}</div>
        <div><strong>Store Code:</strong> {po.toStoreCode}</div>
        <div><strong>Store:</strong> {po.toStoreName}</div>
      </section>

      <form onSubmit={handleSubmit} style={{}}>
        <fieldset style={{ border: 'none', marginBottom: 24 }}>
          <legend style={{ fontWeight: 600, fontSize: 22, marginBottom: 12, color: '#2962ff' }}>Invoice Details</legend>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 600 }}>
              Invoice Number
              <input
                name="invoiceNumber"
                value={invoiceDetails.invoiceNumber}
                onChange={handleInvoiceChange}
                required
                style={{
                  padding: '11px 14px',
                  fontSize: 16,
                  borderRadius: 8,
                  border: '1px solid #cfd8dc',
                  outlineColor: '#2962ff',
                  marginTop: 4,
                }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 600 }}>
              Invoice Date
              <input
                type="date"
                name="invoiceDate"
                value={invoiceDetails.invoiceDate}
                onChange={handleInvoiceChange}
                required
                style={{
                  padding: '11px 14px',
                  fontSize: 16,
                  borderRadius: 8,
                  border: '1px solid #cfd8dc',
                  outlineColor: '#2962ff',
                  marginTop: 4,
                }}
              />
            </label>

<label style={{ display: 'flex', flexDirection: 'column', fontWeight: 600 }}>
  Taxable Amount
  <input
    type="number"
    name="taxableAmount"
    inputMode="decimal"
    pattern="[0-9]*"
    autoComplete="off"
    value={invoiceDetails.taxableAmount === 0 ? "" : invoiceDetails.taxableAmount}
    onChange={e => {
      const value = e.target.value;
      // allow only numbers and empty string
      if (/^\d*\.?\d*$/.test(value)) {
        setInvoiceDetails(prev => ({
          ...prev,
          taxableAmount: value === "" ? 0 : Number(value)
        }));
      }
    }}
    required
    style={{
      padding: '11px 14px',
      fontSize: 16,
      borderRadius: 8,
      border: '1px solid #cfd8dc',
      outlineColor: '#2962ff',
      marginTop: 4,
      // Hide number spin buttons
      MozAppearance: "textfield",
    }}
  />
</label>

<label style={{ display: 'flex', flexDirection: 'column', fontWeight: 600 }}>
  Grand Total Amount
  <input
    type="number"
    name="grandTotalAmount"
    inputMode="decimal"
    pattern="[0-9]*"
    autoComplete="off"
    value={invoiceDetails.grandTotalAmount === 0 ? "" : invoiceDetails.grandTotalAmount}
    onChange={e => {
      const value = e.target.value;
      // allow only numbers and empty string
      if (/^\d*\.?\d*$/.test(value)) {
        setInvoiceDetails(prev => ({
          ...prev,
          grandTotalAmount: value === "" ? 0 : Number(value)
        }));
      }
    }}
    required
    style={{
      padding: '11px 14px',
      fontSize: 16,
      borderRadius: 8,
      border: '1px solid #cfd8dc',
      outlineColor: '#2962ff',
      marginTop: 4,
      MozAppearance: "textfield",
    }}
  />
  {grandTotalError && (
    <span style={{ color: 'red', fontWeight: 700, marginTop: 5 }}>
      {grandTotalError}
    </span>
  )}
</label>

          </div>
        </fieldset>

        <fieldset style={{ border: 'none' }}>
          <legend style={{ fontWeight: 600, fontSize: 22, marginBottom: 12, color: '#2962ff' }}>Items</legend>
          {quantityError && (
            <div style={{ color: 'red', marginBottom: 12, fontWeight: 700 }}>{quantityError}</div>
          )}

          <div style={{ overflowX: 'auto', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.13)' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ backgroundColor: '#2962ff', color: '#fff', fontWeight: '700' }}>
                  <th style={{ padding: '12px 14px', minWidth: 250, textAlign: 'left' }}>Product</th>
                  <th style={{ padding: '12px 14px', minWidth: 190 }}>SKU</th>
                  <th style={{ padding: '12px 14px', minWidth: 150 }}>Quantity</th>
                  <th style={{ padding: '12px 14px', minWidth: 100 }}>MRP</th>
                  <th style={{ padding: '12px 14px', minWidth: 150 }}>Net Amount</th>
                </tr>
              </thead>
              <tbody>
                {po.poLineItems.map(item => {
                  const qty = itemQuantities[item.skuCode] ?? 0;
                  const netAmount = item.costPrice !== undefined ? qty * item.costPrice : 0;
                  return (
                    <tr key={item.skuCode} style={{ borderBottom: '1px solid #e0e7ff' }}>
                      <td style={{ padding: '12px 14px' }}>{item.productName}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{item.skuCode}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min={0}
                          max={item.quantity}
                          value={qty}
                          onChange={e => handleQuantityChange(item.skuCode, e.target.value)}
                          style={{
                            appearance: 'textfield',
                            width: 70,
                            borderRadius: 6,
                            border: '1px solid #cfd8dc',
                            padding: '6px 10px',
                            textAlign: 'center',
                            fontSize: 15,
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{item.mrp.toFixed(2)}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{netAmount.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </fieldset>

        <button
          type="submit"
          style={{
            marginTop: 24,
            backgroundColor: '#2962ff',
            color: 'white',
            fontWeight: 700,
            fontSize: 19,
            border: 'none',
            borderRadius: 28,
            padding: '12px 30px',
            cursor: 'pointer',
            boxShadow: '0 5px 15px rgba(41, 98, 255, 0.3)',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Create ASN
        </button>
      </form>
    </div>
  );
};

export default AsnCreatePage;
