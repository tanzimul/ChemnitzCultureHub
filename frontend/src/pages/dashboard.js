"use client";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import Review from "@/components/Review/Review";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import InventoryList from "@/components/CulturalCollection/InventoryList";
import TradeForm from "@/components/CulturalCollection/TradeForm";

// Dynamically import the map component (client-side only)
const CulturalMap = dynamic(
	() => import("@/components/CulturalMap/CulturalMap"),
	{ ssr: false }
);

// Helper to extract category from a site's properties
function getCategory(props) {
	return (
		props.category ||
		props.Category ||
		props.tourism ||
		props.amenity ||
		props.artwork_type ||
		props.museum ||
		props.gallery ||
		props.theatre ||
		"Uncategorized"
	);
}

// Capitalize first letter
function capitalize(str) {
	if (!str) return "";
	return str.charAt(0).toUpperCase() + str.slice(1);
}

// Check if user has reviewed a site
function hasUserReviewed(siteId, userId, siteReviews) {
	const reviews = siteReviews[siteId];
	if (!Array.isArray(reviews)) return false;
	return reviews.some((review) => {
		const reviewUserId =
			typeof review.user === "string" ? review.user : review.user?._id;
		return reviewUserId === userId;
	});
}

export default function DashboardPage() {
	// State declarations
	const router = useRouter();
	const { user } = useAuth();
	const userId = user?._id || user?.id;
	const [token, setToken] = useState("");
	const [favorites, setFavorites] = useState([]);
	const [categoryFilter, setCategoryFilter] = useState("");
	const [keyword, setKeyword] = useState("");
	const [allCategories, setAllCategories] = useState([]);
	const [userLocation, setUserLocation] = useState(null);
	const [visitedSites, setVisitedSites] = useState([]);
	const [favPage, setFavPage] = useState(1);
	const [visitedPage, setVisitedPage] = useState(1);
	const [reviewSite, setReviewSite] = useState(null);
	const [siteReviews, setSiteReviews] = useState({});
	const [reviewsLoading, setReviewsLoading] = useState(false);
	const [inventory, setInventory] = useState([]);
	const [showInventory, setShowInventory] = useState(false);
	const [showAllFavorites, setShowAllFavorites] = useState(false);
	const [showAllVisited, setShowAllVisited] = useState(false);

	const FAVS_PER_PAGE = 10;
	const VISITED_PER_PAGE = 10;

	const favStart = (favPage - 1) * FAVS_PER_PAGE;
	const favEnd = favStart + FAVS_PER_PAGE;
	const paginatedFavorites = favorites.slice(favStart, favEnd);

	const visitedStart = (visitedPage - 1) * VISITED_PER_PAGE;
	const visitedEnd = visitedStart + VISITED_PER_PAGE;
	const paginatedVisited = visitedSites.slice(visitedStart, visitedEnd);

	// Get token from cookies on mount
	useEffect(() => {
		const stored = Cookies.get("token");
		if (stored) setToken(stored);
	}, []);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (user === null) return; // Still loading
		if (!user) {
			router.replace("/");
		}
	}, [user, router]);

	// Fetch user, favorites, location, visited sites on token change
	useEffect(() => {
		if (!token) return;

		const fetchFavorites = async () => {
			try {
				const res = await api.get("/users/favorites");
				setFavorites(res.data);
			} catch (err) {
				console.error("Error fetching favorites:", err);
			}
		};

		const fetchUserLocation = async () => {
			try {
				const res = await api.get("/users/me", {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (res.data.currentLocation) {
					setUserLocation(res.data.currentLocation);
				}
			} catch (err) {
				console.error("Error fetching user location:", err);
			}
		};

		const fetchVisitedSites = async () => {
			try {
				const res = await api.get("/users/visited-sites");
				setVisitedSites(res.data);
			} catch (err) {
				if (err.response && err.response.status === 400) {
					toast.error(
						"Please save your current location to see visited sites."
					);
					setVisitedSites([]);
				} else {
					console.error("Error fetching visited sites:", err);
				}
			}
		};

		fetchFavorites();
		fetchUserLocation();
		fetchVisitedSites();
	}, [token]);

	// Fetch all sites to get categories
	useEffect(() => {
		if (!token) return;
		const fetchSites = async () => {
			try {
				const res = await api.get("/cultural-sites", {
					headers: { Authorization: `Bearer ${token}` },
				});
				const sites = res.data;
				const categories = Array.from(
					new Set(sites.map((site) => getCategory(site.properties || site)))
				);
				setAllCategories(categories);
			} catch (err) {
				console.error("Error fetching sites for categories:", err);
			}
		};
		fetchSites();
	}, [token]);

	// Fetch reviews for paginated visited sites
	useEffect(() => {
		const fetchAllSiteReviews = async () => {
			if (visitedSites.length === 0) return;
			setReviewsLoading(true);
			const reviewsObj = {};
			const paginated = visitedSites.slice(visitedStart, visitedEnd);

			await Promise.all(
				paginated.map(async (site) => {
					try {
						const res = await api.get(`/reviews/${site._id}`);
						reviewsObj[site._id] = res.data;
					} catch (error) {
						console.error(`Error fetching reviews for ${site._id}:`, error);
						reviewsObj[site._id] = [];
					}
				})
			);

			setSiteReviews((prev) => ({ ...prev, ...reviewsObj }));
			setReviewsLoading(false);
		};

		fetchAllSiteReviews();
	}, [visitedSites, visitedPage]);

	// Handle review button click
	const handleReviewClick = (site) => {
		setReviewSite(site);
	};

	// Handle location update
	const handleGetLocation = () => {
		if (!window.confirm("Do you allow us to access your current location?"))
			return;

		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const { latitude, longitude } = position.coords;
					try {
						await api.put(
							"/users/location",
							{ latitude, longitude },
							{ headers: { Authorization: `Bearer ${token}` } }
						);
						const res = await api.get("/users/me", {
							headers: { Authorization: `Bearer ${token}` },
						});
						if (res.data.currentLocation) {
							setUserLocation(res.data.currentLocation);
						}
						const visitedRes = await api.get("/users/visited-sites");
						setVisitedSites(visitedRes.data);
						toast.success("Location saved!");
					} catch (err) {
						toast.error("Failed to save location.");
					}
				},
				() => {
					toast.error("Unable to retrieve your location.");
				}
			);
		} else {
			toast.error("Geolocation is not supported by your browser.");
		}
	};

	// Add favorite
	const addFavorite = async (site) => {
		try {
			const res = await api.post(
				"/users/favorites",
				{ siteId: site._id },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setFavorites(res.data.favorites || []);
			toast.success("Added to favorites!");
		} catch (error) {
			if (error.response && error.response.status === 400) {
				toast.error(error.response.data.message);
			} else {
				console.error("Error adding favorite:", error);
				toast.error("Failed to add favorite.");
			}
		}
	};

	// Remove favorite
	const removeFavorite = async (id) => {
		try {
			const res = await api.delete(`/users/favorites/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setFavorites(res.data.favorites || []);
		} catch (error) {
			console.error("Error removing favorite:", error);
		}
	};

	const fetchInventory = async () => {
		try {
			const res = await api.get("/users/me");
			setInventory(res.data.inventory || []);
		} catch (err) {
			console.error("Error fetching inventory:", err);
		}
	};

	// Show loading while checking auth
	if (user === null) return <div>Loading...</div>;
	if (!user) return null;

	return (
		<div className="pt-0 h-[calc(100vh-64px)]">
			<Toaster
				position="top-right"
				containerClassName="mt-16"
				toastOptions={{
					style: { marginTop: "4rem" },
				}}
			/>
			<div className="flex h-full">
				{/* Sidebar */}
				<aside className="relative z-10 w-full lg:w-[40%] bg-white border-r border-gray-200 flex-shrink-0 flex flex-col h-screen max-h-screen overflow-y-auto shadow-lg">
					<div className="px-6 py-4 border-b border-gray-100">
						<h1 className="text-2xl font-bold mb-2 px-2">Dashboard</h1>
						<div className="flex flex-col gap-3">
							<div className="flex gap-2">
								<input
									type="text"
									placeholder="Search cultural sites..."
									className="w-full bg-white border border-gray-300 text-sm text-gray-700 rounded-xl py-2.5 pl-4 pr-10 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
									value={keyword}
									onChange={(e) => setKeyword(e.target.value)}
								/>
								<button
									onClick={() => {
										/* Optionally trigger search/filter logic here */
									}}
									className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3 flex items-center justify-center transition"
									aria-label="Search"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
										/>
									</svg>
								</button>
							</div>
							<div className="flex gap-2">
								<select
									onChange={(e) => setCategoryFilter(e.target.value)}
									value={categoryFilter}
									className="w-full bg-white border border-gray-300 text-sm text-gray-700 rounded-xl py-2.5 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
								>
									<option value="">All Categories</option>
									{allCategories.map((cat) => (
										<option key={cat} value={cat}>
											{capitalize(cat)}
										</option>
									))}
								</select>
								<button
									onClick={() => {
										setKeyword("");
										setCategoryFilter("");
									}}
									className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl px-3 py-2 font-medium transition"
									aria-label="Clear all filters"
								>
									Clear
								</button>
							</div>
							<div className="flex gap-3">
								<button
									onClick={handleGetLocation}
									className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition"
								>
									<span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5 inline-block mr-1"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.343 17.657l-1.414 1.414M17.657 17.657l-1.414-1.414M6.343 6.343L4.929 4.929M12 8a4 4 0 100 8 4 4 0 000-8z"
											/>
										</svg>
									</span>
									Save My Current Location
								</button>
								{userId && (
									<button
										onClick={() => {
											navigator.clipboard.writeText(userId);
											toast.success(
												"Your User ID has been copied to the clipboard!"
											);
										}}
										className="flex items-center justify-center gap-2 bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-semibold shadow hover:bg-gray-200 transition"
									>
										<span>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5 inline-block mr-1"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
										</span>
										Copy My User ID
									</button>
								)}
							</div>
						</div>
					</div>
					<div className="flex-1 overflow-y-auto px-6 py-4">
						<div className="mb-4">
							<button
								onClick={() => setShowInventory((v) => !v)}
								className="flex items-center gap-2 text-primary-700 font-semibold mb-2 focus:outline-none"
							>
								<span>{showInventory ? "▼" : "►"}</span>
								My Inventory
							</button>
							{showInventory && <InventoryList onLoaded={setInventory} />}
						</div>

						<TradeForm inventory={inventory} />

						{/* My Favorites Section */}
						<div className="mt-6">
							<h2 className="text-xl font-semibold mb-2">My Favorites</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
								{(showAllFavorites
									? paginatedFavorites
									: paginatedFavorites.slice(0, 4)
								)
									.filter((site) => site && site.name)
									.map((site, idx) => (
										<div
											key={site._id}
											className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col gap-2 hover:shadow-lg transition"
										>
											<div className="flex justify-between items-center">
												<div className="font-bold text-lg text-primary-700">
													{site.name}
												</div>
												<button
													onClick={() => removeFavorite(site._id)}
													className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition text-xs"
													aria-label="Remove from favorites"
												>
													Remove
												</button>
											</div>
											<div className="text-sm text-gray-600">
												Category:{" "}
												<span className="font-medium">
													{site.category || site.properties?.category}
												</span>
											</div>
											<div className="text-xs text-gray-500 break-all">
												Website:{" "}
												{site.website || site.properties?.website ? (
													<a
														href={site.website || site.properties?.website}
														target="_blank"
														rel="noopener noreferrer"
														className="text-blue-600 underline"
													>
														{site.website || site.properties?.website}
													</a>
												) : (
													<span>-</span>
												)}
											</div>
											<div className="text-xs text-gray-500">
												Phone: {site.phone || site.properties?.phone || "-"}
											</div>
											<div className="text-xs text-gray-500">
												Description: {site.description || "-"}
											</div>
											<div className="text-xs text-gray-400">
												Location:{" "}
												{site.location && site.location.coordinates
													? `${site.location.coordinates[1]}, ${site.location.coordinates[0]}`
													: "-"}
											</div>
										</div>
									))}
							</div>
							{paginatedFavorites.length > 4 && (
								<div className="flex justify-center my-5">
									<button
										onClick={() => setShowAllFavorites((v) => !v)}
										className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium shadow transition"
										aria-label={
											showAllFavorites
												? "Show less favorites"
												: "See all favorites"
										}
									>
										{showAllFavorites ? (
											<>
												<span>Show Less</span>
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													strokeWidth={2}
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M19 15l-7-7-7 7"
													/>
												</svg>
											</>
										) : (
											<>
												<span>See All</span>
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													strokeWidth={2}
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M5 9l7 7 7-7"
													/>
												</svg>
											</>
										)}
									</button>
								</div>
							)}
							{/* Pagination Controls */}
							{showAllFavorites && (
								<div className="flex justify-end items-center gap-2 mt-2 mb-2 px-2">
									<button
										onClick={() => setFavPage((p) => Math.max(1, p - 1))}
										disabled={favPage === 1}
										className="px-2 py-1 rounded bg-gray-400 text-black-700 hover:bg-gray-200 disabled:opacity-50 transition"
									>
										Prev
									</button>
									{Array.from(
										{ length: Math.ceil(favorites.length / FAVS_PER_PAGE) },
										(_, i) => (
											<button
												key={i}
												onClick={() => setFavPage(i + 1)}
												className={`px-2 py-1 rounded ${
													favPage === i + 1
														? "bg-gray-600 text-white"
														: "bg-gray-50 text-black-700 hover:bg-gray-200"
												} transition`}
											>
												{i + 1}
											</button>
										)
									)}
									<button
										onClick={() =>
											setFavPage((p) =>
												p < Math.ceil(favorites.length / FAVS_PER_PAGE)
													? p + 1
													: p
											)
										}
										disabled={
											favPage >= Math.ceil(favorites.length / FAVS_PER_PAGE)
										}
										className="px-2 py-1 rounded bg-gray-400 text-black-700 hover:bg-gray-200 disabled:opacity-50 transition"
									>
										Next
									</button>
								</div>
							)}
						</div>

						{/* Visited Sites Section */}
						<div>
							<h2 className="text-xl font-semibold mb-2">
								Visited Sites Near You
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{(showAllVisited
									? paginatedVisited
									: paginatedVisited.slice(0, 4)
								).map((site, idx) => (
									<div
										key={site._id}
										className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col gap-2 hover:shadow-lg transition"
									>
										<div className="font-bold text-lg text-green-700">
											{site.name}
										</div>
										<div className="text-sm text-gray-600">
											Category:{" "}
											<span className="font-medium">{site.category}</span>
										</div>
										<div className="text-xs text-gray-500">
											Rating:{" "}
											{siteReviews[site._id] &&
											siteReviews[site._id].length > 0 ? (
												<span>
													{(
														siteReviews[site._id].reduce(
															(sum, r) => sum + r.rating,
															0
														) / siteReviews[site._id].length
													).toFixed(1)}{" "}
													<span className="text-yellow-500">★</span>
												</span>
											) : (
												<span className="text-gray-400">No ratings</span>
											)}
										</div>
										<div className="flex gap-2 mt-2">
											{userId &&
												Array.isArray(siteReviews[site._id]) &&
												!hasUserReviewed(site._id, userId, siteReviews) && (
													<button
														onClick={() => handleReviewClick(site)}
														className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 transition"
													>
														Review
													</button>
												)}
											{reviewSite &&
												reviewSite._id === site._id &&
												userId &&
												!hasUserReviewed(site._id, userId, siteReviews) && (
													<Review
														site={site}
														onReviewSubmitted={async () => {
															const res = await api.get(`/reviews/${site._id}`);
															setSiteReviews((prev) => ({
																...prev,
																[site._id]: res.data,
															}));
															setReviewSite(null);
														}}
													/>
												)}
										</div>
									</div>
								))}
							</div>
							{paginatedVisited.length > 4 && (
								<div className="flex justify-center my-5">
									<button
										onClick={() => setShowAllVisited((v) => !v)}
										className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium shadow transition"
										aria-label={
											showAllVisited
												? "Show less visited sites"
												: "See all visited sites"
										}
									>
										{showAllVisited ? (
											<>
												<span>Show Less</span>
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													strokeWidth={2}
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M19 15l-7-7-7 7"
													/>
												</svg>
											</>
										) : (
											<>
												<span>See All</span>
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													strokeWidth={2}
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M5 9l7 7 7-7"
													/>
												</svg>
											</>
										)}
									</button>
								</div>
							)}
							{/* Pagination Controls */}
							{showAllVisited && (
								<div className="flex justify-end items-center gap-2 mt-2 mb-2 px-2">
									<button
										onClick={() => setVisitedPage((p) => Math.max(1, p - 1))}
										disabled={visitedPage === 1}
										className="px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition"
									>
										Prev
									</button>
									{Array.from(
										{
											length: Math.ceil(visitedSites.length / VISITED_PER_PAGE),
										},
										(_, i) => (
											<button
												key={i}
												onClick={() => setVisitedPage(i + 1)}
												className={`px-2 py-1 rounded ${
													visitedPage === i + 1
														? "bg-green-600 text-white"
														: "bg-green-50 text-green-700 hover:bg-green-200"
												} transition`}
											>
												{i + 1}
											</button>
										)
									)}
									<button
										onClick={() =>
											setVisitedPage((p) =>
												p < Math.ceil(visitedSites.length / VISITED_PER_PAGE)
													? p + 1
													: p
											)
										}
										disabled={
											visitedPage >=
											Math.ceil(visitedSites.length / VISITED_PER_PAGE)
										}
										className="px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition"
									>
										Next
									</button>
								</div>
							)}
						</div>
					</div>
				</aside>

				{/* Map */}
				<main className="flex-1 h-full w-full relative">
					<div className="absolute inset-0 h-full w-full">
						<CulturalMap
							token={token}
							categoryFilter={categoryFilter}
							keyword={keyword}
							onAddFavorite={addFavorite}
							userLocation={userLocation}
							onCatchSuccess={fetchInventory}
						/>
					</div>
				</main>
			</div>
		</div>
	);
}
