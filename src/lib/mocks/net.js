module.exports = {
  Socket: function() { return { on: function() {}, write: function() {}, end: function() {}, destroy: function() {} }; },
  createConnection: function() { return { on: function() {}, write: function() {}, end: function() {}, destroy: function() {} }; },
  createServer: function() { return { listen: function() {}, close: function() {}, on: function() {} }; },
  connect: function() { return { on: function() {}, write: function() {}, end: function() {}, destroy: function() {} }; },
  isIP: function() { return 0; },
  isIPv4: function() { return false; },
  isIPv6: function() { return false; },
};
