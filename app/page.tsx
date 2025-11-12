import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Page() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return (
			<div className="flex items-center justify-center p-4 pt-20">
				<div className="text-center">
					<h1 className="mb-4 text-4xl font-bold">Welcome to the app</h1>
				</div>
			</div>
		);
	}

	redirect("/meals");
}
