## Release new version

<figure>
<figcaption>package.json</figcaption>

```diff
  {
    "name": "@u1f992/vivliostyle-cli-pdf-hook",
-   "version": "0.3.0",
+   "version": "0.3.1",
```

</figure>
<figure>
<figcaption>package-lock.json</figcaption>

```diff
  {
    "name": "@u1f992/vivliostyle-cli-pdf-hook",
-   "version": "0.3.0",
+   "version": "0.3.1",
    "lockfileVersion": 3,
    "requires": true,
    "packages": {
      "": {
        "name": "@u1f992/vivliostyle-cli-pdf-hook",
-       "version": "0.3.0",
+       "version": "0.3.1",
```

</figure>
<figure>
<figcaption>example/package.json</figcaption>

```diff
  {
    "type": "module",
    "dependencies": {
      "@vivliostyle/cli": "10.3.0",
-     "puppeteer-core": "npm:@u1f992/vivliostyle-cli-pdf-hook@0.3.0"
+     "puppeteer-core": "npm:@u1f992/vivliostyle-cli-pdf-hook@0.3.1"
    },
    "overrides": {
      "@vivliostyle/cli": {
        "puppeteer-core": "$puppeteer-core"
      }
    }
  }
```

</figure>

```
$ git add package.json package-lock.json example/package.json
$ git commit -m "0.3.1"
$ git tag -a v0.3.1 -m "0.3.1"
```
