import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MealsPageClient } from "@/components/meals-page-client";
import { auth } from "@/lib/auth";

export default async function MealsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/sign-in");
	}

	return <MealsPageClient />;
}
