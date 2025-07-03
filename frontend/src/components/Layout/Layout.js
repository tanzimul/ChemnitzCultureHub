"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Cookies from "js-cookie";

export default function Layout({ children }) {
	//const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// const token = Cookies.get("token");
		// const userData = Cookies.get("user");

		// if (token && userData) {
		// 	try {
		// 		setUser(JSON.parse(userData));
		// 	} catch (error) {
		// 		console.error("Error parsing user data:", error);
		// 		Cookies.remove("token");
		// 		Cookies.remove("user");
		// 	}
		// }
		setLoading(false);
	}, []);

	// const logout = () => {
	// 	Cookies.remove("token");
	// 	Cookies.remove("user");
	// 	setUser(null);
	// 	window.location.href = "/";
	// };

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* <Navbar user={user} logout={logout} /> */}
			<Navbar />
			<main className="w-full h-full">{children}</main>
		</div>
	);
}
