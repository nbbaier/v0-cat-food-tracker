"use client";

import {
	ArrowDownAZ,
	ArrowUpAZ,
	ChevronDown,
	ChevronUp,
	HelpCircle,
	RotateCcw,
	Search,
	ThumbsDown,
	ThumbsUp,
} from "lucide-react";
import type { InventoryFilter, SortOption } from "@/app/page";
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

type FoodFiltersProps = {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	preferenceFilters: Set<"likes" | "dislikes" | "unknown">;
	onTogglePreference: (preference: "likes" | "dislikes" | "unknown") => void;
	inventoryFilter: InventoryFilter;
	onInventoryFilterChange: (value: InventoryFilter) => void;
	sortBy: SortOption;
	onSortByChange: (value: SortOption) => void;
	sortOrder: "asc" | "desc";
	onSortOrderToggle: () => void;
	onReset: () => void;
	isMinimized: boolean;
	onToggleMinimize: () => void;
};

export function FoodFilters({
	searchTerm,
	onSearchChange,
	preferenceFilters,
	onTogglePreference,
	inventoryFilter,
	onInventoryFilterChange,
	sortBy,
	onSortByChange,
	sortOrder,
	onSortOrderToggle,
	onReset,
	isMinimized,
	onToggleMinimize,
}: FoodFiltersProps) {
	return (
		<div className="flex flex-col gap-4 p-4 mb-6 rounded-lg border bg-card">
			{/* Header with Reset and Minimize buttons */}
			<div className="flex justify-between items-center">
				<h2 className="text-lg font-semibold">Filters</h2>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onReset}
						title="Reset all filters"
						className="shadow-none"
					>
						<RotateCcw className="size-4" />
						<span className="ml-2">Reset</span>
					</Button>
					<Button
						variant="outline"
						size="sm"
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
			</div>

			{/* Filter controls - only shown when not minimized */}
			{!isMinimized && (
				<>
					{/* Search */}
					<div className="flex flex-col gap-2">
						<Label htmlFor="search" className="text-sm font-medium">
							Search Notes
						</Label>
						<div className="relative">
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
					</div>

					<div className="grid gap-4 sm:grid-cols-3">
						{/* Preference Filter */}
						<div className="flex flex-col gap-2">
							<Label className="text-sm font-medium">Preference</Label>
							<div className="flex gap-1">
								<Button
									variant={
										preferenceFilters.has("likes") ? "default" : "outline"
									}
									size="sm"
									onClick={() => onTogglePreference("likes")}
									title="Filter by likes"
									className="shadow-none"
								>
									<ThumbsUp className="size-4" />
								</Button>
								<Button
									variant={
										preferenceFilters.has("dislikes")
											? "destructive"
											: "outline"
									}
									size="sm"
									onClick={() => onTogglePreference("dislikes")}
									title="Filter by dislikes"
									className="shadow-none"
								>
									<ThumbsDown className="size-4" />
								</Button>
								<Button
									variant={
										preferenceFilters.has("unknown") ? "secondary" : "outline"
									}
									size="sm"
									onClick={() => onTogglePreference("unknown")}
									title="Filter by unknown"
									className="shadow-none"
								>
									<HelpCircle className="size-4" />
								</Button>
							</div>
						</div>

						{/* Inventory Filter */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="inventory-filter" className="text-sm font-medium">
								Inventory Status
							</Label>
							<Select
								value={inventoryFilter}
								onValueChange={onInventoryFilterChange}
							>
								<SelectTrigger id="inventory-filter">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="in-stock">In Stock</SelectItem>
									<SelectItem value="out-of-stock">Out of Stock</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Sort */}
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
										<SelectItem value="name">Name</SelectItem>
										<SelectItem value="preference">Preference</SelectItem>
										<SelectItem value="inventory">Inventory</SelectItem>
										<SelectItem value="date">Date Added</SelectItem>
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
				</>
			)}
		</div>
	);
}
