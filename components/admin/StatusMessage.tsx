interface StatusMessageProps {
  text: string;
  variant?: 'ok' | 'error' | 'neutral';
}

export function StatusMessage({ text, variant = 'neutral' }: StatusMessageProps) {
  const modifier = variant === 'neutral' ? '' : ` ${variant}`;
  return <div className={`status${modifier}`}>{text}</div>;
}
