// @ts-check

import fs from "node:fs";
import path from "node:path";

import { hooks } from "playwright-core";

hooks.pdf.before = async ({ page }) => {
  process.stdout.write("\n");

  const html = await page.evaluate(
    () =>
      // eslint-disable-next-line no-undef
      document.documentElement.outerHTML,
  );
  fs.writeFileSync(path.join(process.cwd(), "output.html"), html, {
    encoding: "utf-8",
  });

  const textContent = await page.evaluate(
    () =>
      // eslint-disable-next-line no-undef
      document.querySelector(
        '[data-pseudo-id="665ca512-9bd5-49c8-8431-a96fb88cd62b"]',
      )?.textContent,
  );
  process.stdout.write(`resolved: ${textContent}\n`);
};

/** @type {import('@vivliostyle/cli').VivliostyleConfigSchema} */
const vivliostyleConfig = {
  title: "example",
  theme: "./theme",
  entry: ["manuscript.md"],
};

export default vivliostyleConfig;
