"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Contenedor de gráficos que mide su propio ancho con un `ResizeObserver` y
 * entrega un ancho en píxeles explícito al chart. Reemplaza a
 * `ResponsiveContainer` de Recharts, que en la v3 puede medir 0 en móvil y
 * dejar el gráfico en blanco.
 */
export function ChartContainer({
  height,
  children,
}: {
  height: number;
  children: (width: number) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth(Math.floor(w));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: "100%", height }} className="min-w-0">
      {width > 0 ? children(width) : null}
    </div>
  );
}
