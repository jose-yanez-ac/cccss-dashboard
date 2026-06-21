"use client";

import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";

import { ChartContainer } from "@/components/charts/chart-container";
import { COLORS } from "@/lib/constants";
import { formatUF } from "@/lib/format";

const HEIGHT = 260;

export function FacturadoDonut({
  facturado,
  saldo,
}: {
  facturado: number;
  saldo: number;
}) {
  const data = [
    { name: "Facturado", value: facturado, color: COLORS.green },
    { name: "Saldo", value: saldo, color: COLORS.orange },
  ];

  return (
    <ChartContainer height={HEIGHT}>
      {(width) => (
        <PieChart width={width} height={HEIGHT}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${formatUF(Number(value))} UF`} />
          <Legend />
        </PieChart>
      )}
    </ChartContainer>
  );
}
