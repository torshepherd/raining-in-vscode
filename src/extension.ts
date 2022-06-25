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
        color: vscConfig.get("raindrop.color", "#FFFFFF"),
        count: asNotNaN(parseInt(vscConfig.raindrop.count), 150),
        speed: {
          min: asNotNaN(parseFloat(vscConfig.raindrop.minSpeed), 1700),
          max: asNotNaN(parseFloat(vscConfig.raindrop.maxSpeed), 3500),
        },
        delay: {
          min: asNotNaN(parseFloat(vscConfig.raindrop.minDelay), 0.0),
          max: asNotNaN(parseFloat(vscConfig.raindrop.maxDelay), 3.0),
        },
        angle: {
          min: asNotNaN(parseFloat(vscConfig.raindrop.minAngle), 4.0),
          max: asNotNaN(parseFloat(vscConfig.raindrop.maxAngle), 10.0),
        },
        size: {
          min: asNotNaN(parseInt(vscConfig.raindrop.minSize), 1),
          max: asNotNaN(parseInt(vscConfig.raindrop.maxSize), 3),
        },
        opacity: {
          min: asNotNaN(parseFloat(vscConfig.raindrop.minOpacity), 0.4),
          max: asNotNaN(parseFloat(vscConfig.raindrop.maxOpacity), 1.0),
        },
        length: {
          min: asNotNaN(parseInt(vscConfig.raindrop.minLength), 80),
          max: asNotNaN(parseInt(vscConfig.raindrop.maxLength), 300),
        },
        fallHeight: {
          min: asNotNaN(parseInt(vscConfig.raindrop.minFallHeight), 1800),
          max: asNotNaN(parseInt(vscConfig.raindrop.maxFallHeight), 2160),
        },
        windowWidth: asNotNaN(parseInt(vscConfig.window.width), 3840),
      };
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

      const isWin = /^win/.test(process.platform);
      // @ts-ignore
      const appDir = path.dirname(require.main.filename);
      const base = appDir + (isWin ? "\\vs\\code" : "/vs/code");
      const htmlFile =
        base +
        (isWin
          ? "\\electron-browser\\workbench\\workbench.html"
          : "/electron-browser/workbench/workbench.html");
      // const svgFile =
      //   base +
      //   (isWin
      //     ? "\\electron-browser\\workbench\\rain.svg"
      //     : "/electron-browser/workbench/rain.svg");

      try {
        // modify workbench html
        const html = readFileSync(htmlFile, "utf-8");
        // check if the tag is already there
        const isEnabled0 = html.includes("downpour_0.js");
        const isEnabled1 = html.includes("downpour_1.js");
        const isEnabled = isEnabled0 || isEnabled1;
        console.log(`0 is ${isEnabled0}, 1 is ${isEnabled1}`);
        const nextIdx = isEnabled0 ? 1 : 0;
        console.log(`next idx is ${nextIdx}`);
        const templateFile =
          base +
          (isWin
            ? `\\electron-browser\\workbench\\downpour_${nextIdx}.js`
            : `/electron-browser/workbench/downpour_${nextIdx}.js`);
        const jsTemplate = readFileSync(
          __dirname + "/js/downpour_template.js",
          "utf-8"
        );
        const jsWithSvg = jsTemplate
          .replace("SVGURIGOESHERE", rainBackgroundDataURI)
          .replace("OPACITYGOESHERE", fgOpacity.toString());
        writeFileSync(templateFile, jsWithSvg, "utf-8"); // previously jsTemplate
        // writeFileSync(svgFile, optimizedRainBackground, "utf-8");
        // delete synthwave script tag if there
        let output = html.replace(
          /^.*(<!-- RAINING IN --><script src="downpour_[0|1].js"><\/script><!-- TORRENTIAL DOWNPOUR -->).*\n?/gm,
          ""
        );
        // add script tag
        output = output.replace(
          /\<\/html\>/g,
          `	<!-- RAINING IN --><script src="downpour_${nextIdx}.js"></script><!-- TORRENTIAL DOWNPOUR -->\n`
        );
        output += "</html>";
        writeFileSync(htmlFile, output, "utf-8");
        if (autoreload) {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        } else if (!isEnabled) {
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
    () => {
      const autoreload = vscConfig.get("autoreload", false);
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
      const isEnabled0 = html.includes("downpour_0.js");
      const isEnabled1 = html.includes("downpour_1.js");
      const isEnabled = isEnabled0 || isEnabled1;

      if (isEnabled) {
        // delete raining in script tag if there
        let output = html.replace(
          /^.*(<!-- RAINING IN --><script src="downpour_[0|1].js"><\/script><!-- TORRENTIAL DOWNPOUR -->).*\n?/gm,
          ""
        );
        writeFileSync(htmlFile, output, "utf-8");

        if (autoreload) {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        } else {
          vscode.window
            .showInformationMessage(
              "Downpour disabled. VS code must reload for this change to take effect",
              { title: "Restart editor to complete" }
            )
            .then(function (msg) {
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            });
        }
      } else {
        vscode.window.showInformationMessage("Downpour isn't running.");
      }
    }
  );

  context.subscriptions.push(enable);
  context.subscriptions.push(disable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
