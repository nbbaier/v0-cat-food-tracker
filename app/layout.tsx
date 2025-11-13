import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AppHeader } from "@/components/layout/app-header";
import { HeaderActionsProvider } from "@/components/layout/header-context";
import { QuickAddDialogProvider } from "@/components/shared/quick-add-context";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: "Ygritte's Picky Picks",
	// description: "Feed Ygritte like a queen",
	generator: "v0.app",
	icons: {
		icon: [
			{
				url: "/icon-light-32x32.png",
				media: "(prefers-color-scheme: light)",
			},
			{
				url: "/icon-dark-32x32.png",
				media: "(prefers-color-scheme: dark)",
			},
			{
				url: "/icon.svg",
				type: "image/svg+xml",
			},
		],
		apple: "/apple-icon.png",
	},
};

// Note: Using system fonts to avoid Google Fonts fetch during restricted builds.

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`font-sans antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<QuickAddDialogProvider>
						<HeaderActionsProvider>
							<AppHeader />
							{children}
						</HeaderActionsProvider>
					</QuickAddDialogProvider>
					<Toaster />
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	);
}
