import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import api from "@/utils/api";
import Cookies from "js-cookie";

export default function Login() {
	const { setUser } = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [touched, setTouched] = useState({});
	const router = useRouter();

	const isValidEmail = (email) =>
		typeof email === "string" &&
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleBlur = (e) => {
		setTouched({ ...touched, [e.target.name]: true });
	};

	const validate = () => {
		const errors = {};
		if (!formData.email.trim()) errors.email = "Email is required";
		else if (!isValidEmail(formData.email))
			errors.email = "Invalid email address";
		if (!formData.password) errors.password = "Password is required";
		return errors;
	};

	const fieldErrors = validate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setTouched({
			email: true,
			password: true,
		});

		if (Object.keys(fieldErrors).length > 0) {
			setError("Please fix the errors above.");
			return;
		}

		setLoading(true);

		try {
			const response = await api.post("/auth/login", formData);
			const { token, user } = response.data;

			Cookies.set("token", token, { expires: 7 });
			Cookies.set("user", JSON.stringify(user), { expires: 7 });

			setUser(user);
			router.push("/dashboard");
		} catch (error) {
			setError(error.response?.data?.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
				<div>
					<h2 className="mt-2 text-center text-3xl font-extrabold text-primary-700">
						Sign in to your account
					</h2>
					<p className="mt-2 text-center text-gray-500 text-sm">
						Welcome back to ChemnitzCultureHub!
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
					<div className="space-y-4">
						<div>
							<input
								id="email"
								name="email"
								type="email"
								required
								autoComplete="email"
								className={`relative block w-full px-3 py-2 border ${
									touched.email && fieldErrors.email
										? "border-red-400"
										: "border-gray-300"
								} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
								placeholder="Email address"
								value={formData.email}
								onChange={handleChange}
								onBlur={handleBlur}
							/>
							{touched.email && fieldErrors.email && (
								<p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
							)}
						</div>
						<div>
							<input
								id="password"
								name="password"
								type="password"
								required
								autoComplete="current-password"
								className={`relative block w-full px-3 py-2 border ${
									touched.password && fieldErrors.password
										? "border-red-400"
										: "border-gray-300"
								} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
								placeholder="Password"
								value={formData.password}
								onChange={handleChange}
								onBlur={handleBlur}
							/>
							{touched.password && fieldErrors.password && (
								<p className="text-xs text-red-500 mt-1">
									{fieldErrors.password}
								</p>
							)}
						</div>
					</div>

					{error && (
						<div className="text-red-600 text-sm text-center mt-2">{error}</div>
					)}

					<div className="flex flex-col gap-3 mt-6">
						<button
							type="submit"
							disabled={loading}
							className="w-full flex justify-center py-2 px-4 text-sm font-semibold rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>
						<Link
							href="/auth/register"
							className="w-full flex justify-center py-2 px-4 border-2 border-blue-700 text-blue-700 bg-white font-semibold rounded-md hover:bg-blue-50 transition text-sm"
						>
							Do not have an account? Sign up
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
