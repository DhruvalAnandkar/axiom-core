const OPENCV_CDN = "https://docs.opencv.org/4.9.0/opencv.js";
const LOAD_TIMEOUT_MS = 5000;

export function loadOpenCv() {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === "undefined") {
        reject(new Error("no window"));
        return;
      }
      if (window.cv?.Mat) {
        resolve(window.cv);
        return;
      }

      const timer = setTimeout(() => reject(new Error("timeout")), LOAD_TIMEOUT_MS);

      const finish = (cv) => {
        clearTimeout(timer);
        resolve(cv);
      };

      const fail = (err) => {
        clearTimeout(timer);
        reject(err);
      };

      if (window.cv) {
        window.cv.onRuntimeInitialized = () => finish(window.cv);
        return;
      }

      const existing = document.querySelector('script[data-opencv="true"]');
      if (existing) {
        existing.addEventListener("load", () => {
          window.cv.onRuntimeInitialized = () => finish(window.cv);
        });
        existing.addEventListener("error", () => fail(new Error("load failed")));
        return;
      }

      const script = document.createElement("script");
      script.src = OPENCV_CDN;
      script.async = true;
      script.dataset.opencv = "true";
      script.onload = () => {
        try {
          window.cv.onRuntimeInitialized = () => finish(window.cv);
        } catch (e) {
          fail(e);
        }
      };
      script.onerror = () => fail(new Error("load failed"));
      document.head.appendChild(script);
    } catch (e) {
      reject(e);
    }
  });
}
