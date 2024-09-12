import { spawn } from "child_process";
import { FgGreen, FgWhite } from "../colors";

export function runScript(command: string, args: any[], callback: Function) {
    console.log("Running", FgGreen, command, args.join(" "), FgWhite);
    var child = spawn(command, args);

    var scriptOutput = "";

    child.stdout.setEncoding("utf8");
    // child.stdout.on("data", function (data) {
    //     console.log(data);

    //     data = data.toString();
    //     scriptOutput += data;
    // });

    child.stdout.on("data", console.log);

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", function (data) {
        console.log("stderr: " + data);

        data = data.toString();
        scriptOutput += data;
    });

    child.on("close", function (code) {
        callback(scriptOutput, code);
    });
}
