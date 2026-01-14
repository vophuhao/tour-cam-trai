"use client";
import { useState, useRef, useEffect, useCallback } from "react";

type Props = {
  minLimit?: number;
  maxLimit?: number;
  step?: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
};

export default function DualRangeSlider({
  minLimit = 10000,
  maxLimit = 10000000,
  step = 10000,
  valueMin,
  valueMax,
  onChange,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);

  const valueToPct = (v: number) =>
    ((v - minLimit) / (maxLimit - minLimit)) * 100;

  const handleMouseMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!dragging || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const clientX =
        e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      const val =
        Math.round(
          (minLimit + (pct / 100) * (maxLimit - minLimit)) / step
        ) * step;
      if (dragging === "min") {
        onChange(Math.min(val, valueMax - step), valueMax);
      } else {
        onChange(valueMin, Math.max(val, valueMin + step));
      }
    },
    [dragging, minLimit, maxLimit, step, valueMin, valueMax, onChange]
  );

  useEffect(() => {
    const stopDrag = () => setDragging(null);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchend", stopDrag);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleMouseMove, { passive: false });
    return () => {
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchend", stopDrag);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div className="w-full py-4">
      <div className="flex justify-between  text-sm mb-2">
        <span>{valueMin.toLocaleString("vi-VN")}₫</span>
        <span>{valueMax.toLocaleString("vi-VN")}₫</span>
      </div>

      <div className="relative h-6" ref={trackRef}>
        {/* Track */}
        <div className="absolute inset-0 bg-black rounded-full h-1 top-1/2 -translate-y-1/2" />

        {/* Highlight */}
        <div
          className="absolute  rounded-full h-2 top-1/2 -translate-y-1/2"
          style={{
            left: `${valueToPct(valueMin)}%`,
            right: `${100 - valueToPct(valueMax)}%`,
          }}
        />

        {/* MIN thumb */}
        <div
          className="absolute w-4 h-4 bg-white border-2 rounded-full shadow cursor-pointer top-1/2 -translate-y-1/2"
          style={{ left: `calc(${valueToPct(valueMin)}% - 10px)`, zIndex: 10 }}
          onMouseDown={() => setDragging("min")}
          onTouchStart={() => setDragging("min")}
        />

        {/* MAX thumb */}
        <div
          className="absolute w-4 h-4 bg-white border-2  rounded-full shadow cursor-pointer top-1/2 -translate-y-1/2"
          style={{ left: `calc(${valueToPct(valueMax)}% - 10px)`, zIndex: 10 }}
          onMouseDown={() => setDragging("max")}
          onTouchStart={() => setDragging("max")}
        />
      </div>
    </div>
  );
}
