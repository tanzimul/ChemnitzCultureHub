"use client";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const CulturalMap = dynamic(
	() => import("@/components/CulturalMap/CulturalMap"),
	{ ssr: false }
);
import api from "@/utils/api";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

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

function capitalize(str) {
	if (!str) return "";
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function DashboardPage() {
	const [token, setToken] = useState("");
	const [favorites, setFavorites] = useState([]);
	const [categoryFilter, setCategoryFilter] = useState("");
	const [keyword, setKeyword] = useState("");
	const [allCategories, setAllCategories] = useState([]);
	const [userLocation, setUserLocation] = useState(null);
	const [visitedSites, setVisitedSites] = useState([]);
	const [favPage, setFavPage] = useState(1);
	const [visitedPage, setVisitedPage] = useState(1);

	const FAVS_PER_PAGE = 10;
	const VISITED_PER_PAGE = 10;

	const favStart = (favPage - 1) * FAVS_PER_PAGE;
	const favEnd = favStart + FAVS_PER_PAGE;
	const paginatedFavorites = favorites.slice(favStart, favEnd);

	const visitedStart = (visitedPage - 1) * VISITED_PER_PAGE;
	const visitedEnd = visitedStart + VISITED_PER_PAGE;
	const paginatedVisited = visitedSites.slice(visitedStart, visitedEnd);

	// Fetch token
	useEffect(() => {
		const stored = Cookies.get("token");
		if (stored) setToken(stored);
	}, []);

	// Fetch favorites
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
		fetchFavorites();

		if (!token) return;
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
		fetchUserLocation();

		const fetchVisitedSites = async () => {
			try {
				const res = await api.get("/users/visited-sites"); // Optionally add ?maxDistance=2000
				setVisitedSites(res.data);
			} catch (err) {
				console.error("Error fetching visited sites:", err);
			}
		};
		fetchVisitedSites();
	}, [token]);

	// Fetch all sites just to get categories
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
						// Fetch updated user profile to get the new location
						const res = await api.get("/users/me", {
							headers: { Authorization: `Bearer ${token}` },
						});
						if (res.data.currentLocation) {
							setUserLocation(res.data.currentLocation);
						}
						// Fetch visited sites after location update
						const visitedRes = await api.get("/users/visited-sites");
						setVisitedSites(visitedRes.data);
						toast.success("Location saved!");
					} catch (err) {
						toast.error("Failed to save location.");
					}
				},
				(error) => {
					toast.error("Unable to retrieve your location.");
				}
			);
		} else {
			toast.error("Geolocation is not supported by your browser.");
		}
	};

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
				toast.error(error.response.data.message); // Right-side notification
			} else {
				console.error("Error adding favorite:", error);
				toast.error("Failed to add favorite.");
			}
		}
	};

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

	return (
		<div className="p-4">
			<Toaster position="top-right" />
			<h1 className="text-2xl font-bold mb-4">Dashboard</h1>

			<div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
				<div className="relative w-full sm:w-1/2">
					<input
						type="text"
						placeholder="Search cultural sites..."
						className="w-full bg-white border border-gray-300 text-sm text-gray-700 rounded-xl py-2.5 pl-4 pr-12 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
						onChange={(e) => setKeyword(e.target.value)}
					/>
					<div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
						🔍
					</div>
				</div>

				<div className="w-full sm:w-1/3">
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
				</div>
			</div>

			<CulturalMap
				token={token}
				categoryFilter={categoryFilter}
				keyword={keyword}
				onAddFavorite={addFavorite}
				userLocation={userLocation}
			/>

			<button
				onClick={handleGetLocation}
				className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-700 transition"
			>
				Save My Current Location
			</button>

			{/* My Favorites Table */}
			<h2 className="text-xl font-semibold mt-6">My Favorites</h2>
			<div className="overflow-x-auto rounded-lg shadow mb-8">
				<table className="min-w-full bg-white border border-gray-200">
					<thead className="bg-gray-700 text-white">
						<tr>
							<th className="py-3 px-4 text-left">#</th>
							<th className="py-3 px-4 text-left">Name</th>
							<th className="py-3 px-4 text-left">Category</th>
							{/* <th className="py-3 px-4 text-left">Address</th> */}
							{/* <th className="py-3 px-4 text-left">Contact</th> */}
							<th className="py-3 px-4 text-left">Website</th>
							<th className="py-3 px-4 text-left">Phone</th>
							<th className="py-3 px-4 text-left">Description</th>
							<th className="py-3 px-4 text-left">Location</th>
							<th className="py-3 px-4 text-left">Action</th>
						</tr>
					</thead>
					<tbody>
						{paginatedFavorites
							.filter((site) => site && site.name)
							.map((site, idx) => (
								<tr
									key={site._id}
									className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
								>
									<td className="py-2 px-4 font-medium">
										{favStart + idx + 1}
									</td>
									<td className="py-2 px-4">{site.name}</td>
									<td className="py-2 px-4">
										{site.category || site.properties?.category}
									</td>
									{/* <td className="py-2 px-4">
										{site.address || site.properties?.address}
									</td> */}
									{/* <td className="py-2 px-4">
										{site.contact || site.properties?.contact || "-"}
									</td> */}
									<td className="py-2 px-4">
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
											"-"
										)}
									</td>
									<td className="py-2 px-4">
										{site.phone || site.properties?.phone || "-"}
									</td>
									<td className="py-2 px-4">{site.description}</td>
									<td className="py-2 px-4 text-xs">
										{site.location && site.location.coordinates
											? `${site.location.coordinates[1]}, ${site.location.coordinates[0]}`
											: "-"}
									</td>
									<td className="py-2 px-4">
										<button
											onClick={() => removeFavorite(site._id)}
											className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
										>
											Remove
										</button>
									</td>
								</tr>
							))}
					</tbody>
				</table>
				{/* Pagination Controls */}
				<div className="flex justify-end items-center gap-2 mt-4 mb-4 px-4">
					<button
						onClick={() => setFavPage((p) => Math.max(1, p - 1))}
						disabled={favPage === 1}
						className="px-3 py-1 rounded bg-gray-400 text-black-700 hover:bg-gray-200 disabled:opacity-50 transition"
					>
						Prev
					</button>
					{Array.from(
						{ length: Math.ceil(favorites.length / FAVS_PER_PAGE) },
						(_, i) => (
							<button
								key={i}
								onClick={() => setFavPage(i + 1)}
								className={`px-3 py-1 rounded ${
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
								p < Math.ceil(favorites.length / FAVS_PER_PAGE) ? p + 1 : p
							)
						}
						disabled={favPage >= Math.ceil(favorites.length / FAVS_PER_PAGE)}
						className="px-3 py-1 rounded bg-gray-400 text-black-700 hover:bg-gray-200 disabled:opacity-50 transition"
					>
						Next
					</button>
				</div>
			</div>

			{/* Visited Sites Table */}
			<h2 className="text-xl font-semibold mt-6">Visited Sites Near You</h2>
			<div className="overflow-x-auto rounded-lg shadow">
				<table className="min-w-full bg-white border border-gray-200">
					<thead className="bg-green-600 text-white">
						<tr>
							<th className="py-3 px-4 text-left">#</th>
							<th className="py-3 px-4 text-left">Name</th>
							<th className="py-3 px-4 text-left">Category</th>
							<th className="py-3 px-4 text-left">Description</th>
						</tr>
					</thead>
					<tbody>
						{paginatedVisited.map((site, idx) => (
							<tr
								key={site._id}
								className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
							>
								<td className="py-2 px-4 font-medium">
									{visitedStart + idx + 1}
								</td>
								<td className="py-2 px-4">{site.name}</td>
								<td className="py-2 px-4">{site.category}</td>
								<td className="py-2 px-4">{site.description}</td>
							</tr>
						))}
					</tbody>
				</table>
				{/* Pagination Controls */}
				<div className="flex justify-end items-center gap-2 mt-4 mb-4 px-4">
					<button
						onClick={() => setVisitedPage((p) => Math.max(1, p - 1))}
						disabled={visitedPage === 1}
						className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition"
					>
						Prev
					</button>
					{Array.from(
						{ length: Math.ceil(visitedSites.length / VISITED_PER_PAGE) },
						(_, i) => (
							<button
								key={i}
								onClick={() => setVisitedPage(i + 1)}
								className={`px-3 py-1 rounded ${
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
							visitedPage >= Math.ceil(visitedSites.length / VISITED_PER_PAGE)
						}
						className="px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition"
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}
