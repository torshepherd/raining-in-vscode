// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { readFileSync, writeFileSync } from "fs";
import path = require("path");
import * as vscode from "vscode";
import { registerWindow, Svg, SVG } from "@svgdotjs/svg.js";
// @ts-ignore
import { createSVGWindow } from "svgdom";
const window = createSVGWindow();
const document = window.document;

function asNotNaN(value: number, backup: number = 0): number {
  return isNaN(value) ? backup : value;
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const vscConfig = vscode.workspace.getConfiguration("rainingin");

  const config: RainConfig = {
    count: asNotNaN(parseInt(vscConfig.raindropCount), 10),
    speed: {
      min: asNotNaN(parseFloat(vscConfig.raindropMinSpeed), 0.1),
      max: asNotNaN(parseFloat(vscConfig.raindropMaxSpeed), 1.0),
    },
    delay: {
      min: asNotNaN(parseFloat(vscConfig.raindropMinDelay), 0.0),
      max: asNotNaN(parseFloat(vscConfig.raindropMaxDelay), 1.0),
    },
    duration: {
      min: asNotNaN(parseFloat(vscConfig.raindropMinDuration), 0.0),
      max: asNotNaN(parseFloat(vscConfig.raindropMaxDuration), 1.0),
    },
    angle: {
      min: asNotNaN(parseFloat(vscConfig.raindropMinAngle), 5.0),
      max: asNotNaN(parseFloat(vscConfig.raindropMaxAngle), 5.0),
    },
    size: {
      min: asNotNaN(parseInt(vscConfig.raindropMinSize), 1),
      max: asNotNaN(parseInt(vscConfig.raindropMaxSize), 5),
    },
    opacity: {
      min: asNotNaN(parseFloat(vscConfig.raindropMinOpacity), 0.2),
      max: asNotNaN(parseFloat(vscConfig.raindropMaxOpacity), 0.8),
    },
    length: {
      min: asNotNaN(parseInt(vscConfig.raindropMinLength), 10),
      max: asNotNaN(parseInt(vscConfig.raindropMaxLength), 200),
    },
    fallHeight: {
      min: asNotNaN(parseInt(vscConfig.raindropMinFallHeight), 800),
      max: asNotNaN(parseInt(vscConfig.raindropMaxFallHeight), 900),
    },
  };

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log("RAINING IN V S C O D E is now active.");
  // const rainbackground = generateRainBackground(config);
  // writeFileSync("C:\\Users\\Tor\\Desktop\\Projects\\raining-in\\test_rain.svg", rainbackground.toString(), "utf-8");

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let enable = vscode.commands.registerCommand(
    "rainingin.enableDownpour",
    () => {
      const rainbackground = generateRainBackground(config);
      writeFileSync("C\\Users\\Tor\\Desktop\\Projects\\raining-in\\test_rain.svg", rainbackground.toString(), "utf-8");
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
        // const version = context.globalState.get(`${context.extensionName}.version`);
        // generate production theme JS
        const chromeStyles = readFileSync(
          __dirname + "/css/editor_chrome.css",
          "utf-8"
        );
        const jsTemplate = readFileSync(
          __dirname + "/js/theme_template.js",
          "utf-8"
        );
        writeFileSync(templateFile, jsTemplate, "utf-8");
        writeFileSync(svgFile, rainbackground.toString(), "utf-8");
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

type RainConfig = {
  count: number;
  speed: MinMax;
  delay: MinMax;
  duration: MinMax;
  angle: MinMax;
  size: MinMax;
  opacity: MinMax;
  length: MinMax;
  fallHeight: MinMax;
};

type MinMax = {
  min: number;
  max: number;
};

function sample(param: MinMax): number {
  return Math.random() * (param.max - param.min) + param.min;
}

function generateRainBackground(config: RainConfig) {
  // register window and document
  registerWindow(window, document);

  let scene = SVG(document.documentElement);

  if (scene instanceof Svg) {
    // scene.size("10000", "10000"); // TODO: just for testing
    for (let i = 0; i < config.count; i++) {
      const length = sample(config.length);
      const angle = sample(config.angle);
      const opacity = sample(config.opacity);
      const duration = sample(config.duration);
      const delay = sample(config.delay);
      const width = sample(config.size);
      const fallHeight = sample(config.fallHeight);
      const head = {
        x: sample({ min: 0, max: 3440 }),
        y: 0,
      };
      const tail = {
        x: head.x - length * Math.sin(angle * (Math.PI / 180)),
        y: head.y - length * Math.cos(angle * (Math.PI / 180)),
      };
      const travel = {
        x: fallHeight * Math.tan(angle * (Math.PI / 180)),
        y: fallHeight,
      };

      const group = scene.group();

      const grad = scene.gradient("linear", function (add) {
        add.stop(0, `rgba(255,255,255,0.0)`);
        add.stop(1, `rgba(255,255,255,${opacity})`);
        // add.stop(0, `rgba(255,0,0,1.0)`);
        // add.stop(1, `rgba(0,0,255,1.0)`);
      });
      const stem = scene
        .line(tail.x, tail.y, head.x, head.y)
        .stroke({ color: grad.url(), width: width });

      group.add(grad);
      group.add(stem);

      // const anim0 = animationFragment({
      //   attrName: "x1",
      //   from: tail.x,
      //   to: end.x,
      //   duration: sample(config.duration),
      //   delay: sample(config.delay),
      // });
      // console.log(anim0);
      // [grad, stem].forEach((shape) => {
      stem.add(
        SVG(
          `<animate attributeName="x1" from="${tail.x}" to="${
            tail.x + travel.x
          }" dur="${duration}s" repeatCount="indefinite" begin="${delay}s"></animate>`
        )
      );
      stem.add(
        SVG(
          `<animate attributeName="x2" from="${head.x}" to="${
            head.x + travel.x
          }" dur="${duration}s" repeatCount="indefinite" begin="${delay}s"></animate>`
        )
      );
      stem.add(
        SVG(
          `<animate attributeName="y1" from="${tail.y}" to="${
            tail.y + travel.y
          }" dur="${duration}s" repeatCount="indefinite" begin="${delay}s"></animate>`
        )
      );
      stem.add(
        SVG(
          `<animate attributeName="y2" from="${head.y}" to="${
            head.y + travel.y
          }" dur="${duration}s" repeatCount="indefinite" begin="${delay}s"></animate>`
        )
      );
      // });
      group.animate(2000).ease("-").attr("values", "360").loop();

      // stem.animate(2000).ease('-').attr('values', '360').loop();
      // .animate(sample(config.duration), sample(config.delay), "now")
      // .attr({
      //   x1: tail.x
      // })
      // .loop(undefined, false);
    }
  }

  return scene.svg();
}

function animationFragment({
  attrName,
  from,
  to,
  duration,
  delay,
}: {
  attrName: string;
  from: number;
  to: number;
  duration: number;
  delay: number;
}): string {
  return `
    <animate attributeName="${attrName}" from="${from}" to="${to}" dur="${duration}s" repeatCount="indefinite" begin="${delay}s" />
  `;
}
