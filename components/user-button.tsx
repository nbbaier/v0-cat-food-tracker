"use client";

import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AuthButtons from "./auth-buttons";
import UserDropdown from "./user-dropdown";

export default function UserButton() {
	const session = authClient.useSession();
	if (session.isPending) {
		return null;
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
