"use client";

import { HelpCircle, ThumbsDown, ThumbsUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Food } from "@/lib/types";

type PreferenceRadioGroupProps = {
	value: Food["preference"];
	onValueChange: (value: Food["preference"]) => void;
	idPrefix?: string;
};

export function PreferenceRadioGroup({
	value,
	onValueChange,
	idPrefix = "",
}: PreferenceRadioGroupProps) {
	return (
		<RadioGroup
			value={value}
			onValueChange={(v) =>
				onValueChange(v as "likes" | "dislikes" | "unknown")
			}
		>
			<div className="flex items-center space-x-2">
				<RadioGroupItem value="likes" id={`${idPrefix}likes`} />
				<Label
					htmlFor={`${idPrefix}likes`}
					className="flex items-center gap-2 font-normal"
				>
					<ThumbsUp className="size-4 text-success" />
					Likes
				</Label>
			</div>
			<div className="flex items-center space-x-2">
				<RadioGroupItem value="dislikes" id={`${idPrefix}dislikes`} />
				<Label
					htmlFor={`${idPrefix}dislikes`}
					className="flex items-center gap-2 font-normal"
				>
					<ThumbsDown className="size-4 text-destructive" />
					Dislikes
				</Label>
			</div>
			<div className="flex items-center space-x-2">
				<RadioGroupItem value="unknown" id={`${idPrefix}unknown`} />
				<Label
					htmlFor={`${idPrefix}unknown`}
					className="flex items-center gap-2 font-normal"
				>
					<HelpCircle className="size-4 text-muted-foreground" />
					Unknown
				</Label>
			</div>
		</RadioGroup>
	);
}
