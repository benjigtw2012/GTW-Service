import React from 'react';

export function Button({ children, className = '', variant = 'default', asChild = false, ...props }) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50';
  const styles = variant === 'outline'
    ? 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
    : 'bg-slate-900 text-white hover:bg-slate-800';
  const classes = `${base} ${styles} ${className}`;
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { className: `${classes} ${children.props.className || ''}` });
  }
  return <button className={classes} {...props}>{children}</button>;
}
