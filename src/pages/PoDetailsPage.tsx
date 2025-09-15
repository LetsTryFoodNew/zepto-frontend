import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPoDetails } from "../services/poService";
import { PurchaseOrderDetails } from "../types";
import StatusBadge from "../constants/statusMapping";
import PoAsnTab from "../components/PoAsnTab";
import PoAmendment from "../components/PoAmendment";
import STORE_CODE_TO_CITY from "../constants/cityMapping";

const PoDetailsPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [po, setPo] = useState<PurchaseOrderDetails | null>(null);
  const [showAmendmentPane, setShowAmendmentPane] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDetails() {
      if (!code) return;
      const data = await getPoDetails(code);
      setPo(data);
    }
    fetchDetails();
  }, [code]);

  if (!po) return <div style={{ padding: 32 }}>Loading purchase order details…</div>;

  return (
    <div
      style={{
        position: "relative",
        padding: 32,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f5f7fb",
        minHeight: "100vh",
        color: "#1d2746",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      {/* Header row with title left, buttons right */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <h1 style={{ fontSize: 34, fontWeight: 900, color: "#1a57ff", margin: 0 }}>
          PO: {po.code}
        </h1>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/asn/create", { state: { po } })}
            style={{
              background: "linear-gradient(90deg, #3b82f6 60%, #60a5fa)",
              border: "none",
              padding: "14px 28px",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 30,
              cursor: "pointer",
              boxShadow: "0 7px 18px rgba(59, 130, 246, 0.5)",
              transition: "transform 0.2s ease",
              userSelect: "none",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            aria-label="Create ASN"
          >
            Create ASN
          </button>

          <button
            onClick={() => setShowAmendmentPane(true)}
            style={{
              backgroundColor: "#f78715",
              border: "none",
              padding: "14px 28px",
              color: "#fff",
              fontWeight: 700,
              fontSize: 18,
              borderRadius: 30,
              cursor: "pointer",
              boxShadow: "0 7px 18px rgba(247, 135, 21, 0.5)",
              transition: "transform 0.2s ease",
              userSelect: "none",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            aria-label="Amend PO"
          >
            Amend PO
          </button>
        </div>
      </div>

      {/* Summary information grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          backgroundColor: "#fff",
          borderRadius: 18,
          padding: 28,
          boxShadow: "0 10px 25px rgba(26, 39, 70, 0.06)",
          border: "1px solid #c3d1f6",
          color: "#417709",
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        <div style={{ minWidth: 200, flex: "1 1 220px" }}>
          <div>Date</div>
          <div style={{ fontWeight: 600, color: "#1d2746" }}>{po.timestamp}</div>
        </div>
        <div style={{ minWidth: 200, flex: "1 1 220px" }}>
          <div>Status</div>
          <div style={{ marginTop: 6 }}>
            <StatusBadge status={po.status} />
          </div>
        </div>
        <div style={{ minWidth: 200, flex: "1 1 220px" }}>
          <div>Expiry Date</div>
          <div style={{ fontWeight: 600, color: "#1d2746" }}>{po.expiryDate}</div>
        </div>
        <div style={{ minWidth: 200, flex: "1 1 220px" }}>
          <div>Vendor Name</div>
          <div style={{ fontWeight: 600, color: "#1d2746" }}>{po.vendorName}</div>
        </div>
        <div style={{ minWidth: 200, flex: "1 1 220px" }}>
          <div>Store Code</div>
          <div style={{ fontWeight: 600, color: "#1d2746" }}>{po.toStoreCode}</div>
        </div>
        <div style={{ minWidth: 200, flex: "1 1 220px" }}>
          <div>Total Quantity</div>
          <div style={{ fontWeight: 600, color: "#1d2746" }}>{po.totalQty}</div>
        </div>
        <div style={{ minWidth: 200, flex: "1 1 220px" }}>
          <div>City</div>
          <div style={{ fontWeight: 600, color: "#1d2746" }}>{STORE_CODE_TO_CITY[po.toStoreCode] || '-'}</div>
        </div>
      </div>

      {/* Tabs component */}
      <PoAsnTab po={po} />

      {/* Right Pane Drawer */}
      {showAmendmentPane && (
        <>
          <div
            onClick={() => setShowAmendmentPane(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              zIndex: 999,
            }}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="PO Amendment"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: 440,
              height: "100vh",
              backgroundColor: "#fff",
              boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
              padding: 24,
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              transition: "transform 0.3s ease",
            }}
          >
            <button
              onClick={() => setShowAmendmentPane(false)}
              style={{
                alignSelf: "flex-end",
                background: "none",
                border: "none",
                fontSize: 28,
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: 20,
              }}
              aria-label="Close PO Amendment"
            >
              ×
            </button>

            <PoAmendment po={po} closePanel={() => setShowAmendmentPane(false)} />
          </aside>
        </>
      )}
    </div>
  );
};

export default PoDetailsPage;
