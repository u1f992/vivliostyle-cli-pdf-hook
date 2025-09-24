// @ts-check

import { VFM } from "@vivliostyle/vfm";
import fs from "node:fs";
import path from "node:path";
import { visit } from "unist-util-visit";

import { hooks } from "playwright-core";

hooks.pdf.before = async ({ page }) => {
  const html = await page.evaluate(
    () =>
      // eslint-disable-next-line no-undef
      document.documentElement.outerHTML,
  );
  fs.writeFileSync(path.join(process.cwd(), "output.html"), html, {
    encoding: "utf-8",
  });

  const resolvedValues = await page.evaluate(() =>
    // 文字列化されてブラウザで実行されるので、
    // Elementを直接受け渡すことはできない

    // eslint-disable-next-line no-undef
    Array.from(document.querySelectorAll("[data-pseudo-id]"))
      .filter((elem) => elem.querySelector("[data-vivliostyle-target-counter]"))
      .map((elem) => ({
        id: /** @type {string} */ (elem.getAttribute("data-pseudo-id")),
        textContent: elem.textContent,
      })),
  );
  fs.writeFileSync(
    path.join(process.cwd(), "counters.json"),
    JSON.stringify(resolvedValues),
    { encoding: "utf-8" },
  );
  console.dir(resolvedValues);
};

/** @type {import('@vivliostyle/cli').VivliostyleConfigSchema} */
const vivliostyleConfig = {
  title: "example",
  author: "u1f992",
  theme: "./theme",
  entry: ["manuscript.md"],
  documentProcessor: (opts, meta) =>
    VFM(opts, meta).use(() => (root) => {
      // Vivliostyleに処理されたあとで検索できるID値が必要
      // id属性やhref属性は、文書全体で通るように処理の過程で置き換えられることがある
      // data-*属性なら、Vivliostyleの内部処理で使う命名と衝突していなければ保持されるようだ
      //
      // .vivliostyle/manuscript.htmlとhooks.pdf.beforeが出力するcounters.jsonを突き合わせることで、
      // target-counter()の解決済みの値がわかる

      visit(/** @type {import("hast").Root} */ (root), "element", (elem) => {
        if (elem.tagName === "a") {
          (elem.properties ??= {})["data-pseudo-id"] = crypto.randomUUID();
        }
      });
    }),
};

export default vivliostyleConfig;
