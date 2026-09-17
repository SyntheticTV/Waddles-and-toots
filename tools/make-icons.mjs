/**
 * The app icon and the splash, drawn with the game's own art.
 *
 * Not a separate illustration: the icon is Waddles and a poof, rendered by the
 * same components the room uses, so it cannot drift away from what the game
 * actually looks like. It is also the only way to get a 1024px icon out of a
 * vector game without redrawing anything by hand.
 *
 *   node icon.mjs           writes assets/icon.png, splash-icon.png and the
 *                           three Android adaptive layers
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import Module from 'node:module';

const PROJECT = path.join(import.meta.dirname, "..");
const OUT = path.join(PROJECT, 'assets');
const require = createRequire(pathToFileURL(path.join(PROJECT, 'package.json')));
const ts = require('typescript');
const CanvasKitInit = require('canvaskit-wasm');
const React = require('react');

const CK = await CanvasKitInit();

// ------------------------------------------------- the same stubs render uses

const mark = (name) => {
  const C = (props) => React.createElement(name, props, props?.children);
  C.displayName = name;
  return C;
};
const skiaStub = {
  __esModule: true,
  Canvas: mark('Canvas'),
  Group: mark('Group'),
  Path: mark('Path'),
  Circle: mark('Circle'),
  Rect: mark('Rect'),
  RoundedRect: mark('RoundedRect'),
  RadialGradient: mark('RadialGradient'),
  Oval: mark('Oval'),
  Line: mark('Line'),
  LinearGradient: mark('LinearGradient'),
  vec: (x, y) => ({ x, y }),
  Skia: { Path: { MakeFromSVGString: (d) => CK.Path.MakeFromSVGString(d), Make: () => new CK.Path() } },
};

for (const ext of ['.ts', '.tsx']) {
  Module._extensions[ext] = function (mod, filename) {
    mod._compile(
      ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2020,
          jsx: ts.JsxEmit.React,
          esModuleInterop: true,
        },
        fileName: filename,
      }).outputText,
      filename
    );
  };
}
const realLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@shopify/react-native-skia') return skiaStub;
  if (request === 'react') return React;
  return realLoad.call(this, request, parent, isMain);
};

const chars = require(path.join(PROJECT, 'src/art/characters.tsx'));
const effects = require(path.join(PROJECT, 'src/art/effects.tsx'));
const { palette } = require(path.join(PROJECT, 'src/theme/palette.ts'));

// ------------------------------------------------------------ the painter
//
// A tiny Skia renderer: walks the element tree and issues CanvasKit draws. Only
// the handful of node types the character art actually uses.

const hex = (c) => CK.parseColorString(c);

function paintFor(props, style) {
  const p = new CK.Paint();
  p.setAntiAlias(true);
  if (style === 'stroke') {
    p.setStyle(CK.PaintStyle.Stroke);
    p.setStrokeWidth(props.strokeWidth ?? 1);
    if (props.strokeCap === 'round') p.setStrokeCap(CK.StrokeCap.Round);
    p.setStrokeJoin(CK.StrokeJoin.Round);
  }
  if (props.color) p.setColor(hex(props.color));
  if (props.opacity !== undefined) p.setAlphaf((props.opacity ?? 1) * p.getColor()[3]);
  return p;
}

/** A gradient child turns into a shader on the parent's paint. */
function shaderFrom(children, box) {
  const kids = [].concat(children ?? []).filter(Boolean);
  for (const k of kids) {
    if (!k || typeof k !== 'object') continue;
    const n = typeof k.type === 'function' ? k.type.displayName : k.type;
    if (n === 'LinearGradient') {
      const { start, end, colors, positions } = k.props;
      return CK.Shader.MakeLinearGradient(
        [start.x, start.y],
        [end.x, end.y],
        colors.map(hex),
        positions ?? null,
        CK.TileMode.Clamp
      );
    }
    if (n === 'RadialGradient') {
      const { c, r, colors, positions } = k.props;
      return CK.Shader.MakeRadialGradient(
        [c.x, c.y],
        r,
        colors.map(hex),
        positions ?? null,
        CK.TileMode.Clamp
      );
    }
  }
  return null;
}

function applyTransform(canvas, transform) {
  for (const t of transform ?? []) {
    if (t.translateX !== undefined) canvas.translate(t.translateX, 0);
    if (t.translateY !== undefined) canvas.translate(0, t.translateY);
    if (t.scale !== undefined) canvas.scale(t.scale, t.scale);
    if (t.scaleX !== undefined) canvas.scale(t.scaleX, 1);
    if (t.scaleY !== undefined) canvas.scale(1, t.scaleY);
    if (t.rotate !== undefined) canvas.rotate((t.rotate * 180) / Math.PI, 0, 0);
  }
}

function draw(canvas, el, inherited = 1) {
  if (el === null || el === undefined || typeof el === 'boolean') return;
  if (Array.isArray(el)) {
    el.forEach((e) => draw(canvas, e, inherited));
    return;
  }
  if (typeof el !== 'object') return;
  const { type, props } = el;
  if (typeof type === 'function' && !type.displayName) {
    draw(canvas, type(props ?? {}), inherited);
    return;
  }
  const name = typeof type === 'function' ? type.displayName : String(type);
  const o = (props?.opacity ?? 1) * inherited;

  if (name === 'Group' || name === 'Canvas') {
    canvas.save();
    applyTransform(canvas, props?.transform);
    draw(canvas, props?.children, o);
    canvas.restore();
    return;
  }

  const shader = shaderFrom(props?.children, null);
  const paint = paintFor(props ?? {}, props?.style);
  if (shader) paint.setShader(shader);
  if (o < 1) paint.setAlphaf(o * (props?.color ? paint.getColor()[3] : 1));

  if (name === 'Path' && props.path) canvas.drawPath(props.path, paint);
  else if (name === 'Circle') canvas.drawCircle(props.cx, props.cy, props.r, paint);
  else if (name === 'Rect') {
    canvas.drawRect(CK.XYWHRect(props.x, props.y, props.width, props.height), paint);
  } else if (name === 'RoundedRect') {
    canvas.drawRRect(
      CK.RRectXY(CK.XYWHRect(props.x, props.y, props.width, props.height), props.r, props.r),
      paint
    );
  } else if (name === 'Oval') {
    canvas.drawOval(CK.XYWHRect(props.x, props.y, props.width, props.height), paint);
  }
  paint.delete();
}

// -------------------------------------------------------------- the icons

function render(size, build, background) {
  const surface = CK.MakeSurface(size, size);
  const canvas = surface.getCanvas();
  if (background) canvas.clear(CK.parseColorString(background));
  else canvas.clear(CK.TRANSPARENT);
  draw(canvas, build(size));
  const img = surface.makeImageSnapshot();
  return Buffer.from(img.encodeToBytes());
}

/**
 * Waddles, and a poof.
 *
 * One character, centred, big. An icon is read at sixty pixels on a home screen
 * and the penguin is the only one of the four with enough contrast to survive
 * that — and the green cloud beside him says what the game is before anybody has
 * read the name.
 */
const cast = (size) => [
  // Beside him, not behind him: at icon size anything inside his silhouette is
  // simply gone. And inset from the edges, because both platforms mask an icon
  // to a rounded square and clip whatever is in the corners.
  React.createElement(effects.Poof, {
    key: 'poof',
    x: size * 0.235,
    y: size * 0.6,
    age: 0.4,
    // `scale` is pixels per world unit, not a fraction of the canvas. A tenth of
    // this drew the cloud twelve pixels wide on a 1024px icon, which is why the
    // first three attempts appeared to have no poof in them at all.
    scale: size * 0.055,
    strength: 1,
  }),
  React.createElement(effects.Poof, {
    key: 'poof2',
    x: size * 0.8,
    y: size * 0.52,
    age: 0.62,
    scale: size * 0.038,
    strength: 0.8,
  }),
  React.createElement(chars.Waddles, {
    key: 'waddles',
    x: size * 0.52,
    y: size * 0.8,
    size: size * 0.64,
    t: 0.6,
    moving: false,
    holding: false,
  }),
];

/*
 * Paper, not the stink green.
 *
 * The poof *is* stink green, so on a green ground it was invisible — the first
 * version of this icon was a penguin standing in front of two clouds nobody
 * could see. On the game's own paper colour the cloud reads, the penguin's black
 * reads, and the icon says "penguin, and something is wrong" at sixty pixels.
 */
const GROUND = palette.paper;

fs.writeFileSync(path.join(OUT, 'icon.png'), render(1024, cast, GROUND));
// The adaptive foreground is drawn small: Android crops a circle out of the
// middle of it and anything near the edge is lost.
fs.writeFileSync(
  path.join(OUT, 'android-icon-foreground.png'),
  render(1024, (s) => [
    React.createElement(effects.Poof, {
      key: 'poof',
      x: s * 0.38,
      y: s * 0.56,
      age: 0.45,
      scale: s * 0.034,
      strength: 1,
    }),
    React.createElement(chars.Waddles, {
      key: 'w',
      x: s * 0.53,
      y: s * 0.74,
      size: s * 0.56,
      t: 0.6,
      moving: false,
      holding: false,
    }),
  ])
);
fs.writeFileSync(path.join(OUT, 'android-icon-background.png'), render(1024, () => [], GROUND));
fs.writeFileSync(
  path.join(OUT, 'android-icon-monochrome.png'),
  render(1024, (s) => [
    React.createElement(chars.Waddles, {
      key: 'w',
      x: s * 0.5,
      y: s * 0.76,
      size: s * 0.6,
      t: 0.6,
      moving: false,
      holding: false,
    }),
  ])
);
// The splash shows him bigger still, on the same green.
fs.writeFileSync(path.join(OUT, 'splash-icon.png'), render(1024, cast, null));
fs.writeFileSync(path.join(OUT, 'favicon.png'), render(196, cast, GROUND));

for (const f of ['icon.png', 'splash-icon.png', 'android-icon-foreground.png', 'favicon.png']) {
  const b = fs.readFileSync(path.join(OUT, f));
  console.log(`  ${f.padEnd(32)} ${b.readUInt32BE(16)}x${b.readUInt32BE(20)}  ${(b.length / 1024) | 0} KB`);
}
