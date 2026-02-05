"use client";

import {
	Calendar,
	Check,
	ChevronDown,
	Clock,
	MessageSquare,
	Pencil,
	Plus,
	Scale,
	ThumbsDown,
	ThumbsUp,
	UtensilsCrossed,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ParsedMeal } from "@/lib/nlp/types";
import type { FoodSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

type ParsedMealCardProps = {
	parsed: ParsedMeal;
	foods: FoodSummary[];
	onConfirm: (data: {
		foodId: string;
		amount: string;
		mealTime: "morning" | "evening";
		mealDate: string;
		notes?: string;
		newFoodName?: string;
	}) => void;
	onCancel: () => void;
	isSubmitting: boolean;
};

function ConfidenceDot({ confidence }: { confidence: string }) {
	return (
		<span
			className={cn(
				"inline-block size-2 rounded-full",
				confidence === "high" && "bg-green-500",
				confidence === "medium" && "bg-yellow-500",
				confidence === "low" && "bg-orange-500",
				confidence === "none" && "bg-red-500",
			)}
			title={`Confidence: ${confidence}`}
		/>
	);
}

export function ParsedMealCard({
	parsed,
	foods,
	onConfirm,
	onCancel,
	isSubmitting,
}: ParsedMealCardProps) {
	const [isEditing, setIsEditing] = useState(false);

	// Editable state initialized from parsed values
	const [selectedFoodId, setSelectedFoodId] = useState(
		parsed.food.matches[0]?.food.id ?? "",
	);
	const [newFoodName, setNewFoodName] = useState(
		parsed.food.matches.length === 0 ? parsed.food.rawText : "",
	);
	const [amount, setAmount] = useState(parsed.amount.normalized);
	const [mealTime, setMealTime] = useState(parsed.mealTime.value);
	const [mealDate, setMealDate] = useState(parsed.date.value);
	const [notes, setNotes] = useState(parsed.notes ?? "");

	// Auto-open edit mode if critical fields are missing
	const needsAttention =
		parsed.food.confidence === "none" ||
		parsed.amount.confidence === "none" ||
		(parsed.food.matches.length === 0 && !parsed.food.rawText);

	useEffect(() => {
		if (needsAttention) setIsEditing(true);
	}, [needsAttention]);

	const topFoodMatch = parsed.food.matches[0];
	const displayFoodName =
		selectedFoodId && !newFoodName
			? (foods.find((f) => f.id === selectedFoodId)?.name ??
				topFoodMatch?.food.name)
			: newFoodName || parsed.food.rawText;

	const handleConfirm = () => {
		onConfirm({
			foodId: selectedFoodId,
			amount: amount || parsed.amount.normalized,
			mealTime,
			mealDate,
			notes: notes || undefined,
			newFoodName: !selectedFoodId && newFoodName ? newFoodName : undefined,
		});
	};

	const sentimentIcon =
		parsed.sentiment.preference === "likes"
			? ThumbsUp
			: parsed.sentiment.preference === "dislikes"
				? ThumbsDown
				: null;

	const SentimentIcon = sentimentIcon;

	return (
		<div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
			{/* Summary header */}
			<div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
				<Check className="size-4 text-primary" />
				<span className="text-sm font-medium">
					{needsAttention ? "Needs a few details" : "Here's what I got"}
				</span>
			</div>

			{/* Parsed fields */}
			<div className="px-4 py-3 space-y-3">
				{isEditing ? (
					<EditView
						parsed={parsed}
						foods={foods}
						selectedFoodId={selectedFoodId}
						onSelectFood={setSelectedFoodId}
						newFoodName={newFoodName}
						onNewFoodName={setNewFoodName}
						amount={amount}
						onAmountChange={setAmount}
						mealTime={mealTime}
						onMealTimeChange={setMealTime}
						mealDate={mealDate}
						onMealDateChange={setMealDate}
						notes={notes}
						onNotesChange={setNotes}
					/>
				) : (
					<SummaryView
						displayFoodName={displayFoodName}
						parsed={parsed}
						amount={amount}
						mealTime={mealTime}
						mealDate={mealDate}
						notes={notes}
						SentimentIcon={SentimentIcon}
					/>
				)}
			</div>

			{/* Actions */}
			<div className="flex items-center gap-2 px-4 py-3 border-t bg-muted/20">
				{!isEditing && (
					<Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
						<Pencil className="size-3" />
						Edit
					</Button>
				)}
				{isEditing && (
					<Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
						Done editing
					</Button>
				)}
				<div className="flex-1" />
				<Button variant="ghost" size="sm" onClick={onCancel}>
					Cancel
				</Button>
				<Button
					size="sm"
					onClick={handleConfirm}
					disabled={
						isSubmitting || (!selectedFoodId && !newFoodName) || !amount
					}
				>
					{isSubmitting ? "Logging..." : "Log Meal"}
				</Button>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Summary (read-only) view
// ---------------------------------------------------------------------------

function SummaryView({
	displayFoodName,
	parsed,
	amount,
	mealTime,
	mealDate,
	notes,
	SentimentIcon,
}: {
	displayFoodName: string;
	parsed: ParsedMeal;
	amount: string;
	mealTime: string;
	mealDate: string;
	notes: string;
	SentimentIcon: typeof ThumbsUp | typeof ThumbsDown | null;
}) {
	return (
		<div className="grid grid-cols-2 gap-2.5">
			<Field
				icon={<UtensilsCrossed className="size-3.5" />}
				label="Food"
				value={displayFoodName}
				confidence={parsed.food.confidence}
				isNew={parsed.food.matches.length === 0}
			/>
			<Field
				icon={<Scale className="size-3.5" />}
				label="Amount"
				value={amount || "(not specified)"}
				confidence={parsed.amount.confidence}
			/>
			<Field
				icon={<Clock className="size-3.5" />}
				label="Time"
				value={mealTime === "morning" ? "Morning" : "Evening"}
				confidence={parsed.mealTime.confidence}
				sublabel={parsed.mealTime.source === "inferred" ? "guessed" : undefined}
			/>
			<Field
				icon={<Calendar className="size-3.5" />}
				label="Date"
				value={formatDate(mealDate)}
				confidence={parsed.date.confidence}
			/>
			{notes && (
				<div className="col-span-2">
					<Field
						icon={<MessageSquare className="size-3.5" />}
						label="Notes"
						value={notes}
						confidence="medium"
					/>
				</div>
			)}
			{SentimentIcon && parsed.sentiment.preference && (
				<div className="col-span-2">
					<Field
						icon={
							<SentimentIcon
								className={cn(
									"size-3.5",
									parsed.sentiment.preference === "likes" && "text-green-500",
									parsed.sentiment.preference === "dislikes" && "text-red-500",
								)}
							/>
						}
						label="Reaction"
						value={parsed.sentiment.rawText ?? parsed.sentiment.preference}
						confidence={parsed.sentiment.confidence}
					/>
				</div>
			)}
		</div>
	);
}

function Field({
	icon,
	label,
	value,
	confidence,
	sublabel,
	isNew,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	confidence: string;
	sublabel?: string;
	isNew?: boolean;
}) {
	return (
		<div className="flex items-start gap-2">
			<span className="mt-0.5 text-muted-foreground">{icon}</span>
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-1.5">
					<span className="text-xs text-muted-foreground">{label}</span>
					<ConfidenceDot confidence={confidence} />
					{sublabel && (
						<span className="text-xs text-muted-foreground italic">
							{sublabel}
						</span>
					)}
				</div>
				<div className="flex items-center gap-1.5">
					<span className="text-sm font-medium truncate">{value}</span>
					{isNew && (
						<Badge variant="secondary" className="text-[10px] px-1.5 py-0">
							new
						</Badge>
					)}
				</div>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Edit view
// ---------------------------------------------------------------------------

function EditView({
	parsed,
	foods,
	selectedFoodId,
	onSelectFood,
	newFoodName,
	onNewFoodName,
	amount,
	onAmountChange,
	mealTime,
	onMealTimeChange,
	mealDate,
	onMealDateChange,
	notes,
	onNotesChange,
}: {
	parsed: ParsedMeal;
	foods: FoodSummary[];
	selectedFoodId: string;
	onSelectFood: (id: string) => void;
	newFoodName: string;
	onNewFoodName: (name: string) => void;
	amount: string;
	onAmountChange: (amount: string) => void;
	mealTime: "morning" | "evening";
	onMealTimeChange: (time: "morning" | "evening") => void;
	mealDate: string;
	onMealDateChange: (date: string) => void;
	notes: string;
	onNotesChange: (notes: string) => void;
}) {
	const [showFoodSearch, setShowFoodSearch] = useState(false);
	const [foodSearch, setFoodSearch] = useState("");
	const searchInputRef = useRef<HTMLInputElement>(null);
	const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const listboxId = useId();

	useEffect(() => {
		return () => {
			if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
		};
	}, []);

	const filteredFoods = useMemo(() => {
		if (!foodSearch.trim()) return foods.slice(0, 10);
		const lower = foodSearch.toLowerCase();
		return foods.filter((f) => f.name.toLowerCase().includes(lower));
	}, [foods, foodSearch]);

	const handleSelectExistingFood = (food: FoodSummary) => {
		onSelectFood(food.id);
		onNewFoodName("");
		setShowFoodSearch(false);
		setFoodSearch("");
	};

	const handleCreateNewFood = () => {
		const name = foodSearch.trim() || parsed.food.rawText;
		onSelectFood("");
		onNewFoodName(name);
		setShowFoodSearch(false);
		setFoodSearch("");
	};

	const selectedFood = foods.find((f) => f.id === selectedFoodId);

	return (
		<div className="space-y-3">
			{/* Food */}
			<div className="space-y-1.5">
				<label
					htmlFor="edit-food-search"
					className="text-xs text-muted-foreground font-medium"
				>
					Food
				</label>
				{!showFoodSearch ? (
					<button
						type="button"
						onClick={() => {
							setShowFoodSearch(true);
							setTimeout(() => searchInputRef.current?.focus(), 0);
						}}
						className="flex items-center gap-2 w-full rounded-md border px-3 py-2 text-sm text-left hover:bg-accent/50"
					>
						<UtensilsCrossed className="size-3.5 text-muted-foreground" />
						<span className="flex-1 truncate">
							{selectedFood?.name || newFoodName || parsed.food.rawText}
						</span>
						{newFoodName && (
							<Badge variant="secondary" className="text-[10px] px-1.5 py-0">
								new
							</Badge>
						)}
						<ChevronDown className="size-3.5 text-muted-foreground" />
					</button>
				) : (
					<div className="relative">
						<Input
							id="edit-food-search"
							ref={searchInputRef}
							value={foodSearch}
							onChange={(e) => setFoodSearch(e.target.value)}
							placeholder="Search foods..."
							className="text-sm"
							onBlur={() => {
								blurTimeoutRef.current = setTimeout(
									() => setShowFoodSearch(false),
									200,
								);
							}}
							role="combobox"
							aria-expanded={true}
							aria-controls={listboxId}
							autoComplete="off"
						/>
						<div
							id={listboxId}
							role="listbox"
							className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-popover shadow-md"
						>
							{/* Show existing matches from parsing */}
							{parsed.food.matches.length > 0 && !foodSearch.trim() && (
								<div className="px-2 py-1 text-xs text-muted-foreground border-b">
									Best matches
								</div>
							)}
							{(!foodSearch.trim()
								? parsed.food.matches.slice(0, 5).map((m) => m.food)
								: filteredFoods
							).map((food) => (
								<button
									key={food.id}
									type="button"
									role="option"
									aria-selected={food.id === selectedFoodId}
									className={cn(
										"flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent",
										food.id === selectedFoodId && "bg-accent font-medium",
									)}
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => handleSelectExistingFood(food)}
								>
									{food.id === selectedFoodId && <Check className="size-3.5" />}
									<span className={food.id !== selectedFoodId ? "pl-5" : ""}>
										{food.name}
									</span>
								</button>
							))}

							{/* Create new option */}
							<button
								type="button"
								role="option"
								aria-selected={false}
								className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent border-t"
								onMouseDown={(e) => e.preventDefault()}
								onClick={handleCreateNewFood}
							>
								<Plus className="size-3.5" />
								<span>
									Add "
									<span className="font-medium">
										{foodSearch.trim() || parsed.food.rawText}
									</span>
									" as new food
								</span>
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Amount */}
			<div className="space-y-1.5">
				<label
					htmlFor="edit-amount"
					className="text-xs text-muted-foreground font-medium"
				>
					Amount
				</label>
				<Input
					id="edit-amount"
					value={amount}
					onChange={(e) => onAmountChange(e.target.value)}
					placeholder="e.g. 1 can, 50g, 1/2 cup"
					className="text-sm"
				/>
			</div>

			{/* Time + Date row */}
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<span className="text-xs text-muted-foreground font-medium">
						Time
					</span>
					<div className="flex gap-1">
						<Button
							type="button"
							variant={mealTime === "morning" ? "default" : "outline"}
							size="sm"
							className="flex-1 text-xs"
							onClick={() => onMealTimeChange("morning")}
						>
							AM
						</Button>
						<Button
							type="button"
							variant={mealTime === "evening" ? "default" : "outline"}
							size="sm"
							className="flex-1 text-xs"
							onClick={() => onMealTimeChange("evening")}
						>
							PM
						</Button>
					</div>
				</div>
				<div className="space-y-1.5">
					<label
						htmlFor="edit-date"
						className="text-xs text-muted-foreground font-medium"
					>
						Date
					</label>
					<Input
						id="edit-date"
						type="date"
						value={mealDate}
						onChange={(e) => onMealDateChange(e.target.value)}
						className="text-sm"
					/>
				</div>
			</div>

			{/* Notes */}
			<div className="space-y-1.5">
				<label
					htmlFor="edit-notes"
					className="text-xs text-muted-foreground font-medium"
				>
					Notes
				</label>
				<Input
					id="edit-notes"
					value={notes}
					onChange={(e) => onNotesChange(e.target.value)}
					placeholder="Optional notes..."
					className="text-sm"
				/>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
	const date = new Date(`${dateStr}T00:00:00`);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (dateStr === today.toISOString().split("T")[0]) return "Today";
	if (dateStr === yesterday.toISOString().split("T")[0]) return "Yesterday";

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}
