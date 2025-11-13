"use client";

import { Package, Plus, Utensils } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { authClient } from "@/lib/auth-client";
import AuthButtons from "@/components/auth/auth-buttons";
import { useQuickAddDialog } from "@/components/shared/quick-add-context";
import UserButton from "@/components/auth/user-button";

export function AppHeader() {
	const pathname = usePathname();
	const { openDialog } = useQuickAddDialog();
	const session = authClient.useSession();
	const isAuthenticated = !!session.data?.user;
	const isLoading = session.isPending;

	const handleQuickAddClick = () => {
		const defaultTab = pathname === "/meals" ? "meal" : "food";
		openDialog(defaultTab);
	};

	const showQuickAddButton = pathname === "/meals" || pathname === "/foods";

	const getPageTitle = () => {
		if (pathname === "/meals") {
			return {
				text: "Meal Log",
				icon: <Utensils className="size-6" />,
			};
		}
		if (pathname === "/foods") {
			return {
				text: "Foods",
				icon: <Package className="size-6" />,
			};
		}
		return null;
	};

	const pageTitle = getPageTitle();

	return (
		<header className="border-b bg-card">
			<div className="px-4 py-4 mx-auto max-w-5xl sm:px-6 sm:py-6 lg:px-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
					<div className="flex items-center gap-3">
						{!isLoading && isAuthenticated && pageTitle ? (
							<div className="flex items-center gap-3">
								<div className="flex items-center justify-center border rounded-lg bg-muted p-2 dark:border-input">
									{pageTitle.icon}
								</div>
								<h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
									{pageTitle.text}
								</h1>
							</div>
						) : (
							<h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
								Ygritte's Picky Picks
							</h1>
						)}
					</div>
					<div className="flex flex-wrap gap-2 items-center sm:flex-nowrap">
						{!isLoading && isAuthenticated && showQuickAddButton && (
							<ButtonGroup className="shrink-0">
								<Button
									variant="outline"
									size="icon-lg"
									onClick={handleQuickAddClick}
								>
									<Plus className="size-4" />
								</Button>
							</ButtonGroup>
						)}
						{!isLoading && isAuthenticated && (
							<ButtonGroup className="shrink-0">
								{pathname === "/meals" ? (
									<Button variant="outline" size="icon-lg" asChild>
										<Link href="/foods">
											<Package className="size-4" />
										</Link>
									</Button>
								) : (
									<Button variant="outline" size="icon-lg" asChild>
										<Link href="/meals">
											<Utensils className="size-4" />
										</Link>
									</Button>
								)}
							</ButtonGroup>
						)}
						<ButtonGroup className="shrink-0">
							<ThemeToggle />
						</ButtonGroup>
						<ButtonGroup className="shrink-0">
							{isLoading || isAuthenticated ? <UserButton /> : <AuthButtons />}
						</ButtonGroup>
					</div>
				</div>
			</div>
		</header>
	);
}
