/// <reference types="vite/client" />

declare module "jsbarcode" {
  export default function JsBarcode(
    element: HTMLCanvasElement,
    data: string,
    options?: Record<string, unknown>
  ): void;
}
