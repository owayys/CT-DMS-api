import { AppResult } from "@carbonteq/hexapp";

export async function retry<T>(
    retryOpts: { attempts: number },
    fn: (...args: unknown[]) => Promise<AppResult<T>>
) {
    let value = await fn();
    for (let retries = 0; retries < retryOpts.attempts; retries++) {
        value = await fn();

        if (value.isOk()) {
            return value;
        }
    }

    return value;
}

export async function timeout<T>(
    duration: number,
    fn: () => Promise<AppResult<T>>
): Promise<AppResult<T>> {
    const result = await race({
        promise: new Promise(async (resolve, reject) => resolve(await fn())),
        timeout: duration,
        error: new Error("Operation timed out"),
    });

    if (result instanceof AppResult) {
        return result;
    } else {
        return AppResult.Err(new Error("Operation timed out"));
    }
}

export function race<T>({
    promise,
    timeout,
    error,
}: {
    promise: Promise<T>;
    timeout: number;
    error: Error;
}): Promise<T | NodeJS.Timeout> {
    //@ts-ignore
    let timer: NodeJS.Timeout = null;

    return Promise.race([
        new Promise<NodeJS.Timeout>((resolve, reject) => {
            timer = setTimeout(reject, timeout, error);
            return timer;
        }),
        promise.then((value) => {
            clearTimeout(timer);
            return value;
        }),
    ]);
}
