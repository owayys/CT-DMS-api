// import { pipe } from "./app/lib/util/pipe";
// import { failure, Result, success } from "./app/lib/util/result";

import { pipe } from "./app/lib/util/pipe";
import { Result } from "./app/lib/util/result";

// function len(input: any): Result<number, string> {
//     if (typeof input !== "string") {
//         return failure("Input must be a String!");
//     } else {
//         return success(input.length);
//     }
// }

// function double(input: any): Result<number, string> {
//     if (typeof input !== "number") {
//         return failure("Input must be a Number!");
//     } else {
//         return success(input * 2);
//     }
// }

// function triple(input: any): Result<number, string> {
//     if (typeof input !== "number") {
//         return failure("Input must be a Number!");
//     } else {
//         return success(input * 3);
//     }
// }

// function square(input: any): Result<number, string> {
//     if (typeof input !== "number") {
//         return failure("Input must be a Number!");
//     } else {
//         return success(input * input);
//     }
// }

// function cube(input: any): Result<number, string> {
//     if (typeof input !== "number") {
//         return failure("Input must be a Number!");
//     } else {
//         return success(input * input * input);
//     }
// }

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

// len(10)
//     .bind(square)
//     .bind(cube)
//     .bind(double)
//     .bind(triple)
//     .match({
//         success: (value) => console.log(`Result: ${value}`),
//         failure: (error) => console.log(`Error: ${error}`),
//     });

// len("10")
//     .bind(square)
//     .bind(cube)
//     .bind(double)
//     .bind(triple)
//     .match({
//         success: (value) => console.log(`Result: ${value}`),
//         failure: (error) => console.log(`Error: ${error}`),
//     });

function len(input: any): Result<number, Error> {
    if (typeof input !== "string") {
        return new Result<number, Error>(
            null,
            new Error("Input must be a String!")
        );
    } else {
        return new Result<number, Error>(input.length, null);
    }
}

function double(input: any): Result<number, Error> {
    if (typeof input !== "number") {
        return new Result<number, Error>(
            null,
            new Error("Input must be a Number!")
        );
    } else {
        return new Result<number, Error>(input * 2, null);
    }
}

function triple(input: any): Result<number, Error> {
    if (typeof input !== "number") {
        return new Result<number, Error>(
            null,
            new Error("Input must be a Number!")
        );
    } else {
        return new Result<number, Error>(input * 3, null);
    }
}

function square(input: any): Result<number, Error> {
    if (typeof input !== "number") {
        return new Result<number, Error>(
            null,
            new Error("Input must be a Number!")
        );
    } else {
        return new Result<number, Error>(input * input, null);
    }
}

function cube(input: any): Result<number, Error> {
    if (typeof input !== "number") {
        return new Result<number, Error>(
            null,
            new Error("Input must be a Number!")
        );
    } else {
        return new Result<number, Error>(input * input * input, null);
    }
}

// console.log(pipe(12, len, square, cube, double, triple, double).getErr());

// console.log(pipe("12", len, square, cube, double, triple, double).unwrap());

function timer(fn: Function, ...args: any[]) {
    const startTime = performance.now();
    fn(args);
    const endTime = performance.now();
    console.log(
        `Function ${fn.name} took ${endTime - startTime} seconds to execute`
    );
}

timer(pipe, [12, len, square, cube, double, triple, double]);
timer(pipe, ["12", len, square, cube, double, triple, double]);
