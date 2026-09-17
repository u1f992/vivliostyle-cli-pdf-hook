import puppeteerReal from "puppeteer-core-real";
import type { Browser, BrowserContext, Page } from "puppeteer-core-real";

type Puppeteer = typeof puppeteerReal;

type TraceHook = (label: string, prop: string | symbol) => void | Promise<void>;

type LaunchBeforeHook = (params: {
  puppeteer: Puppeteer;
  options?: Parameters<Puppeteer["launch"]>[0];
}) => void | Promise<void>;
type LaunchAfterHook = (params: {
  puppeteer: Puppeteer;
  browser: Browser;
}) => void | Promise<void>;

type NewPageBeforeHook = (params: {
  puppeteer: Puppeteer;
  browser: Browser;
  context: BrowserContext;
  options?: Parameters<BrowserContext["newPage"]>[0];
}) => void | Promise<void>;
type NewPageAfterHook = (params: {
  puppeteer: Puppeteer;
  browser: Browser;
  context: BrowserContext;
  page: Page;
}) => void | Promise<void>;

type NewContextBeforeHook = (params: {
  puppeteer: Puppeteer;
  browser: Browser;
  options?: Parameters<Browser["createBrowserContext"]>[0];
}) => void | Promise<void>;
type NewContextAfterHook = (params: {
  puppeteer: Puppeteer;
  browser: Browser;
  context: BrowserContext;
}) => void | Promise<void>;

type PdfBeforeHook = (params: {
  puppeteer: Puppeteer;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  options?: Parameters<Page["pdf"]>[0];
}) => void | Promise<void>;
type PdfBuffer = Awaited<ReturnType<Page["pdf"]>>;
type PdfAfterHook = (params: {
  puppeteer: Puppeteer;
  browser: Browser;
  context: BrowserContext;
  page: Page;
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

type MethodOverrides<T> = {
  [K in keyof T]?: T[K];
};

function proxify<T extends object>(
  target: T,
  label: string,
  overrides: MethodOverrides<T>,
): T {
  return new Proxy(target, {
    get(t, prop) {
      globalHooks.trace(label, prop);
      if (prop in overrides) {
        return overrides[prop as keyof T];
      }
      const value = Reflect.get(t, prop);
      return typeof value === "function" ? value.bind(t) : value;
    },
  });
}

function createPageProxy(
  puppeteer: Puppeteer,
  browser: Browser,
  context: BrowserContext,
  page: Page,
): Page {
  return proxify(page, "page", {
    pdf: async (options?: Parameters<Page["pdf"]>[0]) => {
      await globalHooks.pdf.before({
        puppeteer,
        browser,
        context,
        page,
        options,
      });
      const buffer = await page.pdf(options);
      return (
        (await globalHooks.pdf.after({
          puppeteer,
          browser,
          context,
          page,
          buffer,
        })) ?? buffer
      );
    },
  });
}

function createContextProxy(
  puppeteer: Puppeteer,
  browser: Browser,
  context: BrowserContext,
): BrowserContext {
  return proxify(context, "context", {
    newPage: async (options?: Parameters<BrowserContext["newPage"]>[0]) => {
      await globalHooks.newPage.before({
        puppeteer,
        browser,
        context,
        options,
      });
      const page = await context.newPage();
      await globalHooks.newPage.after({ puppeteer, browser, context, page });
      return createPageProxy(puppeteer, browser, context, page);
    },
    pages: async (includeAll?: Parameters<BrowserContext["pages"]>[0]) => {
      const pages = await context.pages(includeAll);
      return pages.map((page) =>
        createPageProxy(puppeteer, browser, context, page),
      );
    },
  });
}

function createBrowserProxy(puppeteer: Puppeteer, browser: Browser): Browser {
  return proxify(browser, "browser", {
    newPage: async () => {
      const defaultContext = browser.browserContexts()[0]!;
      await globalHooks.newPage.before({
        puppeteer,
        browser,
        context: defaultContext,
      });
      const page = await browser.newPage();
      await globalHooks.newPage.after({
        puppeteer,
        browser,
        context: defaultContext,
        page,
      });
      return createPageProxy(puppeteer, browser, defaultContext, page);
    },
    createBrowserContext: async (
      options?: Parameters<Browser["createBrowserContext"]>[0],
    ) => {
      await globalHooks.newContext.before({ puppeteer, browser, options });
      const context = await browser.createBrowserContext(options);
      await globalHooks.newContext.after({ puppeteer, browser, context });
      return createContextProxy(puppeteer, browser, context);
    },
    browserContexts: () => {
      const contexts = browser.browserContexts();
      return contexts.map((context) =>
        createContextProxy(puppeteer, browser, context),
      );
    },
  });
}

const proxiedLaunch = async (options?: Parameters<Puppeteer["launch"]>[0]) => {
  await globalHooks.launch.before({ puppeteer: puppeteerReal, options });
  const browser = await puppeteerReal.launch(options);
  await globalHooks.launch.after({ puppeteer: puppeteerReal, browser });
  return createBrowserProxy(puppeteerReal, browser);
};

const puppeteerProxy = proxify(puppeteerReal, "puppeteer", {
  launch: proxiedLaunch,
});

export default puppeteerProxy;
export * from "puppeteer-core-real";
export { proxiedLaunch as launch };
