import React, { createContext, useState, useContext, useEffect } from "react";

// Create the AuthContext
const AuthContext = createContext(null);

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Backend Base URL
  const API_BASE_URL = "https://project-bishop.onrender.com/api/auth";

  // Check if user is logged in on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user");
          return res.json();
        })
        .then((data) => {
          setUser(data); // Set user data
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login Function
  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setUser(data.user); // Update user state
        return { success: true };
      } else {
        return { success: false, error: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, error: "Network error, please try again" };
    }
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to Use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
