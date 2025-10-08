import * as playwright from "playwright-core-real";

type TraceHook = (label: string, prop: string | symbol) => void | Promise<void>;
type PdfBuffer = Awaited<ReturnType<playwright.Page["pdf"]>>;
type PdfBeforeHook = (params: {
  chromium: playwright.BrowserType;
  browser: playwright.Browser;
  context: playwright.BrowserContext;
  page: playwright.Page;
  options?: Parameters<playwright.Page["pdf"]>[0];
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
  pdf: { before: PdfBeforeHook; after: PdfAfterHook };
};
const globalHooks: Hooks = {
  trace() {},
  pdf: {
    before() {},
    after() {},
  },
};
export const hooks = globalHooks;

type MethodKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]-?: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];
type MethodResult<T, K extends MethodKeys<T>> = ReturnType<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Extract<T[K], (...args: any[]) => any>
>;
type Hooks_<T> = Partial<{
  [K in MethodKeys<T>]: Partial<{
    before: (target: T, args: unknown[]) => void | Promise<void>;
    after: (target: T, result: MethodResult<T, K>) => MethodResult<T, K>;
  }>;
}>;
function proxify<T extends object>(target: T, label: string, hooks: Hooks_<T>) {
  return new Proxy(target, {
    get(t, prop, receiver) {
      globalHooks.trace(label, prop);
      if (typeof prop === "string" && prop in hooks) {
        const { before: beforeHook, after: afterHook } =
          hooks[prop as keyof typeof hooks]!;
        // @ts-expect-error allow any[]
        return async (...args) => {
          await beforeHook?.(t, args);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
          const result = (Reflect.get(t, prop, receiver) as Function).apply(
            t,
            args,
          );
          return afterHook ? afterHook(t, result) : result;
        };
      }
      return Reflect.get(t, prop, receiver);
    },
  });
}

export const chromium = proxify(playwright.chromium, "chromium", {
  launch: {
    async after(chromium, browserPromise) {
      return proxify(await browserPromise, "browser", {
        newPage: {
          async after(browser, pagePromise) {
            return proxify(await pagePromise, "page", {
              pdf: {
                async before(page, args) {
                  await globalHooks.pdf.before({
                    chromium,
                    browser,
                    context: page.context(),
                    page,
                    options: args[0] as Parameters<playwright.Page["pdf"]>[0],
                  });
                },
                async after(page, bufferPromise) {
                  const buffer = await bufferPromise;
                  return (
                    (await globalHooks.pdf.after({
                      chromium,
                      browser,
                      context: page.context(),
                      page,
                      buffer,
                    })) ?? buffer
                  );
                },
              },
            });
          },
        },
        newContext: {
          async after(_, contextPromise) {
            return proxify(await contextPromise, "context", {});
          },
        },
      });
    },
  },
});

export { default } from "playwright-core-real";
export * from "playwright-core-real";
