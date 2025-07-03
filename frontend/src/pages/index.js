import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4">
			<div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-10 mt-16 mb-8">
				<h1 className="text-4xl font-extrabold text-primary-700 mb-4 text-center">
					ChemnitzCultureHub
				</h1>
				<p className="text-lg text-gray-700 text-center mb-6">
					Discover, collect, and review the cultural treasures of Chemnitz.
					<br />
					Explore theatres, museums, artworks, and more—on the map or in a list.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
					<Link
						href="/auth/register"
						className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-lg shadow hover:bg-green-700 transition text-center"
					>
						<span>Get Started</span>
						<span aria-hidden="true">🚀</span>
					</Link>
					<Link
						href="/auth/login"
						className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-lg shadow hover:bg-indigo-700 transition text-center"
					>
						<span>Sign In</span>
						<span aria-hidden="true">🔑</span>
					</Link>
				</div>
				<ul className="text-gray-600 text-sm space-y-2 mt-4">
					<li>• Search and filter cultural sites by category or keyword</li>
					<li>• View sites on an interactive map (OpenStreetMap & Leaflet)</li>
					<li>• Collect and review places you visit</li>
					<li>• Build your favorites and inventory—trade with others!</li>
				</ul>
			</div>
			<p className="text-xs text-gray-400 mt-2 text-center">
				Data powered by OpenStreetMap &amp; Chemnitz open data
			</p>
		</div>
	);
}
