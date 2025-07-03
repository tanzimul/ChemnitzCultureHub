import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout/Layout"; // Import the Layout component
import "../styles/global.css"; // Import global CSS styles
import Head from "next/head";
import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }) {
	return (
		<>
			<Head>
				<title>Chemnitz CultureHub</title>
				<meta
					name="description"
					content="Discover, collect, and review cultural sites in Chemnitz."
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{/* Favicon and icons */}
				<link rel="icon" href="/favicon.ico" />
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="32x32"
					href="/favicon-32x32.png"
				/>
				<link
					rel="icon"
					type="image/png"
					sizes="16x16"
					href="/favicon-16x16.png"
				/>
			</Head>
			<AuthProvider>
				<Layout>
					<Toaster
						position="top-right"
						containerClassName="mt-16"
						toastOptions={{
							style: { marginTop: "4rem" },
						}}
					/>
					<Component {...pageProps} />
				</Layout>
			</AuthProvider>
		</>
	);
}

export default MyApp;
