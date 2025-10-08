import assert from "node:assert";
import test from "node:test";

import { chromium, hooks } from "./index.js";

await test("launch hooks are called", async (ctx) => {
  const launchBefore = ctx.mock.method(hooks.launch, "before");
  const launchAfter = ctx.mock.method(hooks.launch, "after");
  const launchOptions = { headless: true };

  const browser = await chromium.launch(launchOptions);
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

await test("newPage hooks are called", async (ctx) => {
  const newPageBefore = ctx.mock.method(hooks.newPage, "before");
  const newPageAfter = ctx.mock.method(hooks.newPage, "after");
  const newPageOptions = { viewport: { width: 1920, height: 1080 } };

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage(newPageOptions);
    await page.close();
  } finally {
    await browser.close();
  }

  assert.strictEqual(newPageBefore.mock.callCount(), 1);
  const beforeCall = newPageBefore.mock.calls[0];
  assert.ok(beforeCall);
  assert.ok(beforeCall.arguments[0]?.browser);
  assert.deepStrictEqual(beforeCall.arguments[0]?.options?.viewport, {
    width: 1920,
    height: 1080,
  });

  assert.strictEqual(newPageAfter.mock.callCount(), 1);
  const afterCall = newPageAfter.mock.calls[0];
  assert.ok(afterCall);
});

await test("newContext hooks are called", async (ctx) => {
  const newContextBefore = ctx.mock.method(hooks.newContext, "before");
  const newContextAfter = ctx.mock.method(hooks.newContext, "after");
  const newContextOptions = { viewport: { width: 800, height: 600 } };

  const browser = await chromium.launch();
  try {
    const context = await browser.newContext(newContextOptions);
    await context.close();
  } finally {
    await browser.close();
  }

  assert.strictEqual(newContextBefore.mock.callCount(), 1);
  const beforeCall = newContextBefore.mock.calls[0];
  assert.ok(beforeCall);
  assert.ok(beforeCall.arguments[0]?.browser);
  assert.deepStrictEqual(beforeCall.arguments[0]?.options?.viewport, {
    width: 800,
    height: 600,
  });

  assert.strictEqual(newContextAfter.mock.callCount(), 1);
  const afterCall = newContextAfter.mock.calls[0];
  assert.ok(afterCall);
});

await test("pdf hooks are called", async (ctx) => {
  const pdfBefore = ctx.mock.method(hooks.pdf, "before");
  const pdfAfter = ctx.mock.method(hooks.pdf, "after");
  const pdfOptions = {
    format: "A4",
    margin: { top: "10mm", bottom: "10mm" },
  };

  const browser = await chromium.launch();
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
