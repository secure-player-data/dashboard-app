export function HeaderSkeleton() {
  return (
    <>
      <div className="grid gap-4 mb-8 @md:grid-cols-2 @2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-[130px] bg-muted animate-pulse rounded-md"
          />
        ))}
      </div>
    </>
  );
}
