import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-xl mx-auto text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-8">Choose an exercise</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link
            href="/arrangement"
            className="group rounded-xl border border-black/10 dark:border-white/10 p-6 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition shadow-sm hover:shadow md:p-8"
          >
            <div className="text-lg md:text-xl font-medium mb-2">Word Arrangement</div>
            <div className="text-sm text-black/60 dark:text-white/60">Arrange letters to form words</div>
          </Link>
          <Link
            href="/matching"
            className="group rounded-xl border border-black/10 dark:border-white/10 p-6 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition shadow-sm hover:shadow md:p-8"
          >
            <div className="text-lg md:text-xl font-medium mb-2">Matching </div>
            <div className="text-sm text-black/60 dark:text-white/60">Connect pairs and verify</div>
          </Link>
        </div>
      </div>
    </main>
  );
}