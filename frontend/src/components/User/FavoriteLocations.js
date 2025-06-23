import { useState, useEffect } from "react";
import api from "@/utils/api";

export default function FavoriteLocations() {
	const [locations, setLocations] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		address: "",
		description: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		fetchFavoriteLocations();
	}, []);

	const fetchFavoriteLocations = async () => {
		try {
			const response = await api.get("/users/favorites");
			setLocations(response.data.favoriteLocations);
		} catch (error) {
			setError("Failed to fetch favorite locations");
			console.error("Failed to fetch favorite locations", error);
		}
	};

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const response = await api.post("/users/favorites", formData);
			setLocations(response.data.favoriteLocations);
			setFormData({ name: "", address: "", description: "" });
			setShowForm(false);
		} catch (error) {
			setError(error.response?.data?.message || "Failed to add location");
			console.error("Failed to add location", error);
		} finally {
			setLoading(false);
		}
	};

	const handleRemove = async (locationId) => {
		try {
			const response = await api.delete(`/users/favorites/${locationId}`);
			setLocations(response.data.favoriteLocations);
		} catch (error) {
			setError("Failed to remove location");
			console.error("Failed to remove location", error);
		}
	};

	return (
		<div className="max-w-4xl mx-auto">
			<div className="bg-white shadow-md rounded-lg p-6">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-gray-900">
						Favorite Locations
					</h2>
					<button
						onClick={() => setShowForm(!showForm)}
						className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
					>
						{showForm ? "Cancel" : "Add Location"}
					</button>
				</div>

				{showForm && (
					<form
						onSubmit={handleSubmit}
						className="mb-6 p-4 border border-gray-200 rounded-md"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="name"
									className="block text-sm font-medium text-gray-700"
								>
									Location Name *
								</label>
								<input
									type="text"
									id="name"
									name="name"
									required
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									value={formData.name}
									onChange={handleChange}
								/>
							</div>

							<div>
								<label
									htmlFor="address"
									className="block text-sm font-medium text-gray-700"
								>
									Address
								</label>
								<input
									type="text"
									id="address"
									name="address"
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									value={formData.address}
									onChange={handleChange}
								/>
							</div>

							<div className="md:col-span-2">
								<label
									htmlFor="description"
									className="block text-sm font-medium text-gray-700"
								>
									Description
								</label>
								<textarea
									id="description"
									name="description"
									rows={3}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
									value={formData.description}
									onChange={handleChange}
								/>
							</div>
						</div>

						{error && <div className="text-red-600 text-sm mt-2">{error}</div>}

						<div className="mt-4">
							<button
								type="submit"
								disabled={loading}
								className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
							>
								{loading ? "Adding..." : "Add Location"}
							</button>
						</div>
					</form>
				)}

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{locations.map((location) => (
						<div
							key={location._id}
							className="border border-gray-200 rounded-lg p-4"
						>
							<div className="flex justify-between items-start mb-2">
								<h3 className="font-semibold text-gray-900">{location.name}</h3>
								<button
									onClick={() => handleRemove(location._id)}
									className="text-red-500 hover:text-red-700 text-sm"
								>
									Remove
								</button>
							</div>

							{location.address && (
								<p className="text-gray-600 text-sm mb-2">{location.address}</p>
							)}

							{location.description && (
								<p className="text-gray-700 text-sm mb-2">
									{location.description}
								</p>
							)}

							<p className="text-xs text-gray-500">
								Added: {new Date(location.addedAt).toLocaleDateString()}
							</p>
						</div>
					))}
				</div>

				{locations.length === 0 && (
					<div className="text-center py-12">
						<p className="text-gray-500">
							No favorite locations yet. Add your first one!
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
