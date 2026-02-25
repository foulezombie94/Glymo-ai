module.exports = {
  connect: function() { return { on: function() {}, write: function() {}, end: function() {}, destroy: function() {} }; },
  Server: function() { return { listen: function() {}, close: function() {}, on: function() {} }; },
  createSecureContext: function() { return {}; },
};
