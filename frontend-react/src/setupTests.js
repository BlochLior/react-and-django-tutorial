import '@testing-library/jest-dom';
import './test-utils/setup.js';

// 1. Polyfills must be loaded first, before any other code that might use them.
import { TextEncoder, TextDecoder } from 'util';
import { TransformStream } from 'web-streams-polyfill';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.TransformStream = TransformStream;

// Mock ResizeObserver for react-datepicker
// used for example in the QuestionForm.jsx DatePicker component,
// from the react-datepicker library
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};