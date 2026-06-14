const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ease = (value) => 1 - Math.pow(1 - clamp(value), 3);
const segment = (progress, start, end) => clamp((progress - start) / (end - start));
const lerp = (a, b, t) => a + (b - a) * t;

const sparkTrack = [
  { x: 272, y: 612 },
  { x: 505, y: 664 },
  { x: 690, y: 642 },
  { x: 865, y: 544 },
  { x: 1015, y: 168 },
];

function interpolate(points, t) {
  const scaled = clamp(t) * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const current = points[index];
  const next = points[index + 1];

  return {
    x: lerp(current.x, next.x, local),
    y: lerp(current.y, next.y, local),
  };
}

function createSvgElement(tagName, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
}

function buildHexMesh() {
  const layer = document.querySelector("[data-hex-layer]");
  if (!layer || layer.dataset.ready === "true") return;

  const fragment = document.createDocumentFragment();
  const radius = 32;
  const yStep = 48;
  const xStep = 56;

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 12; col += 1) {
      const x = 12 + col * xStep + (row % 2 ? xStep / 2 : 0);
      const y = 718 + row * yStep;
      const fade = clamp(1 - x / 680) * clamp(1 - Math.abs(y - 875) / 260);
      if (fade <= 0.08) continue;

      const group = createSvgElement("g", {
        "data-hex-cell": "",
        "data-row": row,
        "data-col": col,
        "data-x": x.toFixed(2),
        "data-y": y.toFixed(2),
        "data-fade": fade.toFixed(4),
      });

      const points = Array.from({ length: 6 }, (_, index) => {
        const angle = ((60 * index + 30 - 12) * Math.PI) / 180;
        return `${x + radius * Math.cos(angle)},${y + radius * Math.sin(angle)}`;
      }).join(" ");

      group.appendChild(createSvgElement("polygon", { points, class: "hex-outline" }));
      group.appendChild(createSvgElement("circle", { cx: x, cy: y, r: "3.2", class: "hex-dot" }));
      fragment.appendChild(group);
    }
  }

  layer.insertBefore(fragment, layer.firstChild);
  layer.dataset.ready = "true";
}

function updateHexMesh(progress) {
  const layer = document.querySelector("[data-hex-layer]");
  if (!layer) return;

  layer.style.opacity = ease(segment(progress, 0.12, 0.42)).toFixed(3);

  document.querySelectorAll("[data-hex-cell]").forEach((cell) => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);
    const fade = Number(cell.dataset.fade);
    const delay = (row + col) * 0.016;
    const reveal = ease(segment(progress, 0.1 + delay, 0.34 + delay));
    const scale = 0.88 + 0.12 * ease(segment(progress, 0.16 + delay, 0.46 + delay));

    cell.style.opacity = (fade * reveal).toFixed(3);
    cell.setAttribute("transform", `translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`);
  });
}

function setOpacity(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.style.opacity = clamp(value).toFixed(3);
}

function updateProgress() {
  const scene = document.querySelector("[data-scroll-scene]");
  if (!scene) return;

  const rect = scene.getBoundingClientRect();
  const available = Math.max(1, rect.height - window.innerHeight);
  const progress = clamp(-rect.top / available);
  const pathDraw = ease(segment(progress, 0.2, 0.68));
  const serviceDraw = ease(segment(progress, 0.28, 0.86));
  const sparkProgress = ease(segment(progress, 0.3, 0.82));
  const sparkPoint = interpolate(sparkTrack, sparkProgress);
  const sparkOpacity = ease(segment(progress, 0.24, 0.42));
  const arrowOpacity = ease(segment(progress, 0.52, 0.67));
  const serviceProgress = ease(segment(progress, 0.58, 0.9));
  const visionProgress = ease(segment(progress, 0.3, 0.52));
  const nextProgress = ease(segment(progress, 0.76, 0.96));
  const nodePulse = 0.6 + 0.4 * Math.sin(progress * Math.PI * 8);

  updateHexMesh(progress);

  document.querySelectorAll("[data-story-path], [data-story-shadow]").forEach((path) => {
    path.style.strokeDashoffset = (1 - pathDraw).toFixed(4);
  });

  const servicePath = document.querySelector("[data-service-path]");
  if (servicePath) servicePath.style.strokeDashoffset = (1 - serviceDraw).toFixed(4);

  const spark = document.querySelector("[data-spark]");
  if (spark) {
    spark.style.opacity = sparkOpacity.toFixed(3);
    spark.setAttribute("transform", `translate(${sparkPoint.x} ${sparkPoint.y})`);
  }

  const accentArrow = document.querySelector("[data-accent-arrow]");
  if (accentArrow) {
    accentArrow.style.opacity = arrowOpacity.toFixed(3);
    accentArrow.setAttribute("transform", `translate(${(1 - arrowOpacity) * -24} ${(1 - arrowOpacity) * 18})`);
  }

  const node = document.querySelector("[data-deloitte-node]");
  if (node) node.style.opacity = ease(segment(progress, 0.58, 0.72)).toFixed(3);

  const halo = document.querySelector("[data-node-halo]");
  if (halo) halo.setAttribute("r", (18 + nodePulse * 5).toFixed(2));

  setOpacity("[data-service-nodes]", ease(segment(progress, 0.62, 0.82)));
  setOpacity("[data-scroll-copy]", 1 - ease(segment(progress, 0.35, 0.56)));

  const visionCaption = document.querySelector("[data-vision-caption]");
  if (visionCaption) {
    visionCaption.style.opacity = visionProgress.toFixed(3);
    visionCaption.style.transform = `translateY(${lerp(24, 0, visionProgress)}px)`;
  }

  const serviceLayer = document.querySelector("[data-service-layer]");
  if (serviceLayer) {
    serviceLayer.style.opacity = serviceProgress.toFixed(3);
    serviceLayer.style.transform = `translateY(${lerp(36, 0, serviceProgress)}px)`;
  }

  const next = document.querySelector("[data-next-section]");
  if (next) {
    next.style.opacity = nextProgress.toFixed(3);
    next.style.transform = `translateY(${lerp(42, 0, nextProgress)}px)`;
  }
}

function start() {
  buildHexMesh();
  updateProgress();

  let frame = 0;
  const requestUpdate = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(updateProgress);
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
