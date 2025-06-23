import { useState, useEffect } from "react";
import api from "@/utils/api";
import Cookies from "js-cookie";

export default function Profile() {
	const [user, setUser] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		const userData = Cookies.get("user");
		if (userData) {
			const parsedUser = JSON.parse(userData);
			setUser(parsedUser);
			setFormData({
				name: parsedUser.name,
				email: parsedUser.email,
			});
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

			// Update cookies
			Cookies.set(
				"user",
				JSON.stringify({
					id: updatedUser._id,
					name: updatedUser.name,
					email: updatedUser.email,
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

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto">
			<div className="bg-white shadow-md rounded-lg p-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-6">
					Profile Settings
				</h2>

				<form onSubmit={handleSubmit} className="space-y-6">
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
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
							value={formData.email}
							onChange={handleChange}
						/>
					</div>

					{message && <div className="text-green-600 text-sm">{message}</div>}

					{error && <div className="text-red-600 text-sm">{error}</div>}

					<div className="flex justify-end">
						<button
							type="submit"
							disabled={loading}
							className="bg-lime-900 text-white px-4 py-2 rounded-md hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
						>
							{loading ? "Updating..." : "Update Profile"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
