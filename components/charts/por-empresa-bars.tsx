"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { EmpresaBar } from "@/lib/dashboard";
import { ChartContainer } from "@/components/charts/chart-container";
import { formatUF } from "@/lib/format";

export function PorEmpresaBars({
  data,
  color,
}: {
  data: EmpresaBar[];
  color: string;
}) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Sin datos.
      </p>
    );
  }

  const height = Math.max(220, data.length * 30);

  return (
    <ChartContainer height={height}>
      {(width) => (
        <BarChart
          width={width}
          height={height}
          data={data}
          layout="vertical"
          margin={{ left: 8, right: 16 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickFormatter={(v) => formatUF(Number(v))}
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="empresa"
            width={120}
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value) => `${formatUF(Number(value))} UF`}
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
          />
          <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      )}
    </ChartContainer>
  );
}
