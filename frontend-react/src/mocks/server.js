import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// See explanation in handlers.js

export const server = setupServer(...handlers);