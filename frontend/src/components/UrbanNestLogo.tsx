interface UrbanNestLogoProps {
  className?: string;
}

export function UrbanNestLogo({ className = '' }: UrbanNestLogoProps) {
  const classes = ['urbannest-brand-mark', className].filter(Boolean).join(' ');

  return (
    <img
      src="/urbannest-logo.png"
      alt=""
      aria-hidden="true"
      className={classes}
    />
  );
}
