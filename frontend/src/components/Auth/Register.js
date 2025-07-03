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
	const [success, setSuccess] = useState("");
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
		if (!formData.name.trim()) errors.name = "Full name is required";
		if (!formData.email.trim()) errors.email = "Email is required";
		else if (!isValidEmail(formData.email))
			errors.email = "Invalid email address";
		if (!formData.password) errors.password = "Password is required";
		else if (formData.password.length < 6)
			errors.password = "Password must be at least 6 characters";
		if (!formData.confirmPassword)
			errors.confirmPassword = "Please confirm your password";
		else if (formData.password !== formData.confirmPassword)
			errors.confirmPassword = "Passwords do not match";
		return errors;
	};

	const fieldErrors = validate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setTouched({
			name: true,
			email: true,
			password: true,
			confirmPassword: true,
		});

		if (Object.keys(fieldErrors).length > 0) {
			setError("Please fix the errors above.");
			return;
		}

		setLoading(true);

		try {
			const response = await api.post("/auth/register", {
				name: formData.name,
				email: formData.email,
				password: formData.password,
			});

			const { token, user } = response.data;

			Cookies.set("token", token, { expires: 7 });
			Cookies.set("user", JSON.stringify(user), { expires: 7 });
			setUser(user);
			setSuccess("Registration successful! Redirecting...");
			setTimeout(() => router.push("/dashboard"), 1200);
		} catch (error) {
			setError(error.response?.data?.message || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-xl p-8">
				<div>
					<h2 className="mt-2 text-center text-3xl font-extrabold text-primary-700">
						Create your account
					</h2>
					<p className="mt-2 text-center text-gray-500 text-sm">
						Join ChemnitzCultureHub and explore culture!
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
					<div className="space-y-4">
						<div>
							<input
								id="name"
								name="name"
								type="text"
								required
								autoComplete="name"
								className={`relative block w-full px-3 py-2 border ${
									touched.name && fieldErrors.name
										? "border-red-400"
										: "border-gray-300"
								} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
								placeholder="Full name"
								value={formData.name}
								onChange={handleChange}
								onBlur={handleBlur}
							/>
							{touched.name && fieldErrors.name && (
								<p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>
							)}
						</div>
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
								autoComplete="new-password"
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
						<div>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								required
								autoComplete="new-password"
								className={`relative block w-full px-3 py-2 border ${
									touched.confirmPassword && fieldErrors.confirmPassword
										? "border-red-400"
										: "border-gray-300"
								} placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
								placeholder="Confirm password"
								value={formData.confirmPassword}
								onChange={handleChange}
								onBlur={handleBlur}
							/>
							{touched.confirmPassword && fieldErrors.confirmPassword && (
								<p className="text-xs text-red-500 mt-1">
									{fieldErrors.confirmPassword}
								</p>
							)}
						</div>
					</div>

					{error && (
						<div className="text-red-600 text-sm text-center mt-2">{error}</div>
					)}
					{success && (
						<div className="text-green-600 text-sm text-center mt-2">
							{success}
						</div>
					)}

					<div className="flex flex-col gap-3 mt-6">
						<button
							type="submit"
							disabled={loading}
							className="w-full flex justify-center py-2 px-4 text-sm font-semibold rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
						>
							{loading ? "Creating account..." : "Sign up"}
						</button>
						<Link
							href="/auth/login"
							className="w-full flex justify-center py-2 px-4 border-2 border-blue-700 text-blue-700 bg-white font-semibold rounded-md hover:bg-blue-50 transition text-sm"
						>
							Already have an account? Sign in
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
