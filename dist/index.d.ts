import * as playwright from "playwright-core-real";
type TraceHook = (label: string, prop: string | symbol) => void | Promise<void>;
type PdfBuffer = Awaited<ReturnType<playwright.Page["pdf"]>>;
type PdfBeforeHook = (params: {
    chromium: playwright.BrowserType;
    browser: playwright.Browser;
    context: playwright.BrowserContext;
    page: playwright.Page;
}) => void | Promise<void>;
type PdfAfterHook = (params: {
    chromium: playwright.BrowserType;
    browser: playwright.Browser;
    context: playwright.BrowserContext;
    page: playwright.Page;
    buffer: PdfBuffer;
}) => PdfBuffer | Promise<PdfBuffer> | void | Promise<void>;
export type Hooks = {
    trace: TraceHook;
    pdf: {
        before: PdfBeforeHook;
        after: PdfAfterHook;
    };
};
export declare const hooks: Hooks;
export declare const chromium: playwright.BrowserType<{}>;
export { default } from "playwright-core-real";
export * from "playwright-core-real";
//# sourceMappingURL=index.d.ts.map