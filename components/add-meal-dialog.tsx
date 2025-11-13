"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFoodSummaries } from "@/hooks/use-food-summaries";
import type { MealInput } from "@/lib/types";
import { getDateString } from "@/lib/utils";

type AddMealDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAdd: (meal: MealInput) => void;
};

export function AddMealDialog({
	open,
	onOpenChange,
	onAdd,
}: AddMealDialogProps) {
	const { foods, isLoading: isLoadingFoods } = useFoodSummaries(open);

	const [mealDate, setMealDate] = useState(getDateString());
	const [mealTime, setMealTime] = useState<"morning" | "evening">("morning");
	const [foodId, setFoodId] = useState("");
	const [amount, setAmount] = useState("");
	const [notes, setNotes] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!mealDate || !mealTime || !foodId || !amount.trim()) return;

		onAdd({
			mealDate,
			mealTime,
			foodId,
			amount: amount.trim(),
			notes: notes.trim(),
		});

		// Reset form
		setMealDate(getDateString());
		setMealTime("morning");
		setFoodId("");
		setAmount("");
		setNotes("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Log Meal</DialogTitle>
						<DialogDescription>
							Record a meal that was given to your cat.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 py-4">
						<div className="space-y-2">
							<Label htmlFor="mealDate">Date</Label>
							<Input
								id="mealDate"
								type="date"
								value={mealDate}
								onChange={(e) => setMealDate(e.target.value)}
								autoFocus
							/>
						</div>

						<div className="space-y-3">
							<Label>Meal Time</Label>
							<RadioGroup
								value={mealTime}
								onValueChange={(v) => setMealTime(v as "morning" | "evening")}
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="morning" id="morning" />
									<Label htmlFor="morning" className="font-normal">
										Morning
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="evening" id="evening" />
									<Label htmlFor="evening" className="font-normal">
										Evening
									</Label>
								</div>
							</RadioGroup>
						</div>

						<div className="space-y-2">
							<Label htmlFor="food">Food</Label>
							<Select
								value={foodId}
								onValueChange={setFoodId}
								disabled={isLoadingFoods}
							>
								<SelectTrigger id="food">
									<SelectValue
										placeholder={
											isLoadingFoods ? "Loading foods..." : "Select a food"
										}
									/>
								</SelectTrigger>
								<SelectContent>
									{isLoadingFoods ? (
										<SelectItem value="loading" disabled>
											Loading foods...
										</SelectItem>
									) : foods.length === 0 ? (
										<SelectItem value="no-foods" disabled>
											No foods available
										</SelectItem>
									) : (
										foods.map((food) => (
											<SelectItem key={food.id} value={food.id}>
												{food.name}
											</SelectItem>
										))
									)}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="amount">Amount</Label>
							<Input
								id="amount"
								placeholder='e.g., "1 can", "1/2 cup", "50g"'
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="notes">Notes (optional)</Label>
							<Textarea
								id="notes"
								placeholder="Any observations..."
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								rows={3}
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!mealDate || !mealTime || !foodId || !amount.trim()}
						>
							Log Meal
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
