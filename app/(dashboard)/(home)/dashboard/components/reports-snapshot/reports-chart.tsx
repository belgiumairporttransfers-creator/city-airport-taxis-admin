"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import {
  getGridConfig,
  getXAxisConfig,
  getYAxisConfig,
} from "@/lib/appex-chart-options";
import { CURRENCY_SYMBOL } from "@/lib/utils";
import type { ApexAxisChartSeries } from "apexcharts";

interface ReportsChartProps {
  series: ApexAxisChartSeries;
  chartColor: string;
  height?: number;
  valueFormat?: "currency" | "count";
}

const formatAxisValue = (value: number, valueFormat: "currency" | "count") => {
  if (!Number.isFinite(value)) return "0";

  if (valueFormat === "currency") {
    const rounded = Math.round(value * 100) / 100;
    return `${CURRENCY_SYMBOL}${rounded.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }

  return Math.round(value).toLocaleString("en-US");
};

const ReportsChart = ({
  series,
  chartColor,
  height = 300,
  valueFormat = "count",
}: ReportsChartProps) => {
  const { theme: config } = useThemeStore();
  const { theme: mode } = useTheme();

  const theme = themes.find((theme) => theme.name === config);
  const labelColor = `hsl(${
    theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel
  })`;

  const options: any = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 4,
    },
    colors: [chartColor],
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
      y: {
        formatter: (value: number) => formatAxisValue(value, valueFormat),
      },
    },
    grid: getGridConfig(
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartGird})`
    ),
    fill: {
      type: "gradient",
      colors: chartColor,
      gradient: {
        shadeIntensity: 0.1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [50, 100, 0],
      },
    },
    yaxis: getYAxisConfig(labelColor, (value) =>
      formatAxisValue(value, valueFormat)
    ),
    xaxis: getXAxisConfig(labelColor),
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  };
  return (
    <Chart
      options={options}
      series={series}
      type="area"
      height={height}
      width={"100%"}
    />
  );
};

export default ReportsChart;
