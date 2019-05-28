export interface IHttpPortConfig {
  name: string;
  hostname: string;
  cors?: { origin?: 'echo' | string };
  cookies?: {};
  logger?: {};
  responses?: {};
  trace?: {};
}
