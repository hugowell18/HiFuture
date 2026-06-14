import { useEffect, useRef } from "react";

// A handful of very fine, individually wandering white streamlines over a
// transparent base — the silk-thread / flowing-current look. Each line's path
// is driven by scrolling fbm noise (not a clean sine), so the strands meander
// irregularly, cross, and flow right -> left. Crisp ~1px antialiased lines.

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform vec2  uResolution;
uniform float uTime;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p *= 1.9;
    a *= 0.5;
  }
  return v;
}

const int N = 10;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;

  vec2 p = uv - 0.5;
  p.x *= aspect;

  float t = uTime * 0.13;

  // gentle shared drift the whole set leans on
  float arc = 0.05 * sin(p.x * 0.7 + 0.5) + 0.04 * p.x;

  // gather: spread out on the right, tighten into a churning rope toward the
  // left (the flow direction) -> the strands "抱团" as they stream out.
  float gather = mix(0.26, 1.0, smoothstep(-0.8, 0.6, p.x));

  // a shared turbulent roll the whole river churns with (scrolls left)
  float roll = fbm(vec2(p.x * 1.2 + t * 1.1, t * 0.45)) - 0.5;

  float acc = 0.0;

  for (int i = 0; i < N; i++) {
    float fi = float(i) / float(N - 1);
    float seed = float(i) * 7.7;

    // per-line turbulent wander, scrolling LEFT over time (+t -> -x)
    float n1 = fbm(vec2(p.x * 1.2 + t * 1.2 + seed, seed * 0.6)) - 0.5;
    float n2 = fbm(vec2(p.x * 2.7 + t * 0.8 + seed * 1.7, seed * 1.3 + t * 0.3)) - 0.5;

    // tumble: line noise + a slice of the shared roll, tightened by gather so
    // the bundle rolls over itself like surging water
    float wob = (n1 * 0.20 + n2 * 0.08 + roll * 0.12) * mix(0.55, 1.0, gather);

    float baseOff = (fi - 0.5) * 0.34 * gather;
    float y = arc + baseOff + wob;

    // perpendicular distance to the curve, normalized by its gradient so the
    // line stays a CONSTANT pixel width no matter how steep the wobble gets.
    float g    = p.y - y;
    float grad = max(fwidth(g), 1e-4);
    float dist = abs(g) / grad;                        // ~pixels from the line

    float core = 1.0 - smoothstep(0.0, 1.6, dist);     // crisp ~1.5px line
    float glow = exp(-dist * dist / 10.0) * 0.09;      // tight, px-based glow

    float bright = 0.75 + 0.25 * sin(seed * 2.0);
    // keep threads at full strength across the panel; trim only the far edges
    float env = (1.0 - smoothstep(0.72, 0.95, abs(p.x)))
              * (0.82 + 0.18 * sin(t * 1.3 + seed));

    acc += (core + glow) * bright * env;
  }

  float alpha = clamp(acc, 0.0, 1.0);

  // horizontal gradient, right -> left:
  //   right  = RGS (rokugenso) teal  #3690a4
  //   middle = Accenture purple      #A100FF
  //   left   = Deloitte green        #86BC25
  vec3 teal   = vec3(0.2118, 0.5647, 0.6431);
  vec3 purple = vec3(0.6314, 0.0,    1.0);
  vec3 green  = vec3(0.5255, 0.7373, 0.1451);

  // stops positioned over the visible (left) area so the green actually reads:
  //   green dominant up to ~0.10, purple around 0.42, teal from ~0.80
  float gx = uv.x;
  vec3 col = gx < 0.42
    ? mix(green, purple, smoothstep(0.10, 0.42, gx))
    : mix(purple, teal,  smoothstep(0.42, 0.80, gx));

  gl_FragColor = vec4(col, alpha);
}
`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function VisionWaves() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl =
      canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false }) ||
      canvas.getContext("experimental-webgl");
    if (!gl) return;

    gl.getExtension("OES_standard_derivatives"); // fwidth() in WebGL1
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const vert = compile(gl, gl.VERTEX_SHADER, VERT);
    const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vert || !frag) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    // fullscreen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(prog, "uResolution");
    const uTime = gl.getUniformLocation(prog, "uTime");

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (w === width && h === height) return;
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uResolution, w, h);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const render = (ms) => {
      gl.uniform1f(uTime, ms * 0.001);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduceMotion) raf = requestAnimationFrame(render);
    };

    if (reduceMotion) {
      render(0); // single static frame
    } else {
      raf = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(buf);
    };
  }, []);

  return <canvas ref={canvasRef} className="vision-waves" aria-hidden="true" />;
}
