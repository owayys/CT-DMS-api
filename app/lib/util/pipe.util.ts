import { Result } from "./result";

interface Pipe {
    <A>(value: A): Result<A, Error>;
    <A, B>(value: A, fn1: (input: A) => Result<B, Error>): Result<B, Error>;
    <A, B, C>(
        value: A,
        fn1: (input: A) => Result<B, Error>,
        fn2: (input: B) => Result<C, Error>
    ): Result<C, Error>;
    <A, B, C, D>(
        value: A,
        fn1: (input: A) => Result<B, Error>,
        fn2: (input: B) => Result<C, Error>,
        fn3: (input: C) => Result<D, Error>
    ): Result<D, Error>;
    <A, B, C, D, E>(
        value: A,
        fn1: (input: A) => Result<B, Error>,
        fn2: (input: B) => Result<C, Error>,
        fn3: (input: C) => Result<D, Error>,
        fn4: (input: D) => Result<E, Error>
    ): Result<E, Error>;
    <A, B, C, D, E, F>(
        value: A,
        fn1: (input: A) => Result<B, Error>,
        fn2: (input: B) => Result<C, Error>,
        fn3: (input: C) => Result<D, Error>,
        fn4: (input: D) => Result<E, Error>,
        fn5: (input: E) => Result<F, Error>
    ): Result<F, Error>;
    <A, B, C, D, E, F, G>(
        value: A,
        fn1: (input: A) => Result<B, Error>,
        fn2: (input: B) => Result<C, Error>,
        fn3: (input: C) => Result<D, Error>,
        fn4: (input: D) => Result<E, Error>,
        fn5: (input: E) => Result<F, Error>,
        fn6: (input: F) => Result<G, Error>
    ): Result<G, Error>;
    <A, B, C, D, E, F, G, H>(
        value: A,
        fn1: (input: A) => Result<B, Error>,
        fn2: (input: B) => Result<C, Error>,
        fn3: (input: C) => Result<D, Error>,
        fn4: (input: D) => Result<E, Error>,
        fn5: (input: E) => Result<F, Error>,
        fn6: (input: F) => Result<G, Error>,
        fn7: (input: G) => Result<H, Error>
    ): Result<H, Error>;
}

export const pipe: Pipe = (
    value: any,
    ...fns: Function[]
): Result<unknown, Error> => {
    return fns.reduce<Result<unknown, Error>>((acc, fn) => {
        if (acc.isErr()) {
            return acc;
        }
        return fn(acc.unwrap());
    }, new Result(value, null));
};
