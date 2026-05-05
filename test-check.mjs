// Test file with issues
const config = {
  name: "test",
  testFunction: function() {
    // Intentionally malformed for testing
    let x = 1
    return x
  }
};

export default config;