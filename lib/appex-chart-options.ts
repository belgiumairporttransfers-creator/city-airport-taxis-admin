type YAxisLabelFormatter = (value: number) => string;

export const getYAxisConfig = (
  color: string,
  formatter?: YAxisLabelFormatter
): {
  labels: {
    style: { colors: string; fontFamily: string };
    formatter: YAxisLabelFormatter;
  };
} => ({
  labels: {
    style: {
      colors: color,
      fontFamily: "Inter",
    },
    formatter:
      formatter ??
      ((value: number) => {
        if (!Number.isFinite(value)) return "0";
        const rounded = Math.round(value * 100) / 100;
        return Number.isInteger(rounded)
          ? String(rounded)
          : rounded.toFixed(2);
      }),
  },
});


export const getXAxisConfig = (colors: string): { } => ({
  categories: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  labels: getLabel(colors),
  axisBorder: {
    show: false,
  },
  axisTicks: {
    show: false,
  },
});

export const getLabel = (colors:any): {  } => ({
  style: {
    colors: colors,
    fontFamily: "Inter",
  },
});


export const getGridConfig = (color: string): { show: boolean; borderColor: string; strokeDashArray: number; position: string; } => ({
  show: true,
  borderColor: color,
  strokeDashArray: 10,
  position: "back",
});