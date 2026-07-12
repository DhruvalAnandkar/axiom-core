import { TABLE } from "../../../config/billiardsPresets.js";

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function matMeanRgb(cv, mat, x, y, r) {
  let rs = 0;
  let gs = 0;
  let bs = 0;
  let n = 0;
  const x0 = Math.max(0, Math.floor(x - r));
  const y0 = Math.max(0, Math.floor(y - r));
  const x1 = Math.min(mat.cols - 1, Math.ceil(x + r));
  const y1 = Math.min(mat.rows - 1, Math.ceil(y + r));
  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      const pix = mat.ucharPtr(py, px);
      bs += pix[0];
      gs += pix[1];
      rs += pix[2];
      n++;
    }
  }
  if (!n) return { r: 0, g: 0, b: 0 };
  return { r: rs / n, g: gs / n, b: bs / n };
}

function toTableCoords(x, y, width, height) {
  return {
    x: Math.max(0, Math.min(TABLE.w, (x / width) * TABLE.w)),
    y: Math.max(0, Math.min(TABLE.h, (y / height) * TABLE.h)),
  };
}

export async function detectBallsFromPhoto(photoUrl, cv) {
  const img = await loadImage(photoUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const src = cv.matFromImageData(imageData);
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const circles = new cv.Mat();

  try {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.medianBlur(gray, blurred, 5);
    cv.HoughCircles(
      blurred,
      circles,
      cv.HOUGH_GRADIENT,
      1,
      Math.max(20, Math.min(canvas.width, canvas.height) / 12),
      120,
      30,
      Math.max(8, Math.min(canvas.width, canvas.height) / 40),
      Math.max(16, Math.min(canvas.width, canvas.height) / 10),
    );

    const found = [];
    for (let i = 0; i < circles.cols; i++) {
      const x = circles.data32F[i * 3];
      const y = circles.data32F[i * 3 + 1];
      const r = circles.data32F[i * 3 + 2];
      const rgb = matMeanRgb(cv, src, x, y, r * 0.45);
      const brightness = (rgb.r + rgb.g + rgb.b) / 3;
      found.push({ x, y, r, brightness, rgb });
    }

    found.sort((a, b) => b.brightness - a.brightness);
    if (found.length < 2) return null;

    const cuePx = found[0];
    const objectPx = found.find((c) => Math.hypot(c.x - cuePx.x, c.y - cuePx.y) > cuePx.r * 2) ?? found[1];

    return {
      cue_ball: toTableCoords(cuePx.x, cuePx.y, canvas.width, canvas.height),
      object_ball: toTableCoords(objectPx.x, objectPx.y, canvas.width, canvas.height),
    };
  } finally {
    src.delete();
    gray.delete();
    blurred.delete();
    circles.delete();
  }
}
