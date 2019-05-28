import express from 'express';

export interface IResCookies extends express.Response {
  setSessionCookie: (name: string, value: string) => void;
  setCookie: (name: string, value: string, maxAge: number) => void;
  unsetCookie: (name: string) => void;
}
