import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { FoodsPageClient } from "@/components/foods-page-client";
import { auth } from "@/lib/auth";

export default async function FoodsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/sign-in");
	}

	return <FoodsPageClient />;
}
