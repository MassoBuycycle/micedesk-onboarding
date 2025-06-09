import serverless from 'serverless-http';
import * as appModule from '../backend/dist/server.js';

const app = (appModule as any).default || appModule;
export default serverless(app); 