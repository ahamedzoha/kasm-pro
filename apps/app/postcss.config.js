/**
 * PostCSS configuration for app
 */
const { join } = require("path");

module.exports = {
  plugins: {
    "@tailwindcss/postcss": {
      base: join(__dirname, "../../"),
    },
  },
};
