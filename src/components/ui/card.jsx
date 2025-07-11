export const Card = ({ children, className = "" }) => {
  return <div className={`rounded-xl border bg-white shadow ${className}`}>{children}</div>;
};

export const CardContent = ({ children, className = "p-4" }) => {
  return <div className={className}>{children}</div>;
};
