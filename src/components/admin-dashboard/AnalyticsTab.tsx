import { formatCurrency } from "./formatters";
import type { PlatformStats } from "./types";

type Props = {
  stats: PlatformStats;
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const revenueTrend = [45000, 52000, 48000, 61000, 72000, 85000];
const bookingTrend = [27, 31, 29, 37, 43, 51];
const userGrowth = [180, 250, 315, 430, 565, 700];
const serviceDistribution = [
  { color: "#3b82f6", label: "Plumbing", value: 25 },
  { color: "#ec4899", label: "Painting", value: 18 },
  { color: "#8b5cf6", label: "Gardening", value: 12 },
  { color: "#10b981", label: "Cleaning", value: 16 },
  { color: "#f97316", label: "Removal Service", value: 29 },
];

export default function AnalyticsTab({ stats }: Props) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Panel title="Revenue & Bookings Trends">
        <TrendChart />
      </Panel>

      <Panel title="Service Distribution">
        <ServicePie />
      </Panel>

      <Panel title="User Growth">
        <UserGrowthChart />
      </Panel>

      <Panel title="Revenue Summary">
        <RevenueSummary totalFees={stats.platformFees} />
      </Panel>
    </div>
  );
}

function Panel({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="min-h-[396px] rounded-xl border border-[#d9d9df] bg-white p-6">
      <h2 className="text-base font-medium text-black">{title}</h2>
      {children}
    </section>
  );
}

function TrendChart() {
  const width = 560;
  const height = 260;
  const left = 52;
  const right = 48;
  const top = 28;
  const bottom = 26;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const x = (index: number) => left + (chartWidth / (months.length - 1)) * index;
  const yRevenue = (value: number) =>
    top + chartHeight - (value / 100000) * chartHeight;
  const yBookings = (value: number) => top + chartHeight - (value / 60) * chartHeight;
  const revenuePath = revenueTrend
    .map((value, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${yRevenue(value)}`)
    .join(" ");
  const bookingPath = bookingTrend
    .map((value, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${yBookings(value)}`)
    .join(" ");

  return (
    <div className="mt-7">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[260px] w-full overflow-visible"
        role="img"
        aria-label="Revenue and bookings trend chart"
      >
        {[0, 25000, 50000, 75000, 100000].map((value) => (
          <g key={value}>
            <line
              x1={left}
              x2={width - right}
              y1={yRevenue(value)}
              y2={yRevenue(value)}
              stroke="#d1d5dc"
              strokeDasharray="3 3"
            />
            <text
              x={left - 8}
              y={yRevenue(value) + 4}
              textAnchor="end"
              className="fill-[#6b7280] text-[12px]"
            >
              {value}
            </text>
          </g>
        ))}
        {[0, 15, 30, 45, 60].map((value) => (
          <text
            key={value}
            x={width - right + 8}
            y={yBookings(value) + 4}
            className="fill-[#6b7280] text-[12px]"
          >
            {value}
          </text>
        ))}
        {months.map((month, index) => (
          <g key={month}>
            <line
              x1={x(index)}
              x2={x(index)}
              y1={top}
              y2={height - bottom}
              stroke="#d1d5dc"
              strokeDasharray="3 3"
            />
            <text
              x={x(index)}
              y={height - 8}
              textAnchor="middle"
              className="fill-[#6b7280] text-[12px]"
            >
              {month}
            </text>
          </g>
        ))}
        <line x1={left} x2={left} y1={top} y2={height - bottom} stroke="#9ca3af" />
        <line
          x1={left}
          x2={width - right}
          y1={height - bottom}
          y2={height - bottom}
          stroke="#9ca3af"
        />
        <line
          x1={width - right}
          x2={width - right}
          y1={top}
          y2={height - bottom}
          stroke="#9ca3af"
        />
        <path d={revenuePath} fill="none" stroke="#f97316" strokeWidth="2" />
        <path d={bookingPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
        {revenueTrend.map((value, index) => (
          <circle
            key={`revenue-${months[index]}`}
            cx={x(index)}
            cy={yRevenue(value)}
            r="3"
            fill="white"
            stroke="#f97316"
            strokeWidth="2"
          />
        ))}
        {bookingTrend.map((value, index) => (
          <circle
            key={`booking-${months[index]}`}
            cx={x(index)}
            cy={yBookings(value)}
            r="3"
            fill="white"
            stroke="#3b82f6"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-center gap-4 text-base">
        <Legend color="#f97316" label="Revenue (RWF)" />
        <Legend color="#3b82f6" label="Bookings" />
      </div>
    </div>
  );
}

function ServicePie() {
  return (
    <div className="relative mx-auto mt-16 flex h-[230px] max-w-[480px] items-center justify-center">
      <div
        className="h-[200px] w-[200px] rounded-full"
        style={{
          background:
            "conic-gradient(#3b82f6 0 25%, #ec4899 25% 43%, #8b5cf6 43% 55%, #10b981 55% 71%, #f97316 71% 100%)",
        }}
      />
      {serviceDistribution.map((item, index) => (
        <span
          key={item.label}
          className={`absolute text-xs font-medium`}
          style={{
            color: item.color,
            ...pieLabelPosition(index),
          }}
        >
          {item.label} {item.value}%
        </span>
      ))}
    </div>
  );
}

function pieLabelPosition(index: number): React.CSSProperties {
  const positions: React.CSSProperties[] = [
    { right: 12, top: 10 },
    { right: 6, top: 154 },
    { bottom: 0, left: "50%", transform: "translateX(-8%)" },
    { left: 22, top: 170 },
    { left: 18, top: 18 },
  ];
  return positions[index];
}

function UserGrowthChart() {
  const width = 560;
  const height = 260;
  const left = 52;
  const top = 20;
  const bottom = 34;
  const chartHeight = height - top - bottom;
  const chartWidth = width - left - 36;
  const barGap = chartWidth / userGrowth.length;
  const y = (value: number) => top + chartHeight - (value / 800) * chartHeight;

  return (
    <div className="mt-7">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[260px] w-full"
        role="img"
        aria-label="User growth bar chart"
      >
        {[0, 200, 400, 600, 800].map((value) => (
          <g key={value}>
            <line
              x1={left}
              x2={width - 20}
              y1={y(value)}
              y2={y(value)}
              stroke="#d1d5dc"
              strokeDasharray="3 3"
            />
            <text
              x={left - 8}
              y={y(value) + 4}
              textAnchor="end"
              className="fill-[#6b7280] text-[12px]"
            >
              {value}
            </text>
          </g>
        ))}
        {months.map((month, index) => (
          <g key={month}>
            <line
              x1={left + barGap * index + barGap / 2}
              x2={left + barGap * index + barGap / 2}
              y1={top}
              y2={height - bottom}
              stroke="#d1d5dc"
              strokeDasharray="3 3"
            />
            <rect
              x={left + barGap * index + 9}
              y={y(userGrowth[index])}
              width={30}
              height={height - bottom - y(userGrowth[index])}
              fill="#3b82f6"
            />
            <text
              x={left + barGap * index + barGap / 2}
              y={height - 8}
              textAnchor="middle"
              className="fill-[#6b7280] text-[12px]"
            >
              {month}
            </text>
          </g>
        ))}
        <line x1={left} x2={left} y1={top} y2={height - bottom} stroke="#9ca3af" />
        <line
          x1={left}
          x2={width - 20}
          y1={height - bottom}
          y2={height - bottom}
          stroke="#9ca3af"
        />
      </svg>
      <div className="mt-2 flex items-center justify-center gap-3 text-base">
        <Legend color="#f97316" label="Homeowners" square />
        <Legend color="#3b82f6" label="Providers" square />
      </div>
    </div>
  );
}

function RevenueSummary({ totalFees }: { totalFees: number }) {
  const rows = [
    ["This Week", 15400],
    ["This Month", 62250],
    ["This Quarter", 185000],
    ["Year to Date", 425000],
  ] as const;

  return (
    <div className="mt-7 max-w-[560px]">
      <dl className="space-y-5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <dt className="text-base text-black">{label}</dt>
            <dd className="text-base font-medium text-[#00a63e]">
              {formatCurrency(value)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#d9d9df] pt-5">
        <p className="text-lg font-semibold text-black">Total Platform Fees</p>
        <p className="text-lg font-semibold text-[#ff5f00]">
          {formatCurrency(totalFees)}
        </p>
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
  square = false,
}: {
  color: string;
  label: string;
  square?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1" style={{ color }}>
      <span
        className={square ? "h-3 w-3" : "h-2 w-2 rounded-full border-2"}
        style={square ? { backgroundColor: color } : { borderColor: color }}
      />
      {label}
    </span>
  );
}
