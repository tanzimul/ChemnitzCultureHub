"use client";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const CulturalMap = dynamic(
	() => import("@/components/CulturalMap/CulturalMap"),
	{ ssr: false }
);
import api from "@/utils/api";

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
						console.log("Saving location:", latitude, longitude);
						await api.put(
							"/users/location",
							{ latitude, longitude },
							{ headers: { Authorization: `Bearer ${token}` } }
						);
						alert("Location saved!");
					} catch (err) {
						alert("Failed to save location.");
					}
				},
				(error) => {
					alert("Unable to retrieve your location.");
				}
			);
		} else {
			alert("Geolocation is not supported by your browser.");
		}
	};

	const addFavorite = async (site) => {
		try {
			const res = await api.post(
				"/users/favorites",
				{
					name: site.name,
					address: site.properties?.address || "",
					description: site.description || "",
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			setFavorites(res.data.favorites || []);
		} catch (error) {
			console.error("Error adding favorite:", error);
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
			/>

			<button
				onClick={handleGetLocation}
				className="bg-blue-600 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-700 transition"
			>
				Save My Current Location
			</button>

			<h2 className="text-xl font-semibold mt-6">My Favorites</h2>
			<ul className="mt-2">
				{favorites
					.filter((site) => site && site.name)
					.map((site) => (
						<li key={site._id} className="border-b py-2 flex justify-between">
							<span>{site.name}</span>
							<span>{site.address}</span>
							<span>{site.description}</span>
							<span>{site._id}</span>
							<button
								onClick={() => removeFavorite(site._id)}
								className="text-red-500"
							>
								Remove
							</button>
						</li>
					))}
			</ul>
		</div>
	);
}
