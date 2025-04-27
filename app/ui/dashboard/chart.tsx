"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, Cell } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "期权收益记录"

const chartData = [
  { date: '2024-04-01', value: 222 },
  { date: '2024-04-02', value: -97 },
  { date: '2024-04-03', value: 167 },
  { date: '2024-04-04', value: -242 },
  { date: '2024-04-05', value: 373 },
  { date: '2024-04-06', value: 301 },
  { date: '2024-04-07', value: -245 },
  { date: '2024-04-08', value: -97 },
  { date: '2024-04-09', value: 167 },
  { date: '2024-04-10', value: -242 },
  { date: '2024-04-11', value: 373 },
  { date: '2024-04-12', value: 301 },
  { date: '2024-04-13', value: -245 },
  { date: '2024-04-14', value: 222 },
  { date: '2024-04-15', value: -97 },
  { date: '2024-04-16', value: 167 },
  { date: '2024-04-17', value: -242 },
  { date: '2024-04-18', value: 373 },
  { date: '2024-04-19', value: 301 },
  { date: '2024-04-20', value: -245 },
  { date: '2024-04-21', value: 222 },
  { date: '2024-04-22', value: -97 },
  { date: '2024-04-23', value: 167 },
  { date: '2024-04-24', value: -242 },
  { date: '2024-04-25', value: 373 },
  { date: '2024-04-26', value: 301 },
  { date: '2024-04-27', value: -245 },
  { date: '2024-04-28', value: 222 },
  { date: '2024-04-29', value: -97 },
  { date: '2024-04-30', value: 167 },
]

const chartConfig = {
  views: {
    label: "Page Views",
  },
  value: {
    label: "总收益",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function Chart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("value")

  const total = React.useMemo(
    () => ({
      value: chartData.reduce((acc, curr) => acc + curr.value, 0),
    }),
    []
  )

  // 定义正负值的颜色 - Robinhood风格
  const getBarColor = (value: number) => {
    return value >= 0 ? "#00C805" : "#FF5000"
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>期权收益记录</CardTitle>
          <CardDescription>
            记录期权收益，并计算总收益
          </CardDescription>
        </div>
        <div className="flex">
          {["value"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString() + '$'}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                return value
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return value
                  }}
                />
              }
            />
            <Bar dataKey={activeChart}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
