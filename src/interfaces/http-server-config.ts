export interface IHttpServerConfig {
  port?: number;
  https?: false | {
    key: string,
    cert: string
  };
}
