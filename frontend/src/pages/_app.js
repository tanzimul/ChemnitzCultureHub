import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout/Layout"; // Import the Layout component
import "../styles/global.css"; // Import global CSS styles
import Head from "next/head";

function MyApp({ Component, pageProps }) {
	return (
		<>
			<Head>
				<meta name="viewport" content="viewport-fit=cover" />
			</Head>
			<AuthProvider>
				<Layout>
					<Component {...pageProps} />
				</Layout>
			</AuthProvider>
		</>
	);
}

export default MyApp;
