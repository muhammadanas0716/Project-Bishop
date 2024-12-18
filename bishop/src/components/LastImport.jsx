import { FiUpload, FiGithub } from "react-icons/fi";

const LastImport = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        maxWidth: "1400px",
        margin: "24px auto 0",
        color: "#666",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontSize: "14px",
        }}
      >
        Last import: Aug 05, 2024 08:08 PM
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
        }}
      >
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <FiUpload size={16} />
          Import trades
        </button>

        <button
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "8px",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <FiGithub size={16} />
        </button>
      </div>
    </div>
  );
};

export default LastImport;
