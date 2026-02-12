import React, { useState } from "react";
import { PurchaseOrderDetails } from "../types";
import { amendPo } from "../services/poService";

interface AmendmentDetail {
  attributeName: string;
  skuIndex: number | null;
  previousValue: string;
  recommendedValue: string;
  reasonForAmendment: string;
}

interface PoAmendmentProps {
  po: PurchaseOrderDetails;
  closePanel: () => void;
}

// Dropdown options for amendment issue
const AMENDMENT_ATTRIBUTES = [
  { value: "MRP", label: "MRP" },
  { value: "BASE_PRICE", label: "BASE PRICE" },
  { value: "EAN", label: "EAN" },
  { value: "CASE_SIZE", label: "CASE SIZE" },
  { value: "EXPIRY_DATE", label: "EXPIRY DATE" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  borderRadius: 6,
  border: "1px solid #cbd5e1",
  marginTop: 4,
  fontSize: 14,
};

const PoAmendment: React.FC<PoAmendmentProps> = ({ po, closePanel }) => {
  const [amendments, setAmendments] = useState<AmendmentDetail[]>([]);

  const addAmendment = () => {
    setAmendments([...amendments, {
      attributeName: "",
      skuIndex: null,
      previousValue: "",
      recommendedValue: "",
      reasonForAmendment: "",
    }]);
  };

  const removeAmendment = (index: number) => {
    setAmendments(amendments.filter((_, i) => i !== index));
  };

  const updateAmendmentField = (
    index: number,
    field: keyof AmendmentDetail,
    value: string | number | null
  ) => {
    setAmendments((prev) =>
      prev.map((a, i) =>
        i === index ? { ...a, [field]: value } : a
      )
    );
  };

  const submitAmendments = async () => {
    // Structure amendments by product (itemDetails)
    // If attributeName is EXPIRY_DATE, do not group by product
    if (amendments.length === 0) {
      alert("Please add at least one amendment.");
      return;
    }

    // Validate everything filled
    for (let data of amendments) {
      if (
        !data.attributeName ||
        (!data.attributeName.startsWith("EXPIRY_DATE") && (data.skuIndex == null)) ||
        !data.previousValue ||
        !data.recommendedValue ||
        !data.reasonForAmendment
      ) {
        alert("Please fill all amendment fields.");
        return;
      }
    }

    // Group itemDetails as needed
    let itemDetails = [];
    for (let amend of amendments) {
      if (amend.attributeName === "EXPIRY_DATE") {
        // Not related to particular product
        itemDetails.push({
          amendments: [
            {
              attributeName: amend.attributeName,
              previousValue: amend.previousValue,
              recommendedValue: amend.recommendedValue,
              reasonForAmendment: amend.reasonForAmendment,
            },
          ],
        });
      } else if (amend.skuIndex !== null && po.poLineItems[amend.skuIndex]) {
        const product = po.poLineItems[amend.skuIndex];
        itemDetails.push({
          productIdentifier: {
            skuCode: product.skuCode,
            materialCode: product.materialCode,
            identifier: {
              identifierType: "EAN",
              identifierValue: product.ean || "",
            },
          },
          skuName: product.productName,
          skuCode: product.skuCode,
          amendments: [
            {
              attributeName: amend.attributeName,
              previousValue: amend.previousValue,
              recommendedValue: amend.recommendedValue,
              reasonForAmendment: amend.reasonForAmendment,
            },
          ],
        });
      }
    }

    const requestBody = {
      purchaseOrderAmendment: {
        purchaseOrderNumber: po.code,
        itemDetails,
      },
    };

    try {
      await amendPo(po.code, requestBody);
      alert("PO Amendment submitted successfully.");
      closePanel();
    } catch (error) {
      alert("Error submitting amendment. Please try again.");
    }
  };

  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <h2 style={{ marginBottom: 24, color: "#2563eb" }}>PO Amendment</h2>

      {amendments.map((amend, idx) => (
        <div
          key={idx}
          style={{
            border: "1px solid #cbd5db",
            borderRadius: 10,
            padding: 16,
            marginBottom: 16,
            backgroundColor: "#f9fafb",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
              Issue
            </label>
            <select
              value={amend.attributeName}
              onChange={e => {
                updateAmendmentField(idx, "attributeName", e.target.value);
                // clear product if expiry date is now selected
                if (e.target.value === "EXPIRY_DATE") {
                  updateAmendmentField(idx, "skuIndex", null);
                }
              }}
              style={{
                ...inputStyle,
                minHeight: 35,
              }}
            >
              <option value="">Select Issue</option>
              {AMENDMENT_ATTRIBUTES.map(attr => (
                <option value={attr.value} key={attr.value}>{attr.label}</option>
              ))}
            </select>
          </div>

          {amend.attributeName !== "EXPIRY_DATE" && (
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
                Product
              </label>
              <select
                value={amend.skuIndex === null ? "" : amend.skuIndex}
                onChange={e =>
                  updateAmendmentField(idx, "skuIndex", e.target.value === "" ? null : Number(e.target.value))
                }
                style={{
                  ...inputStyle,
                  minHeight: 35,
                }}
              >
                <option value="">Select Product</option>
                {po.poLineItems.map((item, pi) => (
                  <option value={pi} key={item.skuCode}>
                    {item.productName} (SKU: {item.skuCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
              Previous Value
            </label>
            <input
              type="text"
              value={amend.previousValue}
              onChange={e =>
                updateAmendmentField(idx, "previousValue", e.target.value)
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
              Recommended Value
            </label>
            <input
              type="text"
              value={amend.recommendedValue}
              onChange={e =>
                updateAmendmentField(idx, "recommendedValue", e.target.value)
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>
              Reason For Amendment
            </label>
            <textarea
              value={amend.reasonForAmendment}
              onChange={e =>
                updateAmendmentField(idx, "reasonForAmendment", e.target.value)
              }
              rows={2}
              style={inputStyle}
            />
          </div>
          <button
            type="button"
            onClick={() => removeAmendment(idx)}
            style={{
              marginTop: 5,
              color: "white",
              backgroundColor: "#ef4444",
              border: "none",
              borderRadius: 6,
              padding: "6px 14px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Remove Amendment
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addAmendment}
        style={{
          padding: "10px 22px",
          fontWeight: 700,
          color: "#2563eb",
          background: "transparent",
          border: "2px solid #2563eb",
          borderRadius: 8,
          cursor: "pointer",
          marginBottom: 18,
          fontSize: 16,
        }}
      >
        + Add Amendment
      </button>

      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
        <button
          onClick={submitAmendments}
          style={{
            padding: "14px 38px",
            fontSize: 17,
            fontWeight: 700,
            color: "#fff",
            background: "#2563eb",
            border: "none",
            borderRadius: 30,
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(37,99,235,0.4)",
            transition: "background-color 0.18s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1e40af")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#2563eb")}
        >
          Submit Amendment
        </button>
      </div>
    </div>
  );
};

export default PoAmendment;
