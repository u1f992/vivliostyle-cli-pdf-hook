// @ts-check

import fs from "node:fs";
import path from "node:path";
import { hooks } from "playwright-core";

hooks.trace = (label, prop) => {
  const propStr = prop.toString();
  if (!propStr.startsWith("_")) {
    console.log(`${label}.${propStr}`);
  }
};
hooks.pdf.before = async ({ page }) => {
  const html = await page.evaluate(
    () =>
      // eslint-disable-next-line no-undef
      document.documentElement.outerHTML,
  );
  fs.writeFileSync(path.join(process.cwd(), "output.html"), html, {
    encoding: "utf-8",
  });
};

/** @type {import('@vivliostyle/cli').VivliostyleConfigSchema} */
const vivliostyleConfig = {
  title: "example",
  author: "u1f992",
  theme: "./theme",
  entry: ["manuscript.md"],
};

export default vivliostyleConfig;
