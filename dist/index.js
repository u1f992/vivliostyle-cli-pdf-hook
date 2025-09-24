import * as playwright from "playwright-core-real";
const globalHooks = {
    trace() { },
    pdf: {
        before() { },
        after() { },
    },
};
export const hooks = globalHooks;
function proxify(target, label, hooks) {
    return new Proxy(target, {
        get(t, prop, receiver) {
            globalHooks.trace(label, prop);
            if (typeof prop === "string" && prop in hooks) {
                const { before: beforeHook, after: afterHook } = hooks[prop];
                // @ts-expect-error allow any[]
                return async (...args) => {
                    await beforeHook?.(t);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
                    const result = Reflect.get(t, prop, receiver).apply(t, args);
                    return afterHook ? afterHook(t, result) : result;
                };
            }
            return Reflect.get(t, prop, receiver);
        },
    });
}
export const chromium = proxify(playwright.chromium, "chromium", {
    launch: {
        async after(chromium, browserPromise) {
            return proxify(await browserPromise, "browser", {
                newPage: {
                    async after(browser, pagePromise) {
                        return proxify(await pagePromise, "page", {
                            pdf: {
                                async before(page) {
                                    await globalHooks.pdf.before({
                                        chromium,
                                        browser,
                                        context: page.context(),
                                        page,
                                    });
                                },
                                async after(page, bufferPromise) {
                                    const buffer = await bufferPromise;
                                    return ((await globalHooks.pdf.after({
                                        chromium,
                                        browser,
                                        context: page.context(),
                                        page,
                                        buffer,
                                    })) ?? buffer);
                                },
                            },
                        });
                    },
                },
                newContext: {
                    async after(_, contextPromise) {
                        return proxify(await contextPromise, "context", {});
                    },
                },
            });
        },
    },
});
export { default } from "playwright-core-real";
export * from "playwright-core-real";
//# sourceMappingURL=index.js.map