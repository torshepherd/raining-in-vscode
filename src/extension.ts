// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { readFileSync, writeFileSync } from "fs";
import path = require("path");
import * as vscode from "vscode";
import { registerWindow, Svg, SVG } from "@svgdotjs/svg.js";
// @ts-ignore
import { optimize } from "svgo";
// @ts-ignore
import { createSVGWindow } from "svgdom";

const window = createSVGWindow();
const document = window.document;

function asNotNaN(value: number, backup: number = 0): number {
  return isNaN(value) ? backup : value;
}

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

  console.log("RAINING IN V S C O D E is now active.");

  let enable = vscode.commands.registerCommand(
    "rainingin.enableDownpour",
    () => {
      const rainbackground = generateRainBackground(config);
      const result = optimize(rainbackground, {
        // all config fields are also available here
        multipass: true,
      });
      const optimizedRainBackground = result.data;
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
        // console.log("[RAINING IN V S C O D E]: Before reading file");
        // console.log(
        //   "[RAINING IN V S C O D E]: " + __dirname + "/js/downpour_template.js"
        // );
        const jsTemplate = readFileSync(
          __dirname + "/js/downpour_template.js",
          "utf-8"
        );
        // console.log("[RAINING IN V S C O D E]: Read template");
        writeFileSync(templateFile, jsTemplate, "utf-8");
        writeFileSync(svgFile, optimizedRainBackground, "utf-8");
        // console.log("[RAINING IN V S C O D E]: Wrote template and background");
        // modify workbench html
        const html = readFileSync(htmlFile, "utf-8");
        // check if the tag is already there
        const isEnabled = html.includes("downpour.js");
        if (!isEnabled) {
          // console.log("[RAINING IN V S C O D E]: Stitching into workbench");
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

function generateRainBackground(config: RainConfig): string {
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

      const stemGroup = scene.group();

      const stemGrad = scene.gradient("linear", function (add) {
        add.stop(0, `rgba(255,255,255,0.0)`);
        add.stop(1, `rgba(255,255,255,${opacity})`);
      });
      const stem = scene
        .line(tail.x, tail.y, head.x, head.y)
        .stroke({ color: stemGrad.url(), width: width });

      stemGroup.add(stemGrad);
      stemGroup.add(stem);

      stem.add(
        SVG(
          `<animate id="${stem.id() + "-animation"}" attributeName="x1" from="${
            tail.x
          }" to="${
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

      // TODO: decide if we want splashes or not
      // const splashGroup = scene.group();

      // const splashGrad = scene.gradient("linear", function (add) {
      //   add.stop(0, `rgba(255,255,255,${opacity})`);
      //   add.stop(1, `rgba(255,255,255,0.0)`);
      // });
      // splashGrad.attr("gradientTransform", "rotate(90)");

      // const splash = scene
      //   .ellipse(10, 5)
      //   .fill("rgba(255,255,255,0.0)")
      //   .cx(head.x + travel.x)
      //   .cy(head.y + travel.y)
      //   .stroke({ color: splashGrad.url(), width: width });

      // splashGroup.add(splashGrad);
      // splashGroup.add(splash);
      // splash.add(
      //   SVG(
      //     `<animate attributeName="rx" from="0" to="10" dur="0.2s" begin="${
      //       stem.id() + "-animation"
      //     }.end" repeatCount="indefinite"></animate>`
      //   )
      // );
      // splash.add(
      //   SVG(
      //     `<animate attributeName="ry" from="0" to="5" dur="0.2s" begin="${
      //       stem.id() + "-animation"
      //     }.end" repeatCount="indefinite"></animate>`
      //   )
      // );
      // splash.add(
      //   SVG(
      //     `<animate attributeName="stroke-dasharray" from="0" to="3" dur="0.2s" begin="${
      //       stem.id() + "-animation"
      //     }.end" repeatCount="indefinite"></animate>`
      //   )
      // );
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
