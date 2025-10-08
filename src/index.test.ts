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
