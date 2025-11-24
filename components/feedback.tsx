"use client";

import { MessageSquare } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function FeedbackButton() {
	const [isOpen, setIsOpen] = useState(false);
	const [feedback, setFeedback] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		function handleEscape(e: KeyboardEvent) {
			if (e.key === "Escape" && isOpen) {
				setIsOpen(false);
			}
		}

		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, [isOpen]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch("/api/feedback", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ feedback }),
			});

			if (!response.ok) {
				const error = await response
					.json()
					.catch(() => ({ error: "Failed to submit feedback" }));
				console.error("Feedback submission error:", error);
			}

			setFeedback("");
			setIsOpen(false);
		} catch (error) {
			console.error("Failed to submit feedback:", error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			{/* Floating button */}
			<Button
				onClick={() => setIsOpen(true)}
				className="fixed bottom-4 right-4 size-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center z-50"
				aria-label="Open feedback form"
			>
				<MessageSquare className="size-5" />
			</Button>

			{/* Feedback form modal */}
			{isOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-card rounded-lg shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
						<h2 className="text-xl font-semibold mb-4">Send Feedback</h2>

						<form onSubmit={handleSubmit} className="space-y-4">
							<Textarea
								value={feedback}
								onChange={(e) => setFeedback(e.target.value)}
								placeholder="Tell us what you think..."
								className="min-h-[120px] resize-none"
								required
							/>

							<div className="flex gap-3 justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsOpen(false)}
									disabled={loading}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={loading || !feedback.trim()}>
									{loading ? "Sending..." : "Submit"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
