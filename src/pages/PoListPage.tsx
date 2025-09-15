import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import { getPoList } from "../services/poService";
import { PurchaseOrder, POListResponse } from "../types";
import StatusBadge from "../constants/statusMapping";
import STORE_CODE_TO_CITY from "../constants/cityMapping";
import "react-datepicker/dist/react-datepicker.css";

const LOCAL_STORAGE_KEY = "po_list_page_number";

const CustomInput = React.forwardRef<HTMLButtonElement, any>(
  ({ value, onClick }, ref) => (
    <button
      onClick={onClick}
      ref={ref}
      style={{
        background: "none",
        border: "none",
        fontSize: 16,
        color: "#465975",
        cursor: "pointer",
        outline: "none",
        padding: 0,
      }}
    >
      {value || "Select Date"}
    </button>
  )
);

function formatDate(date: Date | null | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const buttonStyleBase: React.CSSProperties = {
  padding: "10px 22px",
  borderRadius: 25,
  fontWeight: 600,
  fontSize: 16,
  transition: "all 0.2s ease",
  cursor: "pointer",
  border: "none",
};

const PoListPage: React.FC = () => {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [pageNumber, setPageNumber] = useState(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? Number(stored) : 1;
  });
  const [pageSize, setPageSize] = useState(10);

  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(
    new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  );
  const fixedEndDate = today;

  const navigate = useNavigate();

  const getDays = () => {
    const diff = Math.abs(fixedEndDate.getTime() - startDate.getTime());
    return Math.min(Math.ceil(diff / (1000 * 60 * 60 * 24)), 45);
  };

  // Unified fetch function to always sync page state with storage
  const fetchPos = async (page: number) => {
    setLoading(true);
    try {
      const days = getDays();
      const response: POListResponse = await getPoList({
        page_number: page,
        page_size: pageSize,
        days,
      });
      setPos(response.purchaseOrders);
      setHasNext(response.hasNext);
      setPageNumber(response.pageNumber);
      setPageSize(response.pageSize);
      localStorage.setItem(LOCAL_STORAGE_KEY, response.pageNumber.toString());
    } catch {
      alert("Error fetching purchase orders.");
    }
    setLoading(false);
  };

  // On mount: restore pageNumber and fetch
  useEffect(() => {
    handleApply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    if (hasNext) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      localStorage.setItem(LOCAL_STORAGE_KEY, String(nextPage));
      fetchPos(nextPage);
    }
  };

  const handleBack = () => {
    if (pageNumber > 1) {
      const prevPage = pageNumber - 1;
      setPageNumber(prevPage);
      localStorage.setItem(LOCAL_STORAGE_KEY, String(prevPage));
      fetchPos(prevPage);
    }
  };

  const handleApply = () => {
    setPageNumber(1);
    localStorage.setItem(LOCAL_STORAGE_KEY, "1");
    fetchPos(1);
  };

  return (
    <div
      style={{
        padding: "2.5rem 2rem",
        fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        color: "#1a202c",
      }}
    >
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h2
          style={{
            color: "#2563eb",
            fontWeight: 700,
            fontSize: 28,
            margin: 0,
          }}
        >
          Purchase Orders
        </h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: 32,
            boxShadow: "0 2px 8px rgb(0 0 0 / 0.1)",
            padding: "8px 20px",
            minWidth: 300,
          }}
        >
          <span
            role="img"
            aria-label="calendar"
            style={{ fontSize: 22, marginRight: 12 }}
          >
            📅
          </span>
          <DatePicker
            selected={startDate}
            onChange={(date) =>
              date && date <= fixedEndDate && setStartDate(date)
            }
            maxDate={fixedEndDate}
            minDate={new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000)}
            dateFormat="dd MMM yyyy"
            customInput={<CustomInput />}
          />
          <span
            style={{
              marginLeft: 16,
              fontWeight: 700,
              color: "#2563eb",
              userSelect: "none",
            }}
          >
            – {formatDate(fixedEndDate)}
          </span>
          <button
            onClick={handleApply}
            style={{
              ...buttonStyleBase,
              backgroundColor: "#2563eb",
              color: "white",
              marginLeft: 24,
              boxShadow: "0 6px 20px rgb(37 99 235 / 0.4)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#1e40af")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#2563eb")
            }
            type="button"
          >
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div
          style={{
            fontWeight: 700,
            fontSize: 22,
            color: "#64748b",
            textAlign: "center",
            marginTop: 80,
          }}
        >
          Loading purchase orders...
        </div>
      ) : (
        <>
          <div
            style={{
              overflowX: "auto",
              backgroundColor: "white",
              borderRadius: 16,
              boxShadow: "0 4px 14px rgb(37 99 235 / 0.1)",
              border: "1px solid #dbeafe",
            }}
          >
            <table
              style={{
                borderCollapse: "separate",
                borderSpacing: "0 8px",
                width: "100%",
                minWidth: 900,
              }}
            >
              <thead
                style={{
                  backgroundColor: "#dbeafe",
                  color: "#2563eb",
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                <tr>
                  <th
                    style={{
                      position: "sticky",
                      left: 0,
                      backgroundColor: "#dbeafe",
                      borderRight: "2px solid #bfdbfe",
                      minWidth: 140,
                      padding: "18px 20px",
                      textAlign: "left",
                      userSelect: "none",
                      borderRadius: "10px 0 0 10px",
                    }}
                  >
                    PO No.
                  </th>
                  <th style={{ padding: "18px 20px", minWidth: 130, textAlign: "center" }}>
                    Status
                  </th>
                  <th style={{ padding: "18px 20px", minWidth: 170, textAlign: "left" }}>
                    Vendor Name
                  </th>
                  <th style={{ padding: "18px 20px", minWidth: 130, textAlign: "left" }}>
                    Vendor Code
                  </th>
                  <th style={{ padding: "18px 20px", minWidth: 170, textAlign: "left" }}>
                    Location
                  </th>
                    <th style={{ padding: "18px 20px", minWidth: 170, textAlign: "left" }}>
                    City
                  </th>
                  <th style={{ padding: "18px 20px", minWidth: 150, textAlign: "center" }}>
                    Created Date
                  </th>
                  <th style={{ padding: "18px 20px", minWidth: 140, textAlign: "center" }}>
                    Expiry Date
                  </th>
                  <th style={{ padding: "18px 20px", minWidth: 130, textAlign: "center" }}>
                    Total SKU
                  </th>
                  <th
                    style={{
                      padding: "18px 20px",
                      minWidth: 130,
                      textAlign: "center",
                      borderRadius: "0 10px 10px 0",
                    }}
                  >
                    Download PO
                  </th>
                </tr>
              </thead>
              <tbody>
                {pos.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
                      No purchase orders found.
                    </td>
                  </tr>
                ) : (
                  pos.map((p, idx) => (
                    <tr
                      key={p.code}
                      style={{
                        backgroundColor: idx % 2 === 0 ? "white" : "#f3f4f6",
                        cursor: "pointer",
                        transition: "background-color 0.15s",
                        userSelect: "none",
                      }}
                      onClick={() => navigate(`/po/${p.code}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          navigate(`/po/${p.code}`);
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      aria-label={`View details of PO ${p.code}`}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0e7ff")}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          idx % 2 === 0 ? "white" : "#f3f4f6")
                      }
                    >
                      <td
                        style={{
                          position: "sticky",
                          left: 0,
                          backgroundColor: "#dbeafe",
                          borderRight: "2px solid #bfdbfe",
                          padding: "18px 20px",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          borderRadius: "10px 0 0 10px",
                        }}
                      >
                        {p.code}
                      </td>
                      <td style={{ padding: "18px 20px", textAlign: "center" }}>
                        <StatusBadge status={p.status} />
                      </td>
                      <td style={{ padding: "18px 20px", textAlign: "left" }}>{p.vendorName}</td>
                      <td style={{ padding: "18px 20px", textAlign: "left" }}>{p.vendorCode}</td>
                      <td style={{ padding: "18px 20px", textAlign: "left" }}>{p.toStoreName}</td>
                      <td style={{ padding: "18px 20px", textAlign: "left" }}>{STORE_CODE_TO_CITY[p.toStoreCode] || '-'}</td>
                      <td style={{ padding: "18px 20px", textAlign: "center" }}>{p.timestamp}</td>
                      <td style={{ padding: "18px 20px", textAlign: "center" }}>{p.expiryDate}</td>
                      <td style={{ padding: "18px 20px", textAlign: "center" }}>{p.totalQty}</td>
                      <td
                        style={{
                          padding: "18px 20px",
                          textAlign: "center",
                          borderRadius: "0 10px 10px 0",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {p.expiringUrlForPoPDF ? (
                          <a
                            href={p.expiringUrlForPoPDF}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#375bf5", fontWeight: 600, textDecoration: "none" }}
                          >
                            PDF
                          </a>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Page number centered */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "18px 0 8px 0",
              fontWeight: 600,
              fontSize: 17,
              color: "#2563eb",
            }}
          >
            Page {pageNumber}
          </div>

          {/* Pagination Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <button
              onClick={handleBack}
              disabled={pageNumber === 1}
              style={{
                ...buttonStyleBase,
                backgroundColor: pageNumber === 1 ? "#e2e8f0" : "#375bf5",
                color: pageNumber === 1 ? "#94a3b8" : "white",
                cursor: pageNumber === 1 ? "default" : "pointer",
              }}
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!hasNext}
              style={{
                ...buttonStyleBase,
                backgroundColor: hasNext ? "#375bf5" : "#e2e8f0",
                color: hasNext ? "white" : "#94a3b8",
                cursor: hasNext ? "pointer" : "default",
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PoListPage;
