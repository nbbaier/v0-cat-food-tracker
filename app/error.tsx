"use client";

import { Button } from "@/components/ui/button";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className="flex justify-center items-center min-h-screen bg-background">
			<div className="space-y-4 text-center">
				<h2 className="font-semibold text-2xl">Something went wrong!</h2>
				<p className="text-muted-foreground">
					{error.message || "An unexpected error occurred"}
				</p>
				<Button onClick={() => reset()}>Try again</Button>
			</div>
		</div>
	);
}
