import '@testing-library/jest-dom';

// 1. Polyfills must be loaded first, before any other code that might use them.
import { TextEncoder, TextDecoder } from 'util';
import { TransformStream } from 'web-streams-polyfill';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.TransformStream = TransformStream;

// 2. The MSW setup code, which relies on the polyfills, comes next.
import { server } from './mocks/server.js';
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());