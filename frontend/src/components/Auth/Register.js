import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import api from "@/utils/api";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
	const { setUser } = useAuth();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const router = useRouter();

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

		// Validate password match
		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		try {
			const response = await api.post("/auth/register", {
				name: formData.name,
				email: formData.email,
				password: formData.password,
			});

			const { token, user } = response.data;

			// Store token and user data
			Cookies.set("token", token, { expires: 7 });
			Cookies.set("user", JSON.stringify(user), { expires: 7 });
			setUser(user);
			// Redirect to dashboard
			router.push("/dashboard");
		} catch (error) {
			setError(error.response?.data?.message || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Create your account
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<input
								id="name"
								name="name"
								type="text"
								required
								className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
								placeholder="Full name"
								value={formData.name}
								onChange={handleChange}
							/>
						</div>
						<div>
							<input
								id="email"
								name="email"
								type="email"
								required
								className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
								placeholder="Email address"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>
						<div>
							<input
								id="password"
								name="password"
								type="password"
								required
								className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
								placeholder="Password"
								value={formData.password}
								onChange={handleChange}
							/>
						</div>
						<div>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								required
								className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
								placeholder="Confirm password"
								value={formData.confirmPassword}
								onChange={handleChange}
							/>
						</div>
					</div>

					{error && (
						<div className="text-red-600 text-sm text-center">{error}</div>
					)}

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative w-50 mx-auto flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
						>
							{loading ? "Creating account..." : "Sign up"}
						</button>
					</div>

					<div className="text-center">
						<Link
							href="/auth/login"
							className="text-primary-600 hover:text-primary-500"
						>
							Already have an account? Sign in
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
