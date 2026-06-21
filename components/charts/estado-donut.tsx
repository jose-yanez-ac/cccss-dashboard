"use client";

import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";

import type { EstadoSlice } from "@/lib/dashboard";
import { ChartContainer } from "@/components/charts/chart-container";

const HEIGHT = 280;

export function EstadoDonut({ data }: { data: EstadoSlice[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="space-y-2">
      <ChartContainer height={HEIGHT}>
        {(width) => (
          <PieChart width={width} height={HEIGHT}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={2}
            >
              {data.map((d) => (
                <Cell key={d.estado} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} CCSS`, name]} />
            <Legend />
          </PieChart>
        )}
      </ChartContainer>
      <p className="text-center text-xs text-muted-foreground">
        Total: {total} CCSS
      </p>
    </div>
  );
}
