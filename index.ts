import "dotenv/config";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

import { Command } from "commander";
import { runScript } from "./app/lib/util/run-script";
import { cp } from "fs/promises";
import { Storage } from "@google-cloud/storage";

const program = new Command("DMS-api");

program
    .version("1.0.0")
    .description("Headless Document Management System API")
    .option("-M, --mode <value>", "D for dev mode, P for prod mode")
    .option("-D, --download <path>", "Provide path for download")
    .parse(process.argv);

const options = program.opts();

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
} else if (options.download) {
    const download = options.download;

    if (download) {
        const downloadPath = path.join(__dirname, download);
        console.log("Downloading files...");
        await cp("./app/uploads", downloadPath, {
            recursive: true,
            filter(source, _) {
                return !source.includes(".gitignore");
            },
        });

        const bucket = new Storage({
            projectId: "ct-dms",
            keyFilename: process.env.GCLOUD_KEYFILE,
        }).bucket(process.env.GCLOUD_BUCKET!);

        const [files] = await bucket.getFiles();

        for (const file of files) {
            let destFileName = path.join(downloadPath, file.name);
            await file.download({ destination: destFileName });
        }
        console.log("Downloaded!");
    } else {
        console.log("error: invalid value for download path", `'${download}'`);
    }
}
