/** @type {import('next').NextConfig} */
const nextConfig = {
	images: { unoptimized: true },
	async headers() {
		return [
			{
				// Apply security headers to all routes
				source: "/:path*",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
					{
						key: "Content-Security-Policy",
						// Note: 'unsafe-eval' and 'unsafe-inline' are required for Next.js to function properly
						// https://* for img-src allows flexibility for user-uploaded or external cat food images
						value: [
							"default-src 'self'",
							"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
							"style-src 'self' 'unsafe-inline'",
							"img-src 'self' data: https://*",
							"font-src 'self' data:",
							"connect-src 'self' https://vercel.live https://va.vercel-scripts.com https://*.supabase.co wss://*.supabase.co",
							"frame-ancestors 'none'",
						].join("; "),
					},
				],
			},
		];
	},
};
export default nextConfig;
