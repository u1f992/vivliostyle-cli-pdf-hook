import assert from "node:assert";
import test from "node:test";

import { chromium, hooks } from "./index.js";

await test("call once", async (ctx) => {
  const before = ctx.mock.method(hooks.pdf, "before");
  const after = ctx.mock.method(hooks.pdf, "after");

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const pdfOptions = {
      format: "A4",
      margin: { top: "10mm", bottom: "10mm" },
    };
    await page.pdf(pdfOptions);
  } finally {
    await browser.close();
  }

  assert.strictEqual(before.mock.callCount(), 1);
  const call = before.mock.calls[0];
  assert.ok(call);
  assert.strictEqual(call.arguments[0]?.options?.format, "A4");
  assert.deepStrictEqual(call.arguments[0]?.options?.margin, {
    top: "10mm",
    bottom: "10mm",
  });
  assert.strictEqual(after.mock.callCount(), 1);
});
