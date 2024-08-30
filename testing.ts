// import { Result } from "./app/lib/util/result";

enum ResultKind {
    OK = "Ok",
    ERR = "Err",
}

export type Result<T, E> = Ok<T> | Err<E>;

interface ResultBase<A, E> {
    kind: ResultKind;
    map<B>(fn: (_: A) => B): Result<B, E>;
    bind<B>(fn: (_: A) => Result<B, E>): Result<B, E>;
    match<B>(obj: { ok: (_: A) => B; err: (_: E) => B }): B;
}

export type Ok<A> = Readonly<
    ResultBase<A, any> & { kind: ResultKind.OK; value: A }
>;

export function ok<A>(a: A): Ok<A> {
    return {
        kind: ResultKind.OK,
        value: a,
        map(fn) {
            return ok(fn(this.value));
        },
        bind(fn) {
            return fn(this.value);
        },
        match({ ok }) {
            return ok(this.value);
        },
    };
}

export type Err<E> = Readonly<
    ResultBase<any, E> & { kind: ResultKind.ERR; error: E }
>;

export function err<E>(e: E): Err<E> {
    return {
        kind: ResultKind.ERR,
        error: e,
        map() {
            return this;
        },
        bind() {
            return this;
        },
        match({ err }) {
            return err(this.error);
        },
    };
}

function len(input: any): Result<number, string> {
    if (typeof input !== "string") {
        return err("Input must be a String!");
    } else {
        return ok(input.length);
    }
}

function double(input: any): Result<number, string> {
    if (typeof input !== "number") {
        return err("Input must be a Number!");
    } else {
        return ok(input * 2);
    }
}

function triple(input: any): Result<number, string> {
    if (typeof input !== "number") {
        return err("Input must be a Number!");
    } else {
        return ok(input * 3);
    }
}

function square(input: any): Result<number, string> {
    if (typeof input !== "number") {
        return err("Input must be a Number!");
    } else {
        return ok(input * input);
    }
}

function cube(input: any): Result<number, string> {
    if (typeof input !== "number") {
        return err("Input must be a Number!");
    } else {
        return ok(input * input * input);
    }
}

// const resultSuccess = len("10") // Valid input
//     .bind(square)
//     .bind(cube)
//     .bind(double)
//     .bind(triple);

// resultSuccess.isErr() // OUTPUT: 384
//     ? console.log(resultSuccess.getErr())
//     : console.log(resultSuccess.unwrap());

// const resultError = len(10) // Invalid input
//     .bind(square)
//     .bind(cube)
//     .bind(double)
//     .bind(triple)
//     .bind(double);

// resultError.isErr() // OUTPUT: "Input must be a String!"
//     ? console.log(resultError.getErr())
//     : console.log(resultError.unwrap());

len(10)
    .bind(square)
    .bind(cube)
    .bind(double)
    .bind(triple)
    .match({
        ok: (value) => console.log(`Result: ${value}`),
        err: (error) => console.log(`Error: ${error}`),
    });

len("10")
    .bind(square)
    .bind(cube)
    .bind(double)
    .bind(triple)
    .match({
        ok: (value) => console.log(`Result: ${value}`),
        err: (error) => console.log(`Error: ${error}`),
    });
