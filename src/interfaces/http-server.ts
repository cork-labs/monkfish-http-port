import { IEmitter } from '@cork-labs/interface-emitter';

export interface IHttpServer extends IEmitter {
  settings: {
    address: string,
    https: boolean
  };
  start (): Promise<void>;
}
