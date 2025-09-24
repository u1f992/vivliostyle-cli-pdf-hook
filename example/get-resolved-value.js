// @ts-check

import { fromHtml } from "hast-util-from-html";
import { toText } from "hast-util-to-text";
import fs from "node:fs";
import path from "node:path";
import { visit } from "unist-util-visit";

visit(
  fromHtml(
    fs.readFileSync(path.join(import.meta.dirname, "output.html"), {
      encoding: "utf-8",
    }),
  ),
  "element",
  (elem) => {
    if ("dataStashHref" in elem.properties) {
      console.log(toText(elem));
    }
  },
);
