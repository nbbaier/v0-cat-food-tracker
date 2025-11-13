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
import { FieldError } from "@/components/ui/field";
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
import { mealInputSchema } from "@/lib/validations";

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
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});

		const mealData = {
			mealDate,
			mealTime,
			foodId,
			amount: amount.trim(),
			notes: notes.trim() || undefined,
		};

		const result = mealInputSchema.safeParse(mealData);
		if (!result.success) {
			const fieldErrors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0] as string;
				fieldErrors[field] = issue.message;
			}
			setErrors(fieldErrors);
			return;
		}

		onAdd(result.data as MealInput);

		setMealDate(getDateString());
		setMealTime("morning");
		setFoodId("");
		setAmount("");
		setNotes("");
		setErrors({});
	};

	const handleOpenChangeWithReset = (isOpen: boolean) => {
		if (!isOpen) {
			setErrors({});
		}
		onOpenChange(isOpen);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChangeWithReset}>
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
								onChange={(e) => {
									setMealDate(e.target.value);
									if (errors.mealDate) {
										setErrors((prev) => {
											const next = { ...prev };
											delete next.mealDate;
											return next;
										});
									}
								}}
								autoFocus
								aria-invalid={!!errors.mealDate}
							/>
							{errors.mealDate && <FieldError>{errors.mealDate}</FieldError>}
						</div>

						<div className="space-y-3">
							<Label>Meal Time</Label>
							<RadioGroup
								value={mealTime}
								onValueChange={(v) => {
									setMealTime(v as "morning" | "evening");
									if (errors.mealTime) {
										setErrors((prev) => {
											const next = { ...prev };
											delete next.mealTime;
											return next;
										});
									}
								}}
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
							{errors.mealTime && <FieldError>{errors.mealTime}</FieldError>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="food">Food</Label>
							<Select
								value={foodId}
								onValueChange={(value) => {
									setFoodId(value);
									if (errors.foodId) {
										setErrors((prev) => {
											const next = { ...prev };
											delete next.foodId;
											return next;
										});
									}
								}}
								disabled={isLoadingFoods}
							>
								<SelectTrigger id="food" aria-invalid={!!errors.foodId}>
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
							{errors.foodId && <FieldError>{errors.foodId}</FieldError>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="amount">Amount</Label>
							<Input
								id="amount"
								placeholder='e.g., "1 can", "1/2 cup", "50g"'
								value={amount}
								onChange={(e) => {
									setAmount(e.target.value);
									if (errors.amount) {
										setErrors((prev) => {
											const next = { ...prev };
											delete next.amount;
											return next;
										});
									}
								}}
								aria-invalid={!!errors.amount}
							/>
							{errors.amount && <FieldError>{errors.amount}</FieldError>}
						</div>

						<div className="space-y-2">
							<Label htmlFor="notes">Notes (optional)</Label>
							<Textarea
								id="notes"
								placeholder="Any observations..."
								value={notes}
								onChange={(e) => {
									setNotes(e.target.value);
									if (errors.notes) {
										setErrors((prev) => {
											const next = { ...prev };
											delete next.notes;
											return next;
										});
									}
								}}
								rows={3}
								aria-invalid={!!errors.notes}
							/>
							{errors.notes && <FieldError>{errors.notes}</FieldError>}
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChangeWithReset(false)}
						>
							Cancel
						</Button>
						<Button type="submit">Log Meal</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
