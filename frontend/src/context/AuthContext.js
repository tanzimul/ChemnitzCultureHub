import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// Load user from cookie on mount
	useEffect(() => {
		const userData = Cookies.get("user");
		if (userData) {
			setUser(JSON.parse(userData));
		} else {
			setUser(false); // Not authenticated
		}
		setLoading(false);
	}, []);

	// Logout function
	const logout = () => {
		Cookies.remove("token");
		Cookies.remove("user");
		setUser(false);
		window.location.href = "/";
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
			</div>
		);
	}

	return (
		<AuthContext.Provider value={{ user, setUser, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
