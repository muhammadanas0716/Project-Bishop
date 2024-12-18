import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AddTradeModal = ({ isOpen, onClose, onAddTrade }) => {
  const initialTradeData = {
    ticker: "SPX",
    optionType: "Call",
    expDate: new Date(),
    entryPrice: "",
    exitPrice: "",
    strike: "",
    quantity: "2",
    link: "",
    isZeroDTE: true,
  };

  const [tradeData, setTradeData] = useState(initialTradeData);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!tradeData.ticker.trim()) newErrors.ticker = "Ticker is required";
    if (!tradeData.strike) newErrors.strike = "Strike price is required";
    if (!tradeData.entryPrice) newErrors.entryPrice = "Entry price is required";
    if (!tradeData.exitPrice) newErrors.exitPrice = "Exit price is required";
    if (!tradeData.quantity) newErrors.quantity = "Quantity is required";
    if (!tradeData.link.trim()) newErrors.link = "Link is required";

    // Validate numbers are positive
    if (parseFloat(tradeData.entryPrice) <= 0)
      newErrors.entryPrice = "Entry price must be positive";
    if (parseFloat(tradeData.exitPrice) <= 0)
      newErrors.exitPrice = "Exit price must be positive";
    if (parseFloat(tradeData.strike) <= 0)
      newErrors.strike = "Strike price must be positive";
    if (parseInt(tradeData.quantity) <= 0)
      newErrors.quantity = "Quantity must be positive";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTradeData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleZeroDTEToggle = (e) => {
    const isChecked = e.target.checked;
    setTradeData((prev) => ({
      ...prev,
      isZeroDTE: isChecked,
      expDate: isChecked ? new Date() : prev.expDate,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    if (!validateForm()) {
      setSubmitting(false);
      return;
    }

    try {
      const entryTotal =
        parseFloat(tradeData.entryPrice) * parseInt(tradeData.quantity) * 100;
      const exitTotal =
        parseFloat(tradeData.exitPrice) * parseInt(tradeData.quantity) * 100;
      const pnl = exitTotal - entryTotal;
      const pnlPercent = ((exitTotal - entryTotal) / entryTotal) * 100;

      const success = await onAddTrade({
        ...tradeData,
        entryPrice: parseFloat(tradeData.entryPrice),
        exitPrice: parseFloat(tradeData.exitPrice),
        strike: parseFloat(tradeData.strike),
        quantity: parseInt(tradeData.quantity),
        pnl,
        pnlPercent,
        createdAt: new Date().toISOString(),
      });

      if (success) {
        setTradeData(initialTradeData);
        handleClose();
      }
    } catch (err) {
      setErrors({ submit: "Failed to add trade. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        ...overlayStyle,
        animation: isClosing ? "fadeOut 0.3s forwards" : "fadeIn 0.3s forwards",
      }}
    >
      <div
        className="modal-content"
        style={{
          ...modalStyle,
          animation: isClosing
            ? "slideOut 0.3s forwards"
            : "slideIn 0.3s forwards",
          animationDelay: isClosing ? "0s" : "0.1s",
        }}
      >
        <div style={headerStyle}>
          <h2 style={{ color: "#fff", margin: 0 }}>Add Trade</h2>
          <button onClick={handleClose} style={closeButtonStyle}>
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={formGridStyle}>
            <div style={formColumnStyle}>
              <FormField label="Ticker">
                <input
                  type="text"
                  name="ticker"
                  value={tradeData.ticker}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Strike">
                <input
                  type="number"
                  name="strike"
                  value={tradeData.strike}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Entry Price">
                <input
                  type="number"
                  name="entryPrice"
                  value={tradeData.entryPrice}
                  onChange={handleChange}
                  step="0.01"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Exit Price">
                <input
                  type="number"
                  name="exitPrice"
                  value={tradeData.exitPrice}
                  onChange={handleChange}
                  step="0.01"
                  style={inputStyle}
                />
              </FormField>
            </div>

            <div style={formColumnStyle}>
              <FormField label="Option Type">
                <select
                  name="optionType"
                  value={tradeData.optionType}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="Call">Call</option>
                  <option value="Put">Put</option>
                </select>
              </FormField>

              <FormField label="Quantity">
                <input
                  type="number"
                  name="quantity"
                  value={tradeData.quantity}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Link">
                <input
                  type="text"
                  name="link"
                  value={tradeData.link}
                  onChange={handleChange}
                  style={inputStyle}
                  placeholder="Enter trade link"
                />
              </FormField>

              <FormField label="Expiration Date">
                <DatePicker
                  selected={tradeData.expDate}
                  onChange={(date) =>
                    setTradeData((prev) => ({ ...prev, expDate: date }))
                  }
                  dateFormat="MMM d, yyyy"
                  className="date-picker"
                  wrapperClassName="date-picker-wrapper"
                  customInput={<CustomDateInput />}
                />
              </FormField>

              <FormField label="Zero DTE">
                <input
                  type="checkbox"
                  checked={tradeData.isZeroDTE}
                  onChange={handleZeroDTEToggle}
                  style={{
                    ...inputStyle,
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                  }}
                />
              </FormField>
            </div>
          </div>

          {errors.submit && <div style={errorStyle}>{errors.submit}</div>}

          <div style={footerStyle}>
            <button
              type="button"
              onClick={handleClose}
              style={cancelButtonStyle}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={submitButtonStyle(submitting)}
            >
              {submitting ? "Adding..." : "Add Trade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormField = ({ label, children }) => (
  <div style={fieldStyle}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
  <input
    type="text"
    value={value}
    onClick={onClick}
    ref={ref}
    style={inputStyle}
    readOnly
  />
));

// Styles
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  opacity: 0,
  transition: "opacity 0.3s ease-in-out",
  animation: "fadeIn 0.3s forwards",
};

const modalStyle = {
  backgroundColor: "#141414",
  borderRadius: "16px",
  width: "90%",
  maxWidth: "800px",
  border: "1px solid #2a2a2a",
  opacity: 0,
  transform: "translateY(20px)",
  animation: "slideIn 0.3s forwards",
  animationDelay: "0.1s",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "24px",
  borderBottom: "1px solid #2a2a2a",
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px",
  padding: "24px",
};

const formColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const labelStyle = {
  color: "#888",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  backgroundColor: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "14px",
  transition: "all 0.2s ease",
  outline: "none",
};

const submitButtonStyle = (submitting) => ({
  marginTop: "16px",
  marginBottom: "16px",
  marginRight: "16px",
  padding: "12px 24px",
  border: "none",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "500",
  cursor: submitting ? "not-allowed" : "pointer",
  transition: "background-color 0.3s ease, transform 0.2s ease",
  backgroundColor: submitting ? "#1a1a1a" : "#EA580C",
  color: submitting ? "#555" : "#fff",
  boxShadow: submitting ? "none" : "0 4px 6px rgba(0, 0, 0, 0.1)",
  transform: submitting ? "none" : "translateY(0)",
  ...(submitting
    ? {}
    : {
        ":hover": {
          backgroundColor: "#EA580C", // Slightly darker green on hover
          boxShadow: "0 6px 8px rgba(0, 0, 0, 0.2)",
        },
        ":active": {
          transform: "translateY(2px)", // Button depress effect
        },
      }),
});

const cancelButtonStyle = {
  marginTop: "16px",
  marginBottom: "16px",
  padding: "12px 24px",
  borderRadius: "12px",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  transition: "background-color 0.3s ease, transform 0.2s ease",
  backgroundColor: "#1a1a1a",
  color: "#888",
  border: "1px solid #2a2a2a",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transform: "translateY(0)",
  ":hover": {
    backgroundColor: "#222",
    color: "#fff", // Change color to white on hover
    borderColor: "#444", // Slightly lighter border
    boxShadow: "0 6px 8px rgba(0, 0, 0, 0.2)",
  },
  ":active": {
    transform: "translateY(2px)", // Button depress effect
  },
};

const closeButtonStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
};

const errorStyle = {
  color: "red",
  marginBottom: "16px",
};

const footerStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "16px",
  borderTop: "1px solid #2a2a2a",
  paddingTop: "32px",
};

const keyframesStyle = document.createElement("style");
keyframesStyle.innerHTML = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(20px);
    }
  }
`;
document.head.appendChild(keyframesStyle);

export default AddTradeModal;
