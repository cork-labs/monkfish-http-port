import express from 'express';

export interface IResLogger extends express.Response {
  log (): void;
  [key: string]: any;
}
