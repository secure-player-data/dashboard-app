export function SeasonsSkeleton() {
  return (
    <div className="grid gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className="h-[126px] bg-muted rounded-md animate-pulse" />
      ))}
    </div>
  );
}
