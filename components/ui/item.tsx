import type * as React from "react";

import { cn } from "@/lib/utils";

function Item({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="item"
			className={cn(
				"flex items-center gap-4 px-4 py-3 rounded-lg border bg-card text-card-foreground hover:bg-accent/50 transition-colors",
				className,
			)}
			{...props}
		/>
	);
}

function ItemIcon({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="item-icon"
			className={cn("flex items-center justify-center shrink-0", className)}
			{...props}
		/>
	);
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="item-content"
			className={cn("flex-1 min-w-0", className)}
			{...props}
		/>
	);
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="item-title"
			className={cn("font-semibold leading-none", className)}
			{...props}
		/>
	);
}

function ItemDescription({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="item-description"
			className={cn("text-sm text-muted-foreground", className)}
			{...props}
		/>
	);
}

function ItemAction({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="item-action"
			className={cn("flex items-center gap-2 shrink-0", className)}
			{...props}
		/>
	);
}

export { Item, ItemIcon, ItemContent, ItemTitle, ItemDescription, ItemAction };
