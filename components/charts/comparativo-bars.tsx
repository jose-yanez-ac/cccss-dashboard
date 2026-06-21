"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { COLORS } from "@/lib/constants";
import { formatUF } from "@/lib/format";

export function ComparativoBars({
  contratado,
  facturado,
  ds153,
  proyeccion,
}: {
  contratado: number;
  facturado: number;
  ds153: number;
  proyeccion: number;
}) {
  const data = [
    { name: "Contratado", value: contratado, color: COLORS.petrol },
    { name: "Facturado", value: facturado, color: COLORS.green },
    { name: "DS N°153", value: ds153, color: COLORS.violet },
    { name: "Proyección", value: proyeccion, color: COLORS.blue },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 8, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          tickFormatter={(v) => formatUF(Number(v))}
          fontSize={11}
          width={84}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          formatter={(value) => `${formatUF(Number(value))} UF`}
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
