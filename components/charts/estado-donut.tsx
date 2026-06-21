"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { EstadoSlice } from "@/lib/dashboard";

export function EstadoDonut({ data }: { data: EstadoSlice[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
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
      </ResponsiveContainer>
      <p className="text-center text-xs text-muted-foreground">
        Total: {total} CCSS
      </p>
    </div>
  );
}
