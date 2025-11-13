"use client";

import { HelpCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import type { Food } from "@/lib/types";

type PreferenceIconProps = {
	preference: Food["preference"];
	className?: string;
};

export function PreferenceIcon({
	preference,
	className = "size-4",
}: PreferenceIconProps) {
	switch (preference) {
		case "likes":
			return <ThumbsUp className={className} />;
		case "dislikes":
			return <ThumbsDown className={className} />;
		case "unknown":
			return <HelpCircle className={className} />;
	}
}

export function getPreferenceColor(preference: Food["preference"]): string {
	switch (preference) {
		case "likes":
			return "text-success";
		case "dislikes":
			return "text-destructive";
		case "unknown":
			return "text-muted-foreground";
	}
}
