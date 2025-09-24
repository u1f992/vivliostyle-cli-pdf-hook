# @u1f992/vivliostyle-cli-pdf-hook

A proxy package for [playwright-core](https://github.com/microsoft/playwright/tree/main/packages/playwright-core), designed to provide hooks for PDF output processing in the [Vivliostyle CLI](https://github.com/vivliostyle/vivliostyle-cli).

Compatible with Vivliostyle CLI [v9.7.0](https://github.com/vivliostyle/vivliostyle-cli/releases/tag/v9.7.0), which ships with playwright-core [v1.55.0](https://github.com/microsoft/playwright/releases/tag/v1.55.0).

---

## Developer notes

<figure>
<figcaption>package.json</figcaption>

```diff
  {
    "name": "@u1f992/vivliostyle-cli-pdf-hook",
    "private": true,
-   "version": "0.0.0",
+   "version": "0.1.0",
```

</figure>
<details>
<summary>package-lock.json</summary>

```diff
  {
    "name": "@u1f992/vivliostyle-cli-pdf-hook",
-   "version": "0.1.0",
+   "version": "0.1.0",
    "lockfileVersion": 3,
    "requires": true,
    "packages": {
      "": {
        "name": "@u1f992/vivliostyle-cli-pdf-hook",
-       "version": "0.1.0",
+       "version": "0.1.0",
```

</details>
<figure>
<figcaption>example/package.json</figcaption>

```diff
  {
    "type": "module",
    "dependencies": {
      "@vivliostyle/cli": "9.7.0",
      "hast-util-from-html": "^2.0.3",
      "hast-util-to-text": "^4.0.2",
-     "playwright-core": "git+https://github.com/u1f992/vivliostyle-cli-pdf-hook.git",
+     "playwright-core": "git+https://github.com/u1f992/vivliostyle-cli-pdf-hook.git#v0.1.0",
      "unist-util-visit": "^5.0.0"
    },
    "overrides": {
      "@vivliostyle/cli": {
-       "playwright-core": "git+https://github.com/u1f992/vivliostyle-cli-pdf-hook.git"
+       "playwright-core": "git+https://github.com/u1f992/vivliostyle-cli-pdf-hook.git#v0.1.0"
      }
    }
  }
```

</figure>
<details>
<summary>example/package-lock.json</summary>

```diff
  {
    "name": "example",
    "lockfileVersion": 3,
    "requires": true,
    "packages": {
      "": {
        "dependencies": {
          "@vivliostyle/cli": "9.7.0",
          "hast-util-from-html": "^2.0.3",
          "hast-util-to-text": "^4.0.2",
-         "playwright-core": "git+https://github.com/u1f992/vivliostyle-cli-pdf-hook.git",
+         "playwright-core": "git+https://github.com/u1f992/vivliostyle-cli-pdf-hook.git#v0.1.0",
```

</details>

```
$ git commit -m "0.1.0"
$ git tag -a v0.1.0 -m "0.1.0"
```
