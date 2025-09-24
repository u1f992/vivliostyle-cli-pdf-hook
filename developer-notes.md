## Release new version

<figure>
<figcaption>package.json</figcaption>

```diff
  {
    "name": "@u1f992/vivliostyle-cli-pdf-hook",
    "private": true,
-   "version": "0.1.0",
+   "version": "0.1.1",
```

</figure>
<figure>
<figcaption>package-lock.json</figcaption>

```diff
  {
    "name": "@u1f992/vivliostyle-cli-pdf-hook",
-   "version": "0.1.0",
+   "version": "0.1.1",
    "lockfileVersion": 3,
    "requires": true,
    "packages": {
      "": {
        "name": "@u1f992/vivliostyle-cli-pdf-hook",
-       "version": "0.1.0",
+       "version": "0.1.1",
```

</figure>
<figure>
<figcaption>example/package.json</figcaption>

```diff
  {
    "type": "module",
    "dependencies": {
      "@vivliostyle/cli": "9.7.0",
      "hast-util-from-html": "^2.0.3",
      "hast-util-to-text": "^4.0.2",
-     "playwright-core": "npm:@u1f992/vivliostyle-cli-pdf-hook@0.1.0",
+     "playwright-core": "npm:@u1f992/vivliostyle-cli-pdf-hook@0.1.1",
      "unist-util-visit": "^5.0.0"
    },
    "overrides": {
      "@vivliostyle/cli": {
-       "playwright-core": "npm:@u1f992/vivliostyle-cli-pdf-hook@0.1.0"
+       "playwright-core": "npm:@u1f992/vivliostyle-cli-pdf-hook@0.1.1"
      }
    }
  }
```

</figure>
<figure>
<figcaption>example/package-lock.json</figcaption>

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
-         "playwright-core": "npm:@u1f992/vivliostyle-cli-pdf-hook@0.1.0",
+         "playwright-core": "npm:@u1f992/vivliostyle-cli-pdf-hook@v0.1.1",
```

</figure>

```
$ git package.json package-lock.json example/package.json example/package-lock.json
$ git commit -m "0.1.1"
$ git tag -a v0.1.1 -m "0.1.1"
```
