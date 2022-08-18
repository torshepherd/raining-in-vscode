import { readFileSync, writeFileSync, existsSync } from "fs";
import path = require("path");
import * as vscode from "vscode";
import svgToMiniDataURI = require("mini-svg-data-uri");
import { generateRainBackground, RainConfig } from "./generateRain";
import {
  asNotNaN,
  deleteScriptTag,
  writeScriptTag,
  handleErrors,
  getHTMLContent,
  importRainConfig,
} from "./utils";
// @ts-ignore
import { optimize } from "svgo";

const isWin = /^win/.test(process.platform);
// @ts-ignore
const appDir = path.dirname(require.main.filename);
const base = appDir + (isWin ? "\\vs\\code" : "/vs/code");
function workbenchPath(filename: string): string {
  return (
    base +
    (isWin
      ? `\\electron-sandbox\\workbench\\${filename}`
      : `/electron-sandbox/workbench/${filename}`)
  );
}
const normalHtmlFile = workbenchPath("workbench.html");
const monkeyPatchFile = workbenchPath("workbench-monkey-patch.html");

function getHTMLPath(): string {
  if (existsSync(monkeyPatchFile)) {
    console.log(
      "RAINING IN V S C O D E: Using workbench-monkey-patch.html instead of workbench.html"
    );
    return monkeyPatchFile;
  }
  return normalHtmlFile;
}

export function activate(context: vscode.ExtensionContext) {
  function rainPopup(
    message: string,
    vscConfig: vscode.WorkspaceConfiguration
  ): void {
    const alwaysStr = "Always restart";
    vscode.window
      .showInformationMessage(
        message,
        { title: "Restart editor" },
        { title: alwaysStr },
        { title: "Later" }
      )
      .then(function (msg) {
        if (msg && msg.title === alwaysStr) {
          vscConfig.update("autoreload", true, true);
          vscode.window.showInformationMessage(
            "rainingin.autoreload set to true in config."
          );
        }
        if (msg && msg.title !== "Later") {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      });
  }

  console.log("RAINING IN V S C O D E extension is now active.");

  const rainStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );

  rainStatusBarItem.text = "$(rainingin-rain)";
  rainStatusBarItem.tooltip = "Toggle Downpour";
  rainStatusBarItem.command = "rainingin.toggleDownpour";
  rainStatusBarItem.show();
  context.subscriptions.push(rainStatusBarItem);

  let enable = vscode.commands.registerCommand(
    "rainingin.enableDownpour",
    () => {
      const vscConfig = vscode.workspace.getConfiguration("rainingin");
      const config = importRainConfig(vscConfig);
      const fgOpacity = asNotNaN(parseFloat(vscConfig.foregroundOpacity), 0.95);
      const autoreload = vscConfig.get("autoreload", false);
      const rainbackground = generateRainBackground(config);
      const result = optimize(rainbackground, {
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                convertShapeToPath: false,
                cleanupIDs: false,
              },
            },
          },
        ],
        multipass: true,
      });
      const optimizedRainBackground = result.data;
      const rainBackgroundDataURI = svgToMiniDataURI(optimizedRainBackground);
      // const svgFile =
      //   base +
      //   (isWin
      //     ? "\\electron-sandbox\\workbench\\rain.svg"
      //     : "/electron-sandbox/workbench/rain.svg");

      try {
        const htmlFile = getHTMLPath();

        // modify workbench html
        const html = getHTMLContent(htmlFile);
        // check if the tag is already there
        const nextIdx = html.content.includes("downpour_0.js") ? 1 : 0;
        const templateFile =
          base +
          (isWin
            ? `\\electron-sandbox\\workbench\\downpour_${nextIdx}.js`
            : `/electron-sandbox/workbench/downpour_${nextIdx}.js`);
        const jsTemplate = readFileSync(
          __dirname + "/js/downpour_template.js",
          "utf-8"
        );
        const jsWithSvg = jsTemplate
          .replace("SVGURIGOESHERE", rainBackgroundDataURI)
          .replace("OPACITYGOESHERE", fgOpacity.toString());
        writeFileSync(templateFile, jsWithSvg, "utf-8");
        // writeFileSync(svgFile, optimizedRainBackground, "utf-8");

        let output = deleteScriptTag(html.content);
        output = writeScriptTag(output, nextIdx);
        writeFileSync(htmlFile, output, "utf-8");

        if (autoreload) {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        } else if (!html.isEnabled) {
          rainPopup(
            "Downpour enabled. VS code must reload for this change to take effect. Code may display a warning that it is corrupted, this is normal. You can dismiss this message by choosing 'Don't show this again' on the notification.",
            vscConfig
          );
        } else {
          rainPopup(
            "Downpour is already enabled. Reload to refresh JS settings.",
            vscConfig
          );
        }
      } catch (e: any) {
        handleErrors(e);
      }
    }
  );

  let disable = vscode.commands.registerCommand(
    "rainingin.disableDownpour",
    () => {
      try {
        let disabledAny = false;
        const vscConfig = vscode.workspace.getConfiguration("rainingin");
        const autoreload = vscConfig.get("autoreload", false);
        for (const htmlFile of [normalHtmlFile, monkeyPatchFile]) {
          if (existsSync(htmlFile)) {
            const html = getHTMLContent(htmlFile);
            if (html.isEnabled) {
              // delete raining in script tag if there
              let output = deleteScriptTag(html.content);
              writeFileSync(htmlFile, output, "utf-8");

              disabledAny = true;
            }
          }
        }

        if (disabledAny) {
          if (autoreload) {
            vscode.commands.executeCommand("workbench.action.reloadWindow");
          } else {
            rainPopup(
              "Downpour disabled. VS code must reload for this change to take effect",
              vscConfig
            );
          }
        } else {
          vscode.window.showInformationMessage("Downpour isn't running.");
        }
      } catch (e: any) {
        handleErrors(e);
      }
    }
  );

  let toggle = vscode.commands.registerCommand(
    "rainingin.toggleDownpour",
    () => {
      try {
        const htmlFile = getHTMLPath();
        const html = getHTMLContent(htmlFile);

        if (html.isEnabled) {
          vscode.commands.executeCommand("rainingin.disableDownpour");
        } else {
          vscode.commands.executeCommand("rainingin.enableDownpour");
        }
      } catch (e: any) {
        handleErrors(e);
      }
    }
  );

  context.subscriptions.push(enable);
  context.subscriptions.push(disable);
  context.subscriptions.push(toggle);
}

// this method is called when your extension is deactivated
export function deactivate() {}
