declare module 'tunnel-ssh' {
  import { Server } from 'http';
  // eslint-disable-next-line @typescript-eslint/ban-types
  function tunnel(config: any, callback?: (error: any, server?: Server) => void): Server;
  namespace tunnel {}
  export = tunnel;
} 