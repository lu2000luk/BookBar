import ts from "typescript";
import { minify } from "terser";
import path from "path";

const inputFileName = 'bookmark.ts';
const inputFilePath = path.resolve(inputFileName);

const appFileName = "app.jsx";
const appFilePath = path.resolve(appFileName);
const scriptFileName = "script.js";
const scriptFilePath = path.resolve(scriptFileName);
const cssFileName = "app.css";
const cssFilePath = path.resolve(cssFileName);

async function processFile() {
    console.log(`Starting compilation process...`);

    try {
        // 1. Read and Transpile App JSX
        console.log(`Reading app file: ${appFilePath}`);
        const appFile = Bun.file(appFilePath);
        if (!(await appFile.exists())) throw new Error(`App file not found: ${appFilePath}`);
        const appSourceCode = await appFile.text();
        console.log("✅ App file read.");

        console.log("⏳ Transpiling App JSX...");
        const appCompileResult = ts.transpileModule(appSourceCode, {
            compilerOptions: {
                module: ts.ModuleKind.ESNext,
                target: ts.ScriptTarget.ESNext,
                lib: ["ESNext", "DOM"],
                jsx: ts.JsxEmit.ReactJSX, // Transpile JSX
                jsxImportSource: "https://esm.sh/react@19.1.0", // Specify where to import JSX runtime from
            },
            fileName: appFilePath,
            reportDiagnostics: true,
        });

        if (appCompileResult.diagnostics && appCompileResult.diagnostics.length > 0) {
            console.error("❌ App JSX Transpilation Errors:");
            console.error(ts.formatDiagnosticsWithColorAndContext(appCompileResult.diagnostics, {
                getCanonicalFileName: (fileName) => fileName,
                getCurrentDirectory: ts.sys.getCurrentDirectory,
                getNewLine: () => ts.sys.newLine,
            }));
            process.exit(1);
        }
        console.log("✅ App JSX transpiled.");
        const compiledAppJs = appCompileResult.outputText;

        // 2. Minify Compiled App JS
        console.log("⏳ Minifying App JS...");
        const minifiedAppResult = await minify(compiledAppJs, { compress: true, mangle: true });
        if (!minifiedAppResult.code) throw new Error("App minification resulted in empty code.");
        console.log("✅ App JS minified.");

        // 3. Read script.js and Inject Minified App Code and Inject CSS
        console.log(`Reading script file: ${scriptFilePath}`);
        const scriptFile = Bun.file(scriptFilePath);
        if (!(await scriptFile.exists())) throw new Error(`Script file not found: ${scriptFilePath}`);
        let scriptContent = await scriptFile.text();
        console.log("✅ Script file read.");

        const base64AppCode = btoa(minifiedAppResult.code);
        scriptContent = scriptContent.replace("___APP___", base64AppCode);
        console.log("✅ App code injected into script.");

        const cssFile = Bun.file(cssFilePath);
        if (await cssFile.exists()) {
            const cssContent = await cssFile.text();
            const base64CssCode = btoa(cssContent);
            scriptContent = scriptContent.replace("___CSS___", base64CssCode);
            console.log("✅ CSS code injected into script.");
        } else {
            console.warn(`⚠️ CSS file not found: ${cssFilePath}. Skipping CSS injection.`);
        }

        // 4. Minify Script JS (with injected app code)
        console.log("⏳ Minifying Script JS...");
        const minifiedScriptResult = await minify(scriptContent, { compress: true, mangle: true });
        if (!minifiedScriptResult.code) throw new Error("Script minification resulted in empty code.");
        console.log("✅ Script JS minified.");

        // 5. Read bookmark.ts and Inject Minified Script Code
        console.log(`Reading bookmark file: ${inputFilePath}`);
        const bookmarkFile = Bun.file(inputFilePath);
        if (!(await bookmarkFile.exists())) throw new Error(`Bookmark file not found: ${inputFilePath}`);
        let bookmarkSourceCode = await bookmarkFile.text();
        console.log("✅ Bookmark file read.");

        const base64ScriptCode = btoa(minifiedScriptResult.code);
        bookmarkSourceCode = bookmarkSourceCode.replace("___SCRIPT___", base64ScriptCode);
        console.log("✅ Script code injected into bookmark.");

        // 6. Transpile Bookmark TS
        console.log("⏳ Transpiling Bookmark TS...");
        const bookmarkCompileResult = ts.transpileModule(bookmarkSourceCode, {
            compilerOptions: {
                module: ts.ModuleKind.ESNext,
                target: ts.ScriptTarget.ESNext,
                lib: ["ESNext", "DOM"],
            },
            fileName: inputFilePath, // Use original path for potential diagnostics
            reportDiagnostics: true,
        });

        if (bookmarkCompileResult.diagnostics && bookmarkCompileResult.diagnostics.length > 0) {
            console.error("❌ Bookmark TS Transpilation Errors:");
            console.error(ts.formatDiagnosticsWithColorAndContext(bookmarkCompileResult.diagnostics, {
                getCanonicalFileName: (fileName) => fileName,
                getCurrentDirectory: ts.sys.getCurrentDirectory,
                getNewLine: () => ts.sys.newLine,
            }));
            process.exit(1);
        }
        console.log("✅ Bookmark TS transpiled.");
        const compiledBookmarkJs = bookmarkCompileResult.outputText;

        // 7. Minify Final Bookmark JS
        console.log("⏳ Minifying Final Bookmark JS...");
        const finalMinifyResult = await minify(compiledBookmarkJs, {
            sourceMap: false,
            compress: true,
            mangle: true,
            format: { comments: false }
        });

        if (finalMinifyResult.code) {
            console.log("\n✅ Done! Bookmark compiled and minified successfully.\n");
            console.log("javascript:(() => {" + finalMinifyResult.code + "})()");
        } else {
            console.warn("⚠️ Minification completed but resulted in empty code.");
        }
    } catch (error: any) {
        console.error("\n❌ An unexpected error occurred during the process:");
        if (error instanceof Error) {
            console.error(`Error Type: ${error.name}`);
            console.error(`Message: ${error.message}`);
            if (error.stack) {
                console.error(`Stack Trace:\n${error.stack}`);
            }
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

processFile();
