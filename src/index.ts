import * as playwright from "playwright-core-real";

type TraceHook = (label: string, prop: string | symbol) => void | Promise<void>;

type LaunchBeforeHook = (params: {
  chromium: playwright.BrowserType;
  options?: Parameters<playwright.BrowserType["launch"]>[0];
}) => void | Promise<void>;
type LaunchAfterHook = (params: {
  chromium: playwright.BrowserType;
  browser: playwright.Browser;
}) => void | Promise<void>;

type NewPageBeforeHook = (params: {
  chromium: playwright.BrowserType;
  browser: playwright.Browser;
  options?: Parameters<playwright.Browser["newPage"]>[0];
}) => void | Promise<void>;
type NewPageAfterHook = (params: {
  chromium: playwright.BrowserType;
  browser: playwright.Browser;
  page: playwright.Page;
}) => void | Promise<void>;

type NewContextBeforeHook = (params: {
  chromium: playwright.BrowserType;
  browser: playwright.Browser;
  options?: Parameters<playwright.Browser["newContext"]>[0];
}) => void | Promise<void>;
type NewContextAfterHook = (params: {
  chromium: playwright.BrowserType;
  browser: playwright.Browser;
  context: playwright.BrowserContext;
}) => void | Promise<void>;

type PdfBeforeHook = (params: {
  chromium: playwright.BrowserType;
  browser: playwright.Browser;
  context: playwright.BrowserContext;
  page: playwright.Page;
  options?: Parameters<playwright.Page["pdf"]>[0];
}) => void | Promise<void>;
type PdfBuffer = Awaited<ReturnType<playwright.Page["pdf"]>>;
type PdfAfterHook = (params: {
  chromium: playwright.BrowserType;
  browser: playwright.Browser;
  context: playwright.BrowserContext;
  page: playwright.Page;
  buffer: PdfBuffer;
}) => PdfBuffer | Promise<PdfBuffer> | void | Promise<void>;

export type Hooks = {
  trace: TraceHook;
  launch: { before: LaunchBeforeHook; after: LaunchAfterHook };
  newPage: { before: NewPageBeforeHook; after: NewPageAfterHook };
  newContext: { before: NewContextBeforeHook; after: NewContextAfterHook };
  pdf: { before: PdfBeforeHook; after: PdfAfterHook };
};
const globalHooks: Hooks = {
  trace() {},
  launch: {
    before() {},
    after() {},
  },
  newPage: {
    before() {},
    after() {},
  },
  newContext: {
    before() {},
    after() {},
  },
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
    async before(chromium, args) {
      await globalHooks.launch.before({
        chromium,
        options: args[0] as Parameters<playwright.BrowserType["launch"]>[0],
      });
    },
    async after(chromium, browserPromise) {
      const browser = await browserPromise;
      await globalHooks.launch.after({
        chromium,
        browser,
      });
      return proxify(browser, "browser", {
        newPage: {
          async before(browser, args) {
            await globalHooks.newPage.before({
              chromium,
              browser,
              options: args[0] as Parameters<playwright.Browser["newPage"]>[0],
            });
          },
          async after(browser, pagePromise) {
            const page = await pagePromise;
            await globalHooks.newPage.after({
              chromium,
              browser,
              page,
            });
            return proxify(page, "page", {
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
          async before(browser, args) {
            await globalHooks.newContext.before({
              chromium,
              browser,
              options: args[0] as Parameters<
                playwright.Browser["newContext"]
              >[0],
            });
          },
          async after(browser, contextPromise) {
            const context = await contextPromise;
            await globalHooks.newContext.after({
              chromium,
              browser,
              context,
            });
            return proxify(context, "context", {});
          },
        },
      });
    },
  },
});

export { default } from "playwright-core-real";
export * from "playwright-core-real";
