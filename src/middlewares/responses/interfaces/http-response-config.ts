import { IHttpResponseConfigMethod } from './http-response-config-method';

export interface IHttpResponseConfig {
  keys: {
    error: string,
    code: string,
    details: string
  };
  methods: { [name: string]: IHttpResponseConfigMethod };
}
