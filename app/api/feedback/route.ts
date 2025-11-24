import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const { feedback } = await request.json();

		const githubToken = process.env.GITHUB_TOKEN;
		if (!githubToken) {
			console.error("GITHUB_TOKEN environment variable is not set");
			return NextResponse.json(
				{ error: "GitHub token not configured" },
				{ status: 500 },
			);
		}

		const response = await fetch(
			"https://api.github.com/repos/nbbaier/v0-cat-food-tracker/issues",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${githubToken}`,
					Accept: "application/vnd.github.v3+json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: `Feedback: ${feedback.slice(0, 50)}...`,
					body: feedback,
					labels: ["feedback"],
				}),
			},
		);

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: "Unknown error" }));
			console.error("GitHub API error:", response.status, errorData);

			if (response.status === 403) {
				return NextResponse.json(
					{
						error:
							"GitHub token lacks required permissions. Ensure it has 'repo' scope (or 'public_repo' for public repositories).",
					},
					{ status: 403 },
				);
			}

			return NextResponse.json(
				{ error: "Failed to submit feedback" },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to submit feedback" },
			{ status: 500 },
		);
	}
}
