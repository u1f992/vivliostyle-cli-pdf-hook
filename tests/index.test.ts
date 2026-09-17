import assert from "node:assert";
import test from "node:test";

import puppeteer, { hooks } from "../src/index.ts";

const defaultLaunchOptions = {
  headless: true,
  channel: "chrome" as const,
};

await test("launch hooks are called", async (ctx) => {
  const launchBefore = ctx.mock.method(hooks.launch, "before");
  const launchAfter = ctx.mock.method(hooks.launch, "after");
  const launchOptions = { ...defaultLaunchOptions };

  const browser = await puppeteer.launch(launchOptions);
  try {
    await browser.newPage();
  } finally {
    await browser.close();
  }

  assert.strictEqual(launchBefore.mock.callCount(), 1);
  const beforeCall = launchBefore.mock.calls[0];
  assert.ok(beforeCall);
  assert.strictEqual(beforeCall.arguments[0]?.options?.headless, true);

  assert.strictEqual(launchAfter.mock.callCount(), 1);
  const afterCall = launchAfter.mock.calls[0];
  assert.ok(afterCall);
});

await test("newPage hooks are called via browser.newPage()", async (ctx) => {
  const newPageBefore = ctx.mock.method(hooks.newPage, "before");
  const newPageAfter = ctx.mock.method(hooks.newPage, "after");

  const browser = await puppeteer.launch(defaultLaunchOptions);
  try {
    const page = await browser.newPage();
    await page.close();
  } finally {
    await browser.close();
  }

  assert.strictEqual(newPageBefore.mock.callCount(), 1);
  const beforeCall = newPageBefore.mock.calls[0];
  assert.ok(beforeCall);
  assert.ok(beforeCall.arguments[0]?.browser);
  assert.ok(beforeCall.arguments[0]?.context);

  assert.strictEqual(newPageAfter.mock.callCount(), 1);
  const afterCall = newPageAfter.mock.calls[0];
  assert.ok(afterCall);
});

await test("newPage hooks are called via browserContext.newPage()", async (ctx) => {
  const newPageBefore = ctx.mock.method(hooks.newPage, "before");
  const newPageAfter = ctx.mock.method(hooks.newPage, "after");

  const browser = await puppeteer.launch(defaultLaunchOptions);
  try {
    const [context] = browser.browserContexts();
    assert.ok(context);
    const page = await context.newPage();
    await page.close();
  } finally {
    await browser.close();
  }

  assert.strictEqual(newPageBefore.mock.callCount(), 1);
  const beforeCall = newPageBefore.mock.calls[0];
  assert.ok(beforeCall);
  assert.ok(beforeCall.arguments[0]?.browser);
  assert.ok(beforeCall.arguments[0]?.context);

  assert.strictEqual(newPageAfter.mock.callCount(), 1);
  const afterCall = newPageAfter.mock.calls[0];
  assert.ok(afterCall);
});

await test("newContext hooks are called", async (ctx) => {
  const newContextBefore = ctx.mock.method(hooks.newContext, "before");
  const newContextAfter = ctx.mock.method(hooks.newContext, "after");

  const browser = await puppeteer.launch(defaultLaunchOptions);
  try {
    const context = await browser.createBrowserContext();
    await context.close();
  } finally {
    await browser.close();
  }

  assert.strictEqual(newContextBefore.mock.callCount(), 1);
  const beforeCall = newContextBefore.mock.calls[0];
  assert.ok(beforeCall);
  assert.ok(beforeCall.arguments[0]?.browser);

  assert.strictEqual(newContextAfter.mock.callCount(), 1);
  const afterCall = newContextAfter.mock.calls[0];
  assert.ok(afterCall);
});

await test("pdf hooks are called", async (ctx) => {
  const pdfBefore = ctx.mock.method(hooks.pdf, "before");
  const pdfAfter = ctx.mock.method(hooks.pdf, "after");
  const pdfOptions = {
    format: "A4" as const,
    margin: { top: "10mm", bottom: "10mm" },
  };

  const browser = await puppeteer.launch(defaultLaunchOptions);
  try {
    const page = await browser.newPage();
    await page.pdf(pdfOptions);
  } finally {
    await browser.close();
  }

  assert.strictEqual(pdfBefore.mock.callCount(), 1);
  const beforeCall = pdfBefore.mock.calls[0];
  assert.ok(beforeCall);
  assert.strictEqual(beforeCall.arguments[0]?.options?.format, "A4");
  assert.deepStrictEqual(beforeCall.arguments[0]?.options?.margin, {
    top: "10mm",
    bottom: "10mm",
  });

  assert.strictEqual(pdfAfter.mock.callCount(), 1);
  const afterCall = pdfAfter.mock.calls[0];
  assert.ok(afterCall);
});

await test("pdf hooks are called for pages from browserContexts().pages()", async (ctx) => {
  const pdfBefore = ctx.mock.method(hooks.pdf, "before");
  const pdfAfter = ctx.mock.method(hooks.pdf, "after");

  const browser = await puppeteer.launch(defaultLaunchOptions);
  try {
    // Create a page first
    await browser.newPage();

    // Get pages via browserContexts().pages() - this is how Vivliostyle CLI does it
    const [context] = browser.browserContexts();
    assert.ok(context);
    const pages = await context.pages();
    const page = pages[0];
    assert.ok(page);

    await page.pdf();
  } finally {
    await browser.close();
  }

  assert.strictEqual(pdfBefore.mock.callCount(), 1);
  assert.strictEqual(pdfAfter.mock.callCount(), 1);
});

await test("browser.newPage() forwards options to the real browser", async (ctx) => {
  const launchAfter = ctx.mock.method(hooks.launch, "after");
  const newPageBefore = ctx.mock.method(hooks.newPage, "before");
  const newPageOptions = { type: "tab" as const, background: true };

  const browser = await puppeteer.launch(defaultLaunchOptions);
  try {
    const realBrowser = launchAfter.mock.calls[0]?.arguments[0]?.browser;
    assert.ok(realBrowser);
    const realNewPage = ctx.mock.method(realBrowser, "newPage");

    const page = await browser.newPage(newPageOptions);
    await page.close();

    assert.deepStrictEqual(realNewPage.mock.calls[0]?.arguments, [newPageOptions]);
    assert.deepStrictEqual(newPageBefore.mock.calls[0]?.arguments[0]?.options, newPageOptions);
  } finally {
    await browser.close();
  }
});

await test("browserContext.newPage() forwards options to the real context", async (ctx) => {
  const newContextAfter = ctx.mock.method(hooks.newContext, "after");
  const newPageBefore = ctx.mock.method(hooks.newPage, "before");
  const newPageOptions = { type: "tab" as const, background: true };

  const browser = await puppeteer.launch(defaultLaunchOptions);
  try {
    const context = await browser.createBrowserContext();
    const realContext = newContextAfter.mock.calls[0]?.arguments[0]?.context;
    assert.ok(realContext);
    const realNewPage = ctx.mock.method(realContext, "newPage");

    const page = await context.newPage(newPageOptions);
    await page.close();

    assert.deepStrictEqual(realNewPage.mock.calls[0]?.arguments, [newPageOptions]);
    assert.deepStrictEqual(newPageBefore.mock.calls[0]?.arguments[0]?.options, newPageOptions);
    await context.close();
  } finally {
    await browser.close();
  }
});

await test("browserContext.pages() forwards includeAll to the real context", async (ctx) => {
  const newContextAfter = ctx.mock.method(hooks.newContext, "after");

  const browser = await puppeteer.launch(defaultLaunchOptions);
  try {
    const context = await browser.createBrowserContext();
    const realContext = newContextAfter.mock.calls[0]?.arguments[0]?.context;
    assert.ok(realContext);
    const realPages = ctx.mock.method(realContext, "pages");

    await context.pages(true);
    await context.pages();

    assert.deepStrictEqual(
      realPages.mock.calls.map((call) => call.arguments),
      [[true], [undefined]],
    );
    await context.close();
  } finally {
    await browser.close();
  }
});
