import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';
import EventEmitter from 'events';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

if (typeof global.process === 'undefined') {
  global.process = require('process');
}

if (typeof global.process.env === 'undefined') {
  global.process.env = {};
}

if (typeof global.EventEmitter === 'undefined') {
  global.EventEmitter = EventEmitter;
}

// Add util if some packages expect it globally
if (typeof global.util === 'undefined') {
  global.util = require('util');
}
