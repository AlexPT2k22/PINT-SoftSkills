const mockMode = process.env.MOCK_MODE === "true";

module.exports = mockMode
  ? require("../mock/mockApp")
  : require("../server");
