export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div
        className="h-8 w-48 mb-6 rounded"
        style={{ backgroundColor: "var(--bg-subtle)" }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
            }}
          />
        ))}
      </div>
      <div
        className="h-64 rounded-xl"
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
        }}
      />
    </div>
  );
}
