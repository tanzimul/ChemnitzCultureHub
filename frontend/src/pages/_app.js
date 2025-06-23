import React from "react";
import Layout from "@/components/Layout/Layout"; // Import the Layout component
import "../styles/global.css"; // Import global CSS styles
import Head from "next/head";

function MyApp({ Component, pageProps }) {
	return (
		<>
			<Head>
				<meta name="viewport" content="viewport-fit=cover" />
			</Head>
			<Layout>
				<Component {...pageProps} />
			</Layout>
		</>
	);
}

export default MyApp;
