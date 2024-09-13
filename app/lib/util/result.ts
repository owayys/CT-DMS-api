export class Result<T, E extends Error> {
    #ok: T | null; // value
    #err: E | null; // error

    constructor(ok: T | null, err: E | null) {
        {
            if (ok === null && err === null) {
                throw new Error("Result must have a value or an error");
            }
            if (ok && err) {
                throw new Error(
                    "Result cannot have both a value and and error"
                );
            }

            if (ok !== null) {
                this.#ok = ok;
                this.#err = null;
            } else {
                this.#err = err as E;
                this.#ok = null;
            }
        }
    }

    unwrap(): T {
        if (this.isOk()) {
            return this.#ok as T;
        }

        if (this.isErr()) {
            throw this.#err as E;
        }

        throw new Error("Unknown error");
    }

    expect(msg: string): T {
        if (this.isOk()) {
            return this.#ok as T;
        }

        if (this.isErr()) {
            const err = this.#err as E;
            throw (err.message = msg + ":\n " + err.message);
        }

        throw new Error(msg);
    }

    isOk(): this is Result<T, never> {
        return this.#ok !== null;
    }

    isErr(): this is Result<never, E> {
        return this.#err !== null;
    }

    getErr(): this extends Result<never, E> ? E : E | null {
        return this.#err as E;
    }

    map<U>(fn: (value: T) => U): Result<U, E> {
        if (this.isOk()) {
            return new Result<U, E>(fn(this.unwrap()), null);
        }
        return new Result<U, E>(null, this.getErr());
    }

    bind<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
        if (this.isOk()) {
            return fn(this.unwrap());
        }
        return new Result<U, E>(null, this.getErr());
    }
}
