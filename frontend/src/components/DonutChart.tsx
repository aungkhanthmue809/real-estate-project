interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  total: number;
  centerLabel?: string;
  compactCenterValue?: boolean;
  ariaLabel: string;
  size?: number;
}

function formatCompactNumber(value: number) {
  const format = (scaled: number, suffix: string) => `${scaled.toFixed(1).replace(/\.0$/, '')}${suffix}`;
  if (Math.abs(value) >= 1_000_000) return format(value / 1_000_000, 'M');
  if (Math.abs(value) >= 1_000) return format(value / 1_000, 'K');
  return value.toLocaleString();
}

export function DonutChart({ segments, total, centerLabel, compactCenterValue = false, ariaLabel, size = 112 }: DonutChartProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const usableSegments = segments.filter((segment) => segment.value > 0);
  let offset = 0;

  return (
    <div className="admin-donut" role="img" aria-label={ariaLabel} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="admin-donut-track" cx="50" cy="50" r={radius} />
        {usableSegments.map((segment) => {
          const length = total > 0 ? (segment.value / total) * circumference : 0;
          const circle = <circle key={segment.label} className="admin-donut-segment" cx="50" cy="50" r={radius} stroke={segment.color} strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} />;
          offset += length;
          return circle;
        })}
      </svg>
      <span className="admin-donut-center"><strong>{compactCenterValue ? formatCompactNumber(total) : total.toLocaleString()}</strong>{centerLabel && <small>{centerLabel}</small>}</span>
    </div>
  );
}
