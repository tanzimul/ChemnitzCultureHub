import { useState, useEffect } from "react";
import api from "@/utils/api";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import TradeCodeGenerator from "@/components/Trade/TradeCodeGenerator";
import toast from "react-hot-toast";

export default function Profile() {
	const [user, setUser] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [stats, setStats] = useState({
		favorites: 0,
		visited: 0,
		inventory: 0,
	});
	const [deleting, setDeleting] = useState(false);
	const router = useRouter();
	const [locationLoading, setLocationLoading] = useState(false);
	const [showLocationConfirm, setShowLocationConfirm] = useState(false);
	const [token, setToken] = useState("");
	// Get token from cookies on mount
	useEffect(() => {
		const stored = Cookies.get("token");
		if (stored) setToken(stored);
	}, []);

	useEffect(() => {
		const userData = Cookies.get("user");
		if (userData) {
			const parsedUser = JSON.parse(userData);
			setUser(parsedUser);
			setFormData({
				name: parsedUser.name,
				email: parsedUser.email,
			});
			// Fetch stats (favorites, visited, inventory)
			api
				.get("/users/me/stats")
				.then((res) => {
					setStats(res.data);
				})
				.catch(() => {});
		} else {
			router.push("/");
		}
	}, []);

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
		setMessage("");

		try {
			const response = await api.put("/users/profile", formData);
			const updatedUser = response.data.user;

			Cookies.set(
				"user",
				JSON.stringify({
					id: updatedUser._id,
					name: updatedUser.name,
					email: updatedUser.email,
					createdAt: updatedUser.createdAt,
				}),
				{ expires: 7 }
			);

			setUser(updatedUser);
			setMessage("Profile updated successfully!");
		} catch (error) {
			setError(error.response?.data?.message || "Update failed");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (
			!window.confirm(
				"Are you sure you want to delete your profile? This action cannot be undone."
			)
		)
			return;
		setDeleting(true);
		try {
			await api.delete("/users/me");
			Cookies.remove("user");
			setTimeout(() => {
				router.push("/");
			}, 1000);
		} catch (err) {
			setError("Failed to delete profile.");
		} finally {
			setDeleting(false);
		}
	};

	const handleGetLocation = () => {
		setShowLocationConfirm(true);
	};

	const handleConfirmLocation = (allow) => {
		setShowLocationConfirm(false);
		if (!allow) return;

		if ("geolocation" in navigator) {
			setLocationLoading(true);
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const { latitude, longitude } = position.coords;
					try {
						const res = await api.put(
							"/users/location",
							{ latitude, longitude },
							{ headers: { Authorization: `Bearer ${token}` } }
						);
						toast.success("Location saved!");
						const statsRes = await api.get("/users/me/stats");
						setStats(statsRes.data);
					} catch (err) {
						toast.error("Failed to save location.");
						console.error("Error saving location:", err);
					}
					setLocationLoading(false);
				},
				() => {
					toast.error("Unable to retrieve your location.");
					setLocationLoading(false);
				}
			);
		} else {
			toast.error("Geolocation is not supported by your browser.");
		}
	};

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto py-8">
			<div className="bg-white shadow-lg rounded-xl p-8">
				<h2 className="text-2xl font-bold text-primary-700 mb-6">My Profile</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
					<div>
						<div className="text-sm text-gray-500">Full Name</div>
						<div className="font-semibold text-lg text-primary-800">
							{user.name}
						</div>
					</div>
					<div>
						<div className="text-sm text-gray-500">Email</div>
						<div className="font-semibold text-lg text-primary-800">
							{user.email}
						</div>
					</div>
					<div>
						<div className="text-sm text-gray-500">User ID</div>
						<div className="font-semibold text-lg text-primary-800 break-all">
							{user.id || user._id}
						</div>
					</div>
					<div>
						<div className="text-sm text-gray-500">Registered</div>
						<div className="font-semibold text-lg text-primary-800">
							{user.createdAt
								? new Date(user.createdAt).toLocaleDateString()
								: "-"}
						</div>
					</div>
					<div>
						<div className="text-sm text-gray-500">Favorites</div>
						<div className="font-semibold text-lg text-primary-800">
							{stats.favorites}
						</div>
					</div>
					<div>
						<div className="text-sm text-gray-500">Visited Sites</div>
						<div className="font-semibold text-lg text-primary-800">
							{stats.visited}
						</div>
					</div>
					<div>
						<div className="text-sm text-gray-500">Inventory</div>
						<div className="font-semibold text-lg text-primary-800">
							{stats.inventory}
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
					{/* Save My Current Location Card */}
					<div
						onClick={handleGetLocation}
						className={`cursor-pointer flex items-center gap-3 p-4 rounded-xl shadow border border-blue-200 bg-blue-50 hover:bg-blue-100 transition ${
							locationLoading ? "opacity-60 pointer-events-none" : ""
						}`}
						title="Click to save your current location"
					>
						<svg
							className="h-7 w-7 text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 11.5a2 2 0 100-4 2 2 0 000 4zm0 8.5c-4-5-7-7.5-7-11A7 7 0 0112 2a7 7 0 017 7c0 3.5-3 6-7 11z"
							/>
						</svg>
						<div>
							<div className="font-semibold text-blue-700">
								Save My Current Location
							</div>
							<div className="text-xs text-blue-500">
								{locationLoading
									? "Saving..."
									: "Click to update your location"}
							</div>
							<div className="text-xs text-blue-700 mt-2">
								{stats.userlocation && stats.userlocation.coordinates ? (
									<>
										Your Location:{" "}
										<span className="font-mono">
											{stats.userlocation.coordinates[1]},{" "}
											{stats.userlocation.coordinates[0]}
										</span>
									</>
								) : (
									<span>You haven't saved your location yet!</span>
								)}
							</div>
						</div>
					</div>

					{/* Generate Trade Code Card */}
					<div className="flex flex-col gap-2 p-4 rounded-xl shadow border border-green-200 bg-green-50">
						<TradeCodeGenerator />
					</div>
				</div>
				{showLocationConfirm && (
					<div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/30 backdrop-blur-sm">
						<div className="bg-white/70 backdrop-blur-lg rounded-lg shadow-lg p-6 max-w-sm w-full border border-white/40">
							<h2 className="text-lg font-semibold mb-4">
								Allow Location Access
							</h2>
							<p className="mb-6">
								Do you allow us to access your current location?
							</p>
							<div className="flex justify-end gap-3">
								<button
									onClick={() => handleConfirmLocation(false)}
									className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
								>
									Cancel
								</button>
								<button
									onClick={() => handleConfirmLocation(true)}
									className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
								>
									Allow
								</button>
							</div>
						</div>
					</div>
				)}
				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700"
							>
								Full Name
							</label>
							<input
								type="text"
								id="name"
								name="name"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
								value={formData.name}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email Address
							</label>
							<input
								type="email"
								id="email"
								name="email"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>
					</div>

					{message && <div className="text-green-600 text-sm">{message}</div>}
					{error && <div className="text-red-600 text-sm">{error}</div>}

					<div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
						<button
							type="submit"
							disabled={loading}
							className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 transition"
						>
							{loading ? "Updating..." : "Update Profile"}
						</button>
						<button
							type="button"
							onClick={handleDelete}
							disabled={deleting}
							className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 disabled:opacity-50 transition"
						>
							{deleting ? "Deleting..." : "Delete Profile"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
