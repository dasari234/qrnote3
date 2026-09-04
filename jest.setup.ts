// 1. Core Web Streams Polyfills (Must be first for @ai-sdk)
if (typeof globalThis.TransformStream === 'undefined') {
  const { TransformStream, ReadableStream, WritableStream } = require('node:stream/web');

  globalThis.TransformStream = TransformStream;
  globalThis.ReadableStream = ReadableStream;
  globalThis.WritableStream = WritableStream;
}

// 2. Text Encoder Polyfills (Required by underlying stream readers)
if (typeof globalThis.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('node:util');
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}

// 3. Extend Jest matchers for DOM assertions (like .toBeInTheDocument())
import '@testing-library/jest-dom';

