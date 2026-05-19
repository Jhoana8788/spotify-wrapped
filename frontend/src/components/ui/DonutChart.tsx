"use client";

type Slice = { label: string; value: number; color: string };

type Props = {
  slices: Slice[];
  size?: number;
  thickness?: number;
  center?: { label: string; value: string };
};

const DEFAULT_COLORS = ["#1DB954","#8b5cf6","#ec4899","#f97316","#06b6d4","#f59e0b","#6366f1","#f43f5e"];

export default function DonutChart({ slices, size = 200, thickness = 24, center }: Props) {
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;

  let cumulative = 0;
  const arcs = slices.map((slice, i) => {
    const fraction = slice.value / total;
    const dasharray = `${fraction * circumference} ${circumference}`;
    const rotation = (cumulative / total) * 360 - 90;
    cumulative += slice.value;
    return (
      <circle
        key={i}
        cx={cx} cy={cy} r={radius}
        fill="none"
        stroke={slice.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
        strokeWidth={thickness}
        strokeDasharray={dasharray}
        strokeLinecap="butt"
        transform={`rotate(${rotation} ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
    );
  });

  return (
    <div className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1c1c24" strokeWidth={thickness} />
        {arcs}
      </svg>
      {center && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold">{center.value}</p>
          <p className="text-xs text-textMuted">{center.label}</p>
        </div>
      )}
    </div>
  );
}