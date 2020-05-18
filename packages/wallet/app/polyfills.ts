/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Provides a proper runtime type information extensively used in inversify DI container
 */
import "reflect-metadata";

// a process shim is required from some native module polyfills to be in the global scope
import process from "process";

global.process = process;

/**
 * Polyfill `btoa` and `atob` as they are not available on embedded virtual machine
 */
if (typeof (global as any).btoa === "undefined") {
  (global as any).btoa = (str: string) => new Buffer(str, "binary").toString("base64");
}
if (typeof (global as any).atob === "undefined") {
  (global as any).atob = (b64Encoded: string) =>
    new Buffer(b64Encoded, "base64").toString("binary");
}
