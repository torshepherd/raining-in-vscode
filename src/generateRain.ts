import { registerWindow, Svg, SVG } from "@svgdotjs/svg.js";
import hexRgb = require("hex-rgb");
// @ts-ignore
import { createSVGWindow } from "svgdom";

const window = createSVGWindow();
const document = window.document;

export type RainConfig = {
  color: string;
  count: number;
  speed: MinMax;
  delay: MinMax;
  angle: MinMax;
  size: MinMax;
  opacity: MinMax;
  length: MinMax;
  fallHeight: MinMax;
  windowWidth: number;
};

export type MinMax = {
  min: number;
  max: number;
};

export function sample(param: MinMax): number {
  return Math.random() * (param.max - param.min) + param.min;
}

export function generateRainBackground(config: RainConfig): string {
  // register window and document
  registerWindow(window, document);

  let scene = SVG(document.documentElement);

  if (scene instanceof Svg) {
    // scene.size("10000", "10000"); // TODO: just for testing
    const color = hexRgb(config.color);
    for (let i = 0; i < config.count; i++) {
      const length = sample(config.length);
      const angle = sample(config.angle);
      const opacity = sample(config.opacity);
      const speed = sample(config.speed);
      const delay = sample(config.delay);
      const width = sample(config.size);
      const fallHeight = sample(config.fallHeight);
      const duration = fallHeight / speed;
      const travel = {
        x: fallHeight * Math.tan(angle * (Math.PI / 180)),
        y: fallHeight,
      };
      const head = {
        x: sample({
          min: Math.min(-travel.x, 0),
          max: Math.max(config.windowWidth - travel.x, config.windowWidth),
        }),
        y: 0,
      };
      const tail = {
        x: head.x - length * Math.sin(angle * (Math.PI / 180)),
        y: head.y - length * Math.cos(angle * (Math.PI / 180)),
      };

      const stemGroup = scene.group();

      const stemGrad = scene.gradient("linear", function (add) {
        add.stop(0, `rgba(${color.red},${color.green},${color.blue},0.0)`);
        add.stop(
          1,
          `rgba(${color.red},${color.green},${color.blue},${opacity})`
        );
      });
      const stem = scene
        .line(tail.x, tail.y, head.x, head.y)
        .stroke({ color: stemGrad.url(), width: width });

      stemGroup.add(stemGrad);
      stemGroup.add(stem);

      stem.add(
        SVG(
          `<animate id="${stem.id() + "-x1"}" attributeName="x1" from="${tail.x
          }" to="${tail.x + travel.x}" dur="${duration}s" begin="${delay}s;${stem.id() + "-x1"
          }.end+${delay}s"></animate>`
        )
      );
      stem.add(
        SVG(
          `<animate id="${stem.id() + "-x2"}" attributeName="x2" from="${head.x
          }" to="${head.x + travel.x}" dur="${duration}s" begin="${delay}s;${stem.id() + "-x2"
          }.end+${delay}s"></animate>`
        )
      );
      stem.add(
        SVG(
          `<animate id="${stem.id() + "-y1"}" attributeName="y1" from="${tail.y
          }" to="${tail.y + travel.y}" dur="${duration}s" begin="${delay}s;${stem.id() + "-y1"
          }.end+${delay}s"></animate>`
        )
      );
      stem.add(
        SVG(
          `<animate id="${stem.id() + "-y2"}" attributeName="y2" from="${head.y
          }" to="${head.y + travel.y}" dur="${duration}s" begin="${delay}s;${stem.id() + "-y2"
          }.end+${delay}s"></animate>`
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

  return scene.svg().replace(/&quot;/gi, "");
}
