export interface IHttpResponseConfigMethod {
  type: 'data' | 'no-content' | 'client-error' | 'server-error';
  status: number;
  severity: 'info' | 'warn' | 'error';
  text: string;
}
