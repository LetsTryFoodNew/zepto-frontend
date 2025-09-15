import React, { useState, useEffect } from "react";
import { getAsnListByPoNumber, cancelAsn } from "../services/asnService";
import { PurchaseOrderDetails } from "../types";

interface PoItemsAndAsnsTabsProps {
  po: PurchaseOrderDetails;
}

const tabButtonStyle = (selected: boolean): React.CSSProperties => ({
  padding: "10px 34px",
  background: selected ? "linear-gradient(90deg,#3771e0 70%,#67c8fd)" : "#f4f8fc",
  color: selected ? "#fff" : "#3771e0",
  border: "none",
  borderRadius: "25px 25px 0 0",
  fontWeight: 700,
  fontSize: 16,
  boxShadow: selected ? "0 3px 11px rgba(55,113,224,0.1)" : "none",
  marginRight: 8,
  outline: "none",
  transition: "all .18s",
  cursor: "pointer",
  borderBottom: selected ? "3px solid #3771e0" : "3px solid transparent",
  position: "relative",
  top: selected ? 2 : 0,
});

const tabHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  marginTop: 30,
  marginBottom: -8,
  background: "transparent",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 18,
  marginTop: 7,
  boxShadow: "0 1px 11px 0 rgba(55,113,224,.08)",
};

const tableHeaderStyle: React.CSSProperties = {
  background: "#e9f2fb",
  color: "#2958a2",
  fontWeight: 700,
  textAlign: "center",
};

const tableCellStyle: React.CSSProperties = {
  padding: 13,
  textAlign: "center",
  verticalAlign: "middle",
};

const zebraRow = (idx: number): React.CSSProperties => ({
  background: idx % 2 ? "#f7fbfd" : "#fff",
});

const cancelButtonStyle: React.CSSProperties = {
  backgroundColor: "#e53e3e",
  border: "none",
  padding: "6px 12px",
  color: "white",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  transition: "background-color 0.2s",
};

const PoAsnTab: React.FC<PoItemsAndAsnsTabsProps> = ({ po }) => {
  const [tab, setTab] = useState<"po" | "asn">("po");
  const [loadingAsn, setLoadingAsn] = useState(false);
  const [asns, setAsns] = useState<any[] | null>(null);
  const [cancelingAsnNumber, setCancelingAsnNumber] = useState<string | null>(null);

  const fetchAsns = () => {
    setLoadingAsn(true);
    getAsnListByPoNumber(po.code).then((resp) => {
      setAsns(resp.data && resp.data.ASNs ? resp.data.ASNs : []);
      setLoadingAsn(false);
    });
  };

  useEffect(() => {
    if (tab === "asn" && asns === null) {
      fetchAsns();
    }
    // eslint-disable-next-line
  }, [tab]);

  const handleCancelAsn = async (asnNumber: string) => {
    const confirmed = window.confirm("Are you sure you want to cancel this ASN?");
    if (!confirmed) return;

    try {
      setCancelingAsnNumber(asnNumber);
      await cancelAsn(asnNumber);
      alert("ASN cancelled successfully.");
      setCancelingAsnNumber(null);
      fetchAsns();
    } catch (error) {
      alert("Failed to cancel ASN. Please try again.");
      setCancelingAsnNumber(null);
    }
  };

  return (
    <div>
      <div style={tabHeaderStyle}>
        <button type="button" style={tabButtonStyle(tab === "po")} onClick={() => setTab("po")}>
          PO Items
        </button>
        <button type="button" style={tabButtonStyle(tab === "asn")} onClick={() => setTab("asn")}>
          ASN
        </button>
      </div>

      {tab === "po" && (
        <div style={cardStyle}>
          <h3 style={{ marginBottom: 20, color: "#3771e0", fontWeight: 700, letterSpacing: "0.01em" }}>
            PO Items
          </h3>
          {!po.poLineItems || po.poLineItems.length === 0 ? (
            <p>No PO items available.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: 10, overflow: "hidden" }}>
              <thead>
                <tr>
                  <th style={{ ...tableHeaderStyle, padding: 13 }}>Sku</th>
                  <th style={{ ...tableHeaderStyle, padding: 13 }}>Sku code</th>
                  <th style={{ ...tableHeaderStyle, padding: 13 }}>EAN No</th>
                  <th style={{ ...tableHeaderStyle, padding: 13 }}>PO Qty</th>
                  <th style={{ ...tableHeaderStyle, padding: 13 }}>Cost price</th>
                  <th style={{ ...tableHeaderStyle, padding: 13 }}>MRP</th>
                  <th style={{ ...tableHeaderStyle, padding: 13 }}>Total value</th>
                </tr>
              </thead>
              <tbody>
                {po.poLineItems.map((item, idx) => (
                  <tr key={item.skuCode} style={zebraRow(idx)}>
                    <td style={tableCellStyle}>{item.productName}</td>
                    <td style={tableCellStyle}>{item.skuCode}</td>
                    <td style={tableCellStyle}>{item.ean ?? "N/A"}</td>
                    <td style={tableCellStyle}>{item.quantity}</td>
                    <td style={tableCellStyle}>{item.costPrice ?? "N/A"}</td>
                    <td style={tableCellStyle}>{item.mrp}</td>
                    <td style={tableCellStyle}>{item.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "asn" && (
        <div style={cardStyle}>
          <h3 style={{ marginBottom: 20, color: "#3771e0", fontWeight: 700, letterSpacing: "0.01em" }}>ASN(s)</h3>
          {loadingAsn ? (
            <p>Loading ASN list...</p>
          ) : !asns || asns.length === 0 ? (
            <p>No ASN found for this PO.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: 10, overflow: "hidden" }}>
              <thead>
                <tr>
                  <th style={{ ...tableHeaderStyle, padding: 13 }}>ASN Number</th>
                  <th style={{ ...tableHeaderStyle, padding: 13 }}>Invoice Number</th>
                  <th style={{ ...tableHeaderStyle, padding: 13 }}>Status</th>
                  <th style={{ ...tableHeaderStyle, padding: 13 }}>ASN Qty</th>
                  <th style={{ ...tableHeaderStyle, padding: 13 }}>ASN Total Amount</th>
                  <th style={{ ...tableHeaderStyle, padding: 13 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {asns.map((asn, idx) => (
                  <tr key={asn.asnNumber} style={zebraRow(idx)}>
                    <td style={tableCellStyle}>{asn.asnNumber}</td>
                    <td style={tableCellStyle}>{asn.invoiceNumber}</td>
                    <td style={tableCellStyle}>{asn.status}</td>
                    <td style={tableCellStyle}>{asn.asnQuantity}</td>
                    <td style={tableCellStyle}>{asn.asnTotalAmount}</td>
                    <td style={tableCellStyle}>
                      {asn.status === "CREATED" ? (
                        <button
                          disabled={cancelingAsnNumber === asn.asnNumber}
                          style={cancelButtonStyle}
                          onClick={() => handleCancelAsn(asn.asnNumber)}
                        >
                          {cancelingAsnNumber === asn.asnNumber ? "Cancelling..." : "Cancel ASN"}
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default PoAsnTab;
