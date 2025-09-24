import assert from "node:assert";
import test from "node:test";

import { chromium, hooks } from "./index.js";

await test("call once", async (ctx) => {
  const before = ctx.mock.method(hooks.pdf, "before");
  const after = ctx.mock.method(hooks.pdf, "after");

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.pdf();
  } finally {
    await browser.close();
  }

  assert.strictEqual(before.mock.callCount(), 1);
  assert.strictEqual(after.mock.callCount(), 1);
});
