"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import AuthButtons from "./auth-buttons";
import UserDropdown from "./user-dropdown";

export default function UserButton() {
	const session = authClient.useSession();
	if (session.isPending) {
		return (
			<Button
				variant="outline"
				size="icon-lg"
				className="rounded-md pointer-events-none"
				disabled
				aria-label="Loading user session"
			>
				<Loader2 className="size-4 animate-spin" />
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
							window.location.href = "/sign-in";
						},
					},
				})
			}
		/>
	);
}
