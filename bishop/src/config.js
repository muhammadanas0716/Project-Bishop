// Environment-specific configuration
const config = {
  development: {
    API_URL: "http://localhost:5001",
  },
  production: {
    API_URL:
      process.env.REACT_APP_API_URL || "https://project-bishop.onrender.com",
  },
};

// Determine current environment
const environment = process.env.NODE_ENV || "development";

// Export configuration for current environment
export const { API_URL } = config[environment];
