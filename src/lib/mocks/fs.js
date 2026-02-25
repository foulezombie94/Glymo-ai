module.exports = {
  readFile: function(_, cb) { if (cb) cb(null, ""); },
  readFileSync: function() { return ""; },
  writeFile: function(_, __, cb) { if (cb) cb(null); },
  writeFileSync: function() {},
  existsSync: function() { return false; },
  stat: function(_, cb) { if (cb) cb(null, {}); },
  statSync: function() { return {}; },
  readdir: function(_, cb) { if (cb) cb(null, []); },
  readdirSync: function() { return []; },
  watch: function() { return { close: function() {} }; },
  promises: {
    readFile: async function() { return ""; },
    writeFile: async function() {},
    stat: async function() { return {}; },
    readdir: async function() { return []; },
  },
};
