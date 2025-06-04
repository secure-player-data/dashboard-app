export function DisableWhen({
  children,
  isDisabled,
}: {
  children: React.ReactNode;
  isDisabled: boolean;
}) {
  return (
    <div
      className={`flex items-center transition-opacity ${isDisabled ? 'opacity-30 pointer-events-none' : ''}`}
    >
      {children}
    </div>
  );
}
