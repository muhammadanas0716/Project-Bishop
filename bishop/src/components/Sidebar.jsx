import React from "react";
import {
  FiHome,
  FiBarChart2,
  FiRefreshCw,
  FiTrendingUp,
  FiBook,
  FiGithub,
  FiChevronLeft,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";

const Sidebar = ({
  activeView,
  onViewChange,
  isCollapsed,
  onCollapse,
  username,
  onLogout,
  onHardReset,
}) => {
  const menuItems = [
    {
      icon: <FiHome size={20} />,
      label: "Dashboard",
      view: "dashboard",
    },
    {
      icon: <FiBarChart2 size={20} />,
      label: "Analysis",
      view: "analysis",
    },
    {
      icon: <FiTrendingUp size={20} />,
      label: "Performance",
      view: "performance",
    },
    {
      icon: <FiBook size={20} />,
      label: "Journal",
      view: "journal",
    },
  ];

  const bottomMenuItems = [
    {
      icon: <FiGithub size={20} />,
      label: "GitHub",
      view: "github",
      isExternal: true,
      href: "https://github.com/yourusername/bishop",
    },
  ];

  const MenuItem = ({ item }) => {
    const isActive = activeView === item.view;
    const content = (
      <>
        <div
          style={{
            width: isCollapsed ? "44px" : "40px",
            height: isCollapsed ? "44px" : "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: item.isDangerous ? "#EF4444" : isActive ? "#22C55E" : "#888",
            transition: "all 0.2s ease",
            margin: isCollapsed ? "0 auto" : "0",
          }}
        >
          {item.icon}
        </div>
        {!isCollapsed && (
          <span
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: item.isDangerous
                ? "#EF4444"
                : isActive
                ? "#22C55E"
                : "#888",
            }}
          >
            {item.label}
          </span>
        )}
      </>
    );

    const commonStyle = {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "8px 16px",
      color: "#888",
      borderRadius: "12px",
      transition: "all 0.2s ease",
      margin: "4px 0",
      cursor: "pointer",
      width: "100%",
      background: "none",
      border: "none",
      position: "relative",
    };

    if (item.isExternal) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...commonStyle,
            textDecoration: "none",
          }}
          className="hover:bg-white/5 hover:text-white"
        >
          {content}
        </a>
      );
    }

    return (
      <button
        onClick={item.onClick || (() => onViewChange(item.view))}
        style={commonStyle}
        className={
          item.isDangerous
            ? "hover:bg-red-500/10 hover:text-red-500"
            : "hover:bg-white/5 hover:text-white"
        }
      >
        {content}
      </button>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        left: "24px",
        top: "24px",
        bottom: "24px",
        width: isCollapsed ? "80px" : "240px",
        backgroundColor: "#141414",
        borderRadius: "20px",
        padding: "24px 12px",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(10px)",
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "0 12px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            width: isCollapsed ? "44px" : "40px",
            height: isCollapsed ? "44px" : "40px",
            backgroundColor: "#22C55E",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FiBarChart2 size={24} color="#000" />
        </div>
        {!isCollapsed && (
          <span
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#fff",
            }}
          >
            Bishop
          </span>
        )}
      </div>

      {/* Profile */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px",
          backgroundColor: "#1A1A1A",
          borderRadius: "12px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: isCollapsed ? "44px" : "40px",
            height: isCollapsed ? "44px" : "40px",
            backgroundColor: "#22C55E",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "20px",
          }}
        >
          ♟️
        </div>
        {!isCollapsed && (
          <div>
            <div style={{ fontSize: "14px", color: "#fff", fontWeight: "500" }}>
              {username}
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              Bishop Level Trader
            </div>
          </div>
        )}
      </div>

      {/* Main Menu */}
      <nav style={{ flex: 1, padding: "0 4px" }}>
        {menuItems.map((item) => (
          <MenuItem key={item.view} item={item} />
        ))}
      </nav>

      {/* Bottom Menu */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: "16px",
          marginTop: "16px",
          padding: "0 4px",
        }}
      >
        {bottomMenuItems.map((item) => (
          <MenuItem key={item.view} item={item} />
        ))}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => onCollapse(!isCollapsed)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px",
          marginTop: "16px",
          background: "none",
          border: "none",
          color: "#888",
          cursor: "pointer",
          borderRadius: "12px",
          transition: "all 0.2s ease",
          width: "100%",
        }}
        className="hover:bg-white/5 hover:text-white"
      >
        {isCollapsed ? (
          <FiChevronRight size={20} />
        ) : (
          <>
            <FiChevronLeft size={20} />
            <span style={{ fontSize: "14px", marginLeft: "8px" }}>
              Collapse
            </span>
          </>
        )}
      </button>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "12px",
          marginTop: "16px",
          background: "none",
          border: "none",
          color: "#EF4444",
          cursor: "pointer",
          borderRadius: "12px",
          transition: "all 0.2s ease",
          width: "100%",
        }}
        className="hover:bg-red-500/10"
      >
        <FiLogOut size={20} />
        {!isCollapsed && <span>Logout</span>}
      </button>
    </div>
  );
};

export default Sidebar;
