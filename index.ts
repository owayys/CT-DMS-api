import { Command } from "commander";
import { runScript } from "./app/lib/util/run-script";
const program = new Command("DMS-api");
program
    .version("1.0.0")
    .description("Headless Document Management System API")
    .option("-M, --mode <value>", "D for dev mode, P for prod mode")
    .parse(process.argv);

const options = program.opts();

// if (options.dev) {
//     runScript("npm", ["run", "dev"], function (output: String, exit_code: any) {
//         console.log("Process Finished.");
//         console.log("closing code: " + exit_code);
//         console.log("Full output of script: ", output);
//     });
// } else if (options.prod) {
//     runScript(
//         "npm",
//         ["run", "start"],
//         function (output: String, exit_code: any) {
//             console.log("Process Finished.");
//             console.log("closing code: " + exit_code);
//             console.log("Full output of script: ", output);
//         }
//     );
// }

if (options.mode) {
    const mode = options.mode;

    if (mode) {
        if (mode === "D") {
            runScript(
                "npm",
                ["run", "dev"],
                function (output: String, exit_code: any) {
                    console.log("Process Finished.");
                    console.log("closing code: " + exit_code);
                    console.log("Full output of script: ", output);
                }
            );
        } else if (mode === "P") {
            runScript(
                "npm",
                ["run", "dev"],
                function (output: String, exit_code: any) {
                    console.log("Process Finished.");
                    console.log("closing code: " + exit_code);
                    console.log("Full output of script: ", output);
                }
            );
        } else {
            console.log("error: invalid value for mode", `'${mode}'`);
        }
    }
}
