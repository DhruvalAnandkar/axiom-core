import { useCallback, useRef, useState } from "react";
import { TABLE } from "../../config/billiardsPresets.js";
import { pixelToTableCoords } from "../../hooks/useAimClickSequence.js";
import PhotoVectorOverlay from "./PhotoVectorOverlay.jsx";

export default function CameraAimSurface({
  photoUrl,
  aim,
  stepGuide,
  vectorData,
  markers,
  onSurfaceClick,
  onMarkerDrag,
}) {
  const areaRef = useRef(null);
  const [renderSize, setRenderSize] = useState({ w: 0, h: 0 });

  const onImageLoad = useCallback((e) => {
    const img = e.currentTarget;
    setRenderSize({ w: img.clientWidth, h: img.clientHeight });
  }, []);

  const handleClick = useCallback(
    (e) => {
      if (!onSurfaceClick) return;
      const rect = areaRef.current?.getBoundingClientRect();
      if (!rect?.width) return;
      const point = pixelToTableCoords(e.clientX, e.clientY, rect);
      onSurfaceClick(point);
    },
    [onSurfaceClick],
  );

  const startMarkerDrag = useCallback(
    (kind) => (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = areaRef.current?.getBoundingClientRect();
      if (!rect?.width || !onMarkerDrag) return;

      const move = (ev) => {
        const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
        const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
        onMarkerDrag(kind, pixelToTableCoords(clientX, clientY, rect));
      };

      const up = () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
        window.removeEventListener("touchmove", move);
        window.removeEventListener("touchend", up);
      };

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
      window.addEventListener("touchmove", move, { passive: false });
      window.addEventListener("touchend", up);
    },
    [onMarkerDrag],
  );

  const cue = markers?.cue_ball ?? aim.cue_ball;
  const obj = markers?.object_ball ?? aim.object_ball;
  const pocket = aim.pocket;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center gap-3 p-4">
      <p className="text-center text-sm text-axiom-text">{stepGuide}</p>
      <p className="text-center text-[11px] text-axiom-muted">
        Table bounds {TABLE.w}×{TABLE.h}
        {renderSize.w > 0 && ` · render ${Math.round(renderSize.w)}×${Math.round(renderSize.h)}px`}
      </p>
      <div
        ref={areaRef}
        className="relative max-h-[min(70vh,640px)] w-full max-w-4xl cursor-crosshair overflow-hidden rounded-xl border border-axiom-border bg-black touch-manipulation"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.preventDefault()}
        aria-label="Photo aim surface"
      >
        <img
          src={photoUrl}
          alt="Captured table"
          className="block h-auto max-h-[min(70vh,640px)] w-full select-none object-contain"
          onLoad={onImageLoad}
          draggable={false}
        />
        <PhotoVectorOverlay vectorData={vectorData} />
        {cue && (
          <Marker
            point={cue}
            color="#ffffff"
            label="C"
            onPointerDown={markers ? startMarkerDrag("cue") : undefined}
          />
        )}
        {obj && (
          <Marker
            point={obj}
            color="#f59e0b"
            label="O"
            onPointerDown={markers ? startMarkerDrag("object") : undefined}
          />
        )}
        {pocket && <Marker point={pocket} color="#00ff66" label="P" ring />}
      </div>
    </div>
  );
}

function Marker({ point, color, label, ring, onPointerDown }) {
  const left = `${(point.x / TABLE.w) * 100}%`;
  const top = `${(point.y / TABLE.h) * 100}%`;
  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${onPointerDown ? "cursor-grab" : "pointer-events-none"}`}
      style={{ left, top, width: 44, height: 44 }}
      onPointerDown={onPointerDown}
    >
      <div
        className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold text-axiom-bg shadow ${
          ring ? "border-dashed border-axiom-success bg-axiom-success/30" : "border-slate-800"
        }`}
        style={{ backgroundColor: ring ? undefined : color }}
      >
        {label}
      </div>
    </div>
  );
}
