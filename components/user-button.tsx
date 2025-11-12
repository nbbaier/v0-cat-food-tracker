"use client";

import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import AuthButtons from "./auth-buttons";
import UserDropdown from "./user-dropdown";

export default function UserButton() {
	const session = authClient.useSession();
	if (session.isPending) {
		return (
			<Button
				variant="outline"
				size="icon"
				className="rounded-md animate-pulse pointer-events-none"
				disabled
				aria-label="Loading user session"
			>
				<div className="size-full rounded-md bg-muted" />
			</Button>
		);
	}
	const user = session.data?.user;

	if (!user) {
		return <AuthButtons />;
	}

	return (
		<UserDropdown
			user={user}
			onSignOut={() =>
				authClient.signOut({
					fetchOptions: {
						onSuccess: () => {
							redirect("/");
						},
					},
				})
			}
		/>
	);
}
