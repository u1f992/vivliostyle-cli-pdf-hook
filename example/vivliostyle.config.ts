import fs from "node:fs";
import path from "node:path";

import type { CDPSession, Page } from "puppeteer-core";
import { hooks } from "puppeteer-core";
import { defineConfig } from "@vivliostyle/cli";

const profilers = new WeakMap<Page, CDPSession>();

hooks.newPage.after = async ({ page }) => {
  const cdp = await page.createCDPSession();
  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.setSamplingInterval", { interval: 500 });
  await cdp.send("Profiler.start");
  profilers.set(page, cdp);
};

hooks.pdf.before = async ({ page }) => {
  process.stdout.write("\n");

  const html = await page.evaluate(() => document.documentElement.outerHTML);
  fs.writeFileSync(path.join(process.cwd(), "output.html"), html, {
    encoding: "utf-8",
  });

  const textContent = await page.evaluate(
    () =>
      document.querySelector('[data-pseudo-id="665ca512-9bd5-49c8-8431-a96fb88cd62b"]')
        ?.textContent,
  );
  process.stdout.write(`resolved: ${textContent}\n`);
};

hooks.pdf.after = async ({ page }) => {
  const cdp = profilers.get(page);
  if (cdp === undefined) {
    return;
  }
  profilers.delete(page);

  const { profile } = await cdp.send("Profiler.stop");
  await cdp.detach();
  fs.writeFileSync(path.join(process.cwd(), "output.cpuprofile"), JSON.stringify(profile), {
    encoding: "utf-8",
  });
};

export default defineConfig({
  title: "example",
  theme: "./theme",
  entry: ["manuscript.md"],
});
