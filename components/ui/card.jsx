export function Card({ children, className = '' }) {
  return <div className={`border border-slate-200 bg-white ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}
