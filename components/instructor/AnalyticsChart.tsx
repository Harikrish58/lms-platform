"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

export interface ChartDataProps {
  name: string;
  total: number;
}

interface AnalyticsChartProps {
  data: ChartDataProps[];
  title?: string;
  valuePrefix?: string;
  dataKey?: string;
  barColor?: string;
}

export default function AnalyticsChart({
  data,
  title = "Revenue Overview",
  valuePrefix = "$",
  dataKey = "total",
  barColor = "#4f46e5",
}: AnalyticsChartProps) {
  const hasData = Array.isArray(data) && data.length > 0;

  if (!hasData) {
    return (
      <div className="flex h-[350px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-600">
            No analytics data available
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Metrics will appear once activity is recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="h-[350px] w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Chart Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>

          <p className="mt-1 text-sm text-slate-500">
            Performance metrics overview
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="#e2e8f0"
          />

          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="#94a3b8"
            dy={10}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="#94a3b8"
            tickFormatter={(value: number) => `${valuePrefix}${value}`}
          />

          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            contentStyle={{
              borderRadius: "14px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
              backgroundColor: "#ffffff",
            }}
            formatter={(
              value: ValueType | undefined,
              _name: NameType | undefined,
            ) => {
              if (value === undefined || value === null) {
                return ["N/A", title];
              }

              if (Array.isArray(value)) {
                return [value.join(", "), title];
              }

              return [`${valuePrefix}${value}`, title];
            }}
          />

          <Bar
            dataKey={dataKey}
            fill={barColor}
            radius={[8, 8, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
