import { NextResponse } from "next/server";
import { sanitizeErrorForClient } from "@/lib/utils";

export async function POST(request: Request) {
	try {
		const { feedback } = await request.json();

		const githubToken = process.env.GITHUB_TOKEN;
		if (!githubToken) {
			const errorMessage = sanitizeErrorForClient(
				new Error("GitHub token not configured"),
				"POST /api/feedback - Missing token",
			);
			return NextResponse.json({ error: errorMessage }, { status: 500 });
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
			const errorMessage = sanitizeErrorForClient(
				new Error(`GitHub API error: ${response.status}`),
				"POST /api/feedback - GitHub API",
			);
			return NextResponse.json(
				{ error: errorMessage },
				{ status: response.status },
			);
		}

		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		const errorMessage = sanitizeErrorForClient(error, "POST /api/feedback");
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
