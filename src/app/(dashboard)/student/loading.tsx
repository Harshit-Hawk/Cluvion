// Route-level loading skeleton — shown instantly during page transitions
// This prevents blank screens and provides perceived performance improvement

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 w-full animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />

      {/* Card skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 h-44 shadow-sm"
          />
        ))}
      </div>
    </div>
  );
}
