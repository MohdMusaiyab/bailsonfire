import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-white selection:bg-blue-100">
      <div className="space-y-6 max-w-lg">
        {/* Animated Cricket Ball Placeholder/Icon */}
        <div className="relative inline-block">
          <h1 className="text-9xl font-black text-gray-900 leading-none select-none tracking-tighter">
            404
          </h1>
          <div className="absolute -bottom-2 right-0 w-24 h-1 bg-blue-600 rounded-full animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Clean Bowled! 🏏
          </h2>
          <p className="text-lg text-gray-600 font-medium">
            You&apos;ve wandered into the stands. The page you&apos;re looking for has been hit out of the park.
          </p>
        </div>

        <div className="pt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-gray-900 rounded-2xl hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gray-200"
          >
            ← Back to safe crease
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="pt-12 grid grid-cols-3 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="h-2 bg-gray-200 rounded-full" />
            <div className="h-2 bg-blue-500 rounded-full" />
            <div className="h-2 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
