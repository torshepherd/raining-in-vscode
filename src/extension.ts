import { readFileSync, writeFileSync } from "fs";
import path = require("path");
import * as vscode from "vscode";
import svgToMiniDataURI = require("mini-svg-data-uri");
import { generateRainBackground, RainConfig } from "./generateRain";

// @ts-ignore
import { optimize } from "svgo";

function asNotNaN(value: number, backup: number = 0): number {
  return isNaN(value) ? backup : value;
}

export function activate(context: vscode.ExtensionContext) {
  const vscConfig = vscode.workspace.getConfiguration("rainingin");

  console.log("RAINING IN V S C O D E is now active.");

  let enable = vscode.commands.registerCommand(
    "rainingin.enableDownpour",
    () => {
      const config: RainConfig = {
        color: vscConfig.get("raindropColor", "#FFFFFF"),
        count: asNotNaN(parseInt(vscConfig.raindropCount), 150),
        speed: {
          min: asNotNaN(parseFloat(vscConfig.raindropMinSpeed), 1700),
          max: asNotNaN(parseFloat(vscConfig.raindropMaxSpeed), 3500),
        },
        delay: {
          min: asNotNaN(parseFloat(vscConfig.raindropMinDelay), 0.0),
          max: asNotNaN(parseFloat(vscConfig.raindropMaxDelay), 10.0),
        },
        angle: {
          min: asNotNaN(parseFloat(vscConfig.raindropMinAngle), 2.0),
          max: asNotNaN(parseFloat(vscConfig.raindropMaxAngle), 12.0),
        },
        size: {
          min: asNotNaN(parseInt(vscConfig.raindropMinSize), 1),
          max: asNotNaN(parseInt(vscConfig.raindropMaxSize), 3),
        },
        opacity: {
          min: asNotNaN(parseFloat(vscConfig.raindropMinOpacity), 0.4),
          max: asNotNaN(parseFloat(vscConfig.raindropMaxOpacity), 1.0),
        },
        length: {
          min: asNotNaN(parseInt(vscConfig.raindropMinLength), 80),
          max: asNotNaN(parseInt(vscConfig.raindropMaxLength), 300),
        },
        fallHeight: {
          min: asNotNaN(parseInt(vscConfig.raindropMinFallHeight), 1800),
          max: asNotNaN(parseInt(vscConfig.raindropMaxFallHeight), 2160),
        },
        windowWidth: asNotNaN(parseInt(vscConfig.windowWidth), 3840),
      };
      const fgOpacity = asNotNaN(parseFloat(vscConfig.foregroundOpacity), 0.95);
      const rainbackground = generateRainBackground(config);
      const result = optimize(rainbackground, {
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                convertShapeToPath: false,
              },
            },
          },
        ],
        multipass: true,
      });
      const optimizedRainBackground = result.data;
      const rainBackgroundDataURI = svgToMiniDataURI(optimizedRainBackground);
      // console.log("[RAINING IN V S C O D E]: Generated background");

      const isWin = /^win/.test(process.platform);
      // @ts-ignore
      const appDir = path.dirname(require.main.filename);
      const base = appDir + (isWin ? "\\vs\\code" : "/vs/code");
      const htmlFile =
        base +
        (isWin
          ? "\\electron-browser\\workbench\\workbench.html"
          : "/electron-browser/workbench/workbench.html");
      const templateFile =
        base +
        (isWin
          ? "\\electron-browser\\workbench\\downpour.js"
          : "/electron-browser/workbench/downpour.js");
      const svgFile =
        base +
        (isWin
          ? "\\electron-browser\\workbench\\rain.svg"
          : "/electron-browser/workbench/rain.svg");

      try {
        const jsTemplate = readFileSync(
          __dirname + "/js/downpour_template.js",
          "utf-8"
        );
        const jsWithSvg = jsTemplate
          .replace("SVGURIGOESHERE", rainBackgroundDataURI)
          .replace("OPACITYGOESHERE", fgOpacity.toString());
        writeFileSync(templateFile, jsWithSvg, "utf-8"); // previously jsTemplate
        // writeFileSync(svgFile, optimizedRainBackground, "utf-8");
        // modify workbench html
        const html = readFileSync(htmlFile, "utf-8");
        // check if the tag is already there
        const isEnabled = html.includes("downpour.js");
        if (!isEnabled) {
          // delete synthwave script tag if there
          let output = html.replace(
            /^.*(<!-- RAINING IN --><script src="downpour.js"><\/script><!-- TORRENTIAL DOWNPOUR -->).*\n?/gm,
            ""
          );
          // add script tag
          output = html.replace(
            /\<\/html\>/g,
            `	<!-- RAINING IN --><script src="downpour.js"></script><!-- TORRENTIAL DOWNPOUR -->\n`
          );
          output += "</html>";
          writeFileSync(htmlFile, output, "utf-8");
          vscode.window
            .showInformationMessage(
              "Downpour enabled. VS code must reload for this change to take effect. Code may display a warning that it is corrupted, this is normal. You can dismiss this message by choosing 'Don't show this again' on the notification.",
              { title: "Restart editor to complete" }
            )
            .then(function (msg) {
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            });
        } else {
          vscode.window
            .showInformationMessage(
              "Downpour is already enabled. Reload to refresh JS settings.",
              { title: "Restart editor to refresh settings" }
            )
            .then(function (msg) {
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            });
        }
      } catch (e: any) {
        if (/ENOENT|EACCES|EPERM/.test(e.code)) {
          vscode.window.showInformationMessage(
            "You must run VS code with admin privileges in order to enable Downpour."
          );
          return;
        } else {
          vscode.window.showErrorMessage(
            "Something went wrong when starting downpour."
          );
          return;
        }
      }
    }
  );

  let disable = vscode.commands.registerCommand(
    "rainingin.disableDownpour",
    uninstall
  );

  context.subscriptions.push(enable);
  context.subscriptions.push(disable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function uninstall() {
  var isWin = /^win/.test(process.platform);
  // @ts-ignore
  var appDir = path.dirname(require.main.filename);
  var base = appDir + (isWin ? "\\vs\\code" : "/vs/code");
  var htmlFile =
    base +
    (isWin
      ? "\\electron-browser\\workbench\\workbench.html"
      : "/electron-browser/workbench/workbench.html");

  // modify workbench html
  const html = readFileSync(htmlFile, "utf-8");

  // check if the tag is already there
  const isEnabled = html.includes("downpour.js");

  if (isEnabled) {
    // delete raining in script tag if there
    let output = html.replace(
      /^.*(<!-- RAINING IN --><script src="downpour.js"><\/script><!-- TORRENTIAL DOWNPOUR -->).*\n?/gm,
      ""
    );
    writeFileSync(htmlFile, output, "utf-8");

    vscode.window
      .showInformationMessage(
        "Downpour disabled. VS code must reload for this change to take effect",
        { title: "Restart editor to complete" }
      )
      .then(function (msg) {
        vscode.commands.executeCommand("workbench.action.reloadWindow");
      });
  } else {
    vscode.window.showInformationMessage("Downpour isn't running.");
  }
}
