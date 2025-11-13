"use client";

import {
	ArrowDownAZ,
	ArrowUpAZ,
	ChevronDown,
	ChevronUp,
	RotateCcw,
	Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type MealTimeFilter = "all" | "morning" | "evening";
type MealSortOption = "date" | "time" | "food";

type MealFiltersProps = {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	mealTimeFilter: MealTimeFilter;
	onMealTimeFilterChange: (value: MealTimeFilter) => void;
	sortBy: MealSortOption;
	onSortByChange: (value: MealSortOption) => void;
	sortOrder: "asc" | "desc";
	onSortOrderToggle: () => void;
	onReset: () => void;
	isMinimized: boolean;
	onToggleMinimize: () => void;
};

export function MealFilters({
	searchTerm,
	onSearchChange,
	mealTimeFilter,
	onMealTimeFilterChange,
	sortBy,
	onSortByChange,
	sortOrder,
	onSortOrderToggle,
	onReset,
	isMinimized,
	onToggleMinimize,
}: MealFiltersProps) {
	return (
		<div className="flex flex-col gap-4 p-4 mb-6 rounded-lg border bg-card">
			<div className="flex gap-2 items-center">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
					<Input
						id="search"
						type="text"
						placeholder="Search in notes..."
						value={searchTerm}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-9 shadow-none"
					/>
				</div>
				<Button
					variant="outline"
					size="default"
					onClick={onReset}
					title="Reset all filters"
					className="shadow-none"
				>
					<RotateCcw className="size-4" />
					<span className="">Reset</span>
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={onToggleMinimize}
					title={isMinimized ? "Expand filters" : "Minimize filters"}
					className="shadow-none"
				>
					{isMinimized ? (
						<ChevronDown className="size-4" />
					) : (
						<ChevronUp className="size-4" />
					)}
				</Button>
			</div>

			{!isMinimized && (
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="flex flex-col gap-2">
						<Label htmlFor="meal-time-filter" className="text-sm font-medium">
							Meal Time
						</Label>
						<Select
							value={mealTimeFilter}
							onValueChange={onMealTimeFilterChange}
						>
							<SelectTrigger id="meal-time-filter">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="morning">Morning</SelectItem>
								<SelectItem value="evening">Evening</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex flex-col gap-2">
						<Label htmlFor="sort-by" className="text-sm font-medium">
							Sort By
						</Label>
						<div className="flex gap-1">
							<Select value={sortBy} onValueChange={onSortByChange}>
								<SelectTrigger id="sort-by" className="flex-1">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="date">Date</SelectItem>
									<SelectItem value="time">Time</SelectItem>
									<SelectItem value="food">Food</SelectItem>
								</SelectContent>
							</Select>
							<Button
								variant="outline"
								size="sm"
								onClick={onSortOrderToggle}
								title={sortOrder === "asc" ? "Ascending" : "Descending"}
								className="shadow-none"
							>
								{sortOrder === "asc" ? (
									<ArrowUpAZ className="size-4" />
								) : (
									<ArrowDownAZ className="size-4" />
								)}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
