import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);

	// Load user from cookie on mount
	useEffect(() => {
		const userCookie = Cookies.get("user");
		if (userCookie) setUser(JSON.parse(userCookie));
	}, []);

	// Logout function
	const logout = () => {
		Cookies.remove("token");
		Cookies.remove("user");
		setUser(null);
		window.location.href = "/"; // or use router.push("/")
	};

	return (
		<AuthContext.Provider value={{ user, setUser, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
