const COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-teal-500',
];

interface AvatarProps {
  name: string;
  className?: string;
}

export function Avatar({ name, className = '' }: AvatarProps) {
  const initials =
    name
      .split(/[\s_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?';

  const colorIndex = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % COLORS.length;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full text-white font-semibold select-none ${COLORS[colorIndex]} ${className}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
