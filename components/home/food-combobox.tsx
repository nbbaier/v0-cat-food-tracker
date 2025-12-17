"use client";

import { Check, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import type { FoodSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

type FoodComboboxProps = {
	foods: FoodSummary[];
	value: string;
	onChange: (foodId: string) => void;
	onCreateNew: (name: string) => void;
	isLoading?: boolean;
	disabled?: boolean;
	error?: string;
};

export function FoodCombobox({
	foods,
	value,
	onChange,
	onCreateNew,
	isLoading,
	disabled,
	error,
}: FoodComboboxProps) {
	const [search, setSearch] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);
	const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const selectedFood = foods.find((f) => f.id === value);

	const filtered = useMemo(() => {
		if (!search.trim()) return foods;
		const lower = search.toLowerCase();
		return foods.filter((f) => f.name.toLowerCase().includes(lower));
	}, [foods, search]);

	const showCreateOption =
		search.trim() &&
		!foods.some((f) => f.name.toLowerCase() === search.toLowerCase());

	const totalOptions = filtered.length + (showCreateOption ? 1 : 0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: search is intentionally included to reset highlight when filtering
	useEffect(() => {
		setHighlightedIndex(0);
	}, [search]);

	useEffect(() => {
		return () => {
			if (blurTimeoutRef.current) {
				clearTimeout(blurTimeoutRef.current);
			}
		};
	}, []);

	const handleSelect = (foodId: string) => {
		onChange(foodId);
		const food = foods.find((f) => f.id === foodId);
		setSearch(food?.name ?? "");
		setIsOpen(false);
	};

	const handleCreate = () => {
		onCreateNew(search.trim());
		setIsOpen(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!isOpen) {
			if (e.key === "ArrowDown" || e.key === "Enter") {
				setIsOpen(true);
				e.preventDefault();
			}
			return;
		}

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setHighlightedIndex((i) => Math.min(i + 1, totalOptions - 1));
				break;
			case "ArrowUp":
				e.preventDefault();
				setHighlightedIndex((i) => Math.max(i - 1, 0));
				break;
			case "Enter":
				e.preventDefault();
				if (highlightedIndex < filtered.length) {
					handleSelect(filtered[highlightedIndex].id);
				} else if (showCreateOption) {
					handleCreate();
				}
				break;
			case "Escape":
				setIsOpen(false);
				break;
		}
	};

	return (
		<div className="relative">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<Input
					ref={inputRef}
					type="text"
					placeholder={isLoading ? "Loading..." : "Search or add food..."}
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setIsOpen(true);
						if (value) onChange("");
					}}
					onFocus={() => setIsOpen(true)}
					onBlur={() => {
						blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
					}}
					onKeyDown={handleKeyDown}
					disabled={disabled || isLoading}
					className={cn("pl-9", error && "border-destructive")}
					aria-invalid={!!error}
					aria-label="Search or add food"
					autoComplete="off"
				/>
			</div>

			{selectedFood && !isOpen && (
				<div className="mt-2 text-sm text-muted-foreground">
					Selected: <span className="font-medium">{selectedFood.name}</span>
				</div>
			)}

			{isOpen && (filtered.length > 0 || showCreateOption) && (
				<div
					ref={listRef}
					className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover shadow-md"
				>
					{filtered.map((food, index) => (
						<button
							key={food.id}
							type="button"
							className={cn(
								"flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent",
								highlightedIndex === index && "bg-accent",
								value === food.id && "font-medium",
							)}
							onMouseDown={(e) => e.preventDefault()}
							onClick={() => handleSelect(food.id)}
							onMouseEnter={() => setHighlightedIndex(index)}
						>
							{value === food.id && <Check className="size-4" />}
							<span className={value !== food.id ? "pl-6" : ""}>
								{food.name}
							</span>
						</button>
					))}

					{showCreateOption && (
						<button
							type="button"
							className={cn(
								"flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent border-t",
								highlightedIndex === filtered.length && "bg-accent",
							)}
							onMouseDown={(e) => e.preventDefault()}
							onClick={handleCreate}
							onMouseEnter={() => setHighlightedIndex(filtered.length)}
						>
							<Plus className="size-4" />
							<span>
								Add "<span className="font-medium">{search.trim()}</span>"
							</span>
						</button>
					)}
				</div>
			)}

			{error && <p className="mt-1 text-sm text-destructive">{error}</p>}
		</div>
	);
}
