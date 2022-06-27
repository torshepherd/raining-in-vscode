import { readFileSync } from "fs";
import * as vscode from "vscode";
import { RainConfig } from "./generateRain";

export function asNotNaN(value: number, backup: number = 0): number {
  return isNaN(value) ? backup : value;
}

export function getHTMLContent(htmlPath: string): {
  content: string;
  isEnabled: boolean;
} {
  const html = readFileSync(htmlPath, "utf-8");
  return { content: html, isEnabled: html.includes("<!-- RAINING IN -->") };
}

export function handleErrors(err: any): void {
  if (/ENOENT|EACCES|EPERM/.test(err.code)) {
    vscode.window.showInformationMessage(
      "You must run VS code with admin privileges in order to use Raining in."
    );
    return;
  } else {
    vscode.window.showErrorMessage(
      "Something went wrong when toggling downpour."
    );
    return;
  }
}

export function deleteScriptTag(html: string): string {
  return html.replace(
    /^.*(<!-- RAINING IN --><script src="downpour_[0|1].js"><\/script><!-- TORRENTIAL DOWNPOUR -->).*\n?/gm,
    ""
  );
}

export function writeScriptTag(html: string, idx: number): string {
  let output = html.replace(
    /\<\/html\>/g,
    `	<!-- RAINING IN --><script src="downpour_${idx}.js"></script><!-- TORRENTIAL DOWNPOUR -->\n`
  );
  output += "</html>";
  return output;
}

export function importRainConfig(
  vscConfig: vscode.WorkspaceConfiguration
): RainConfig {
  return {
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
}
