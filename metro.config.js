
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

const path = require("path");

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  assert: require.resolve("assert/"),
  buffer: require.resolve("buffer/"),
  console: require.resolve("console-browserify"),
  constants: require.resolve("constants-browserify"),
  crypto: require.resolve("react-native-crypto"),
  domain: require.resolve("domain-browser"),
  events: require.resolve("events/"),
  http: require.resolve("stream-http"),
  https: require.resolve("https-browserify"),
  path: require.resolve("path-browserify"),
  process: require.resolve("process/"),
  punycode: require.resolve("punycode/"),
  querystring: require.resolve("querystring-es3"),
  stream: require.resolve("stream-browserify"),
  timers: require.resolve("timers-browserify"),
  tty: require.resolve("tty-browserify"),
  url: require.resolve("url/"),
  util: require.resolve("util/"),
  vm: require.resolve("vm-browserify"),
  zlib: require.resolve("browserify-zlib"),
  // Physically point to mocks for modules that don't exist in React Native
  net: path.resolve(__dirname, "src/lib/mocks/net.js"),
  tls: path.resolve(__dirname, "src/lib/mocks/tls.js"),
  fs: path.resolve(__dirname, "src/lib/mocks/fs.js"),
  dns: path.resolve(__dirname, "src/lib/mocks/empty.js"),
  os: path.resolve(__dirname, "src/lib/mocks/empty.js"),
  child_process: path.resolve(__dirname, "src/lib/mocks/empty.js"),
  dgram: path.resolve(__dirname, "src/lib/mocks/empty.js"),
};

// Prioritize browser and react-native fields
// @ts-ignore - resolverMainFields is marked as read-only in some type definitions
config.resolver.resolverMainFields = [
  "browser",
  "react-native",
  ...config.resolver.resolverMainFields,
];

// @ts-ignore - withNativeWind type mismatch due to complex Metro config object
module.exports = withNativeWind(config, { input: "./global.css" });
