import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { user, logout } = useAuth();

	return (
		<nav className="bg-gray-900 shadow-lg text-white">
			<div className="w-full h-full max-w-0xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-4">
					<Link href="/" className="text-2xl font-bold text-primary-300">
						ChemnitzCultureHub
					</Link>

					{/* Desktop Menu */}
					<div className="hidden md:flex items-center space-x-6">
						{user ? (
							<>
								<Link
									href="/dashboard"
									className="text-gray-200 hover:text-primary-300 transition-colors"
								>
									Dashboard
								</Link>
								<Link
									href="/profile"
									className="text-gray-200 hover:text-primary-300 transition-colors"
								>
									Profile
								</Link>
								<button
									onClick={logout}
									className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
								>
									Logout
								</button>
							</>
						) : (
							<>
								<Link
									href="/auth/login"
									className="text-gray-200 hover:text-primary-300 transition-colors"
								>
									Login
								</Link>
								<Link
									href="/auth/register"
									className="bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
								>
									Register
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="md:hidden p-2"
					>
						<div className="w-6 h-6 flex flex-col justify-around">
							<div className="w-full h-0.5 bg-gray-200"></div>
							<div className="w-full h-0.5 bg-gray-200"></div>
							<div className="w-full h-0.5 bg-gray-200"></div>
						</div>
					</button>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden py-4 border-t border-gray-700 bg-gray-900">
						<div className="flex flex-col space-y-4">
							{user ? (
								<>
									<Link
										href="/dashboard"
										className="text-gray-200 hover:text-primary-300 transition-colors"
									>
										Dashboard
									</Link>
									<Link
										href="/profile"
										className="text-gray-200 hover:text-primary-300 transition-colors"
									>
										Profile
									</Link>
									<button
										onClick={logout}
										className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-left"
									>
										Logout
									</button>
								</>
							) : (
								<>
									<Link
										href="/auth/login"
										className="text-gray-200 hover:text-primary-300 transition-colors"
									>
										Login
									</Link>
									<Link
										href="/auth/register"
										className="bg-primary-700 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors text-center"
									>
										Register
									</Link>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
