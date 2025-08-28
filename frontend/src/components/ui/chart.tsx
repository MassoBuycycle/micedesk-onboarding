import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const THEMES = { light: "" } as const

interface ChartProps {
  data: any[]
  theme?: keyof typeof THEMES
}

export function Chart({ data, theme = "light" }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="total"
          stroke="currentColor"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
