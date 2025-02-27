const colors = {
  info: 'aqua',
  warn: 'yellow',
  error: 'red',
};

export function log({
  type,
  label,
  message,
  obj,
}: {
  type: 'info' | 'warn' | 'error';
  label: string;
  message: string;
  obj?: any;
}) {
  if (!import.meta.env.DEV) return;

  const color = colors[type];
  if (!obj) {
    console.log(`%c[${label}] ${message}`, `color: ${color}`);
  } else {
    console.log(`%c[${label}] ${message}`, `color: ${color}`, obj);
  }
}
