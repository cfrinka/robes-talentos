export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="field-error">{message}</div>;
}
