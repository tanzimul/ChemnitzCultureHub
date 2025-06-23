import Link from "next/link";
import { useState } from "react";

export default function Navbar({ user, logout }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<nav className="bg-white shadow-lg text-black">
			<div className="container mx-auto px-4">
				<div className="flex justify-between items-center py-4">
					<Link href="/" className="text-2xl font-bold text-primary-600">
						ChemnitzCultureHub
					</Link>

					{/* Desktop Menu */}
					<div className="hidden md:flex items-center space-x-6">
						<Link
							href="/samples"
							className="text-gray-700 hover:text-primary-600 transition-colors"
						>
							Samples
						</Link>

						{user ? (
							<>
								<Link
									href="/dashboard"
									className="text-gray-700 hover:text-primary-600 transition-colors"
								>
									Dashboard
								</Link>
								<Link
									href="/profile"
									className="text-gray-700 hover:text-primary-600 transition-colors"
								>
									Profile
								</Link>
								<button
									onClick={logout}
									className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
								>
									Logout
								</button>
							</>
						) : (
							<>
								<Link
									href="/auth/login"
									className="text-gray-700 hover:text-primary-600 transition-colors"
								>
									Login
								</Link>
								<Link
									href="/auth/register"
									className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
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
							<div className="w-full h-0.5 bg-gray-700"></div>
							<div className="w-full h-0.5 bg-gray-700"></div>
							<div className="w-full h-0.5 bg-gray-700"></div>
						</div>
					</button>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden py-4 border-t border-gray-200">
						<div className="flex flex-col space-y-4">
							<Link
								href="/samples"
								className="text-gray-700 hover:text-primary-600 transition-colors"
							>
								Samples
							</Link>

							{user ? (
								<>
									<Link
										href="/dashboard"
										className="text-gray-700 hover:text-primary-600 transition-colors"
									>
										Dashboard
									</Link>
									<Link
										href="/profile"
										className="text-gray-700 hover:text-primary-600 transition-colors"
									>
										Profile
									</Link>
									<button
										onClick={logout}
										className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-left"
									>
										Logout
									</button>
								</>
							) : (
								<>
									<Link
										href="/auth/login"
										className="text-gray-700 hover:text-primary-600 transition-colors"
									>
										Login
									</Link>
									<Link
										href="/auth/register"
										className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
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
