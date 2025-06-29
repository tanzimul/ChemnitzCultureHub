"use client";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
const CulturalMap = dynamic(
	() => import("@/components/CulturalMap/CulturalMap"),
	{ ssr: false }
);
//import CulturalMap from "../components/CulturalMap/CulturalMap";
import api from "@/utils/api";

export default function DashboardPage() {
	const [token, setToken] = useState("");
	const [favorites, setFavorites] = useState([]);
	const [categoryFilter, setCategoryFilter] = useState("");
	const [keyword, setKeyword] = useState("");

	useEffect(() => {
		const stored = Cookies.get("token");
		if (stored) setToken(stored);
	}, []);

	useEffect(() => {
		if (!token) return;
		const fetchFavorites = async () => {
			try {
				const res = await api.get("/users/favorites");
				console.log("Favorites response:", res.data);
				setFavorites(res.data);
			} catch (err) {
				console.error("Error fetching favorites:", err);
			}
		};
		fetchFavorites();
	}, [token]);

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
		console.log("Removing favorite with ID:", id);
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

			<div className="mb-4">
				<input
					type="text"
					placeholder="Search..."
					className="border p-2 mr-2"
					onChange={(e) => setKeyword(e.target.value)}
				/>
				<select
					onChange={(e) => setCategoryFilter(e.target.value)}
					className="border p-2"
				>
					<option value="">All Categories</option>
					<option value="Museum">Museum</option>
					<option value="Theater">Theater</option>
					<option value="Gallery">Gallery</option>
				</select>
			</div>

			<CulturalMap
				token={token}
				categoryFilter={categoryFilter}
				keyword={keyword}
				onAddFavorite={addFavorite}
			/>

			<h2 className="text-xl font-semibold mt-6">My Favorites</h2>
			<ul className="mt-2">
				{favorites
					.filter((site) => site && site.name) // skip null/undefined or missing name
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
