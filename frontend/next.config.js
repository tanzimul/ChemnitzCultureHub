/** @type {import('next').NextConfig} */
const nextConfig = {
	/* config options here */
	env: {
		NEXT_PUBLIC_API_URL:
			process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api",
	},
};

module.exports = nextConfig;
