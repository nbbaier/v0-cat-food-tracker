"use client";

import { Check, Plus, Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
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
	const listboxId = useId();

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: search dependency triggers highlight reset when search value changes
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
		setSearch("");
		setIsOpen(false);
	};

	const handleClearSelection = () => {
		onChange("");
		setSearch("");
		inputRef.current?.focus();
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
			{selectedFood && (
				<div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-md border bg-accent/50">
					<Check className="size-4 text-primary" />
					<span className="flex-1 font-medium">{selectedFood.name}</span>
					<button
						type="button"
						onClick={handleClearSelection}
						className="size-5 flex items-center justify-center rounded-full hover:bg-muted"
						aria-label="Clear selection"
					>
						<X className="size-3" />
					</button>
				</div>
			)}

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
					onFocus={() => {
						if (blurTimeoutRef.current) {
							clearTimeout(blurTimeoutRef.current);
							blurTimeoutRef.current = null;
						}
						setIsOpen(true);
					}}
					onBlur={() => {
						if (blurTimeoutRef.current) {
							clearTimeout(blurTimeoutRef.current);
						}
						blurTimeoutRef.current = setTimeout(() => setIsOpen(false), 200);
					}}
					onKeyDown={handleKeyDown}
					disabled={disabled || isLoading}
					className={cn("pl-9", error && "border-destructive")}
					role="combobox"
					aria-expanded={isOpen}
					aria-controls={listboxId}
					aria-haspopup="listbox"
					aria-invalid={!!error}
					aria-label="Search or add food"
					autoComplete="off"
				/>
			</div>

			{isOpen && (filtered.length > 0 || showCreateOption) && (
				<div
					ref={listRef}
					id={listboxId}
					role="listbox"
					className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover shadow-md"
				>
					{filtered.map((food, index) => (
						<button
							key={food.id}
							type="button"
							role="option"
							aria-selected={value === food.id}
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
							role="option"
							aria-selected={false}
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
