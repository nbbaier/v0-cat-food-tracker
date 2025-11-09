"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type Food = {
	id: string;
	name: string;
	preference: string;
};

type Meal = {
	mealDate: string;
	mealTime: "morning" | "evening";
	foodId: string;
	amount: string;
	notes: string;
};

type AddMealDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAdd: (meal: Meal) => void;
};

export function AddMealDialog({
	open,
	onOpenChange,
	onAdd,
}: AddMealDialogProps) {
	const [foods, setFoods] = useState<Food[]>([]);
	const [mealDate, setMealDate] = useState(
		new Date().toISOString().split("T")[0],
	);
	const [mealTime, setMealTime] = useState<"morning" | "evening">("morning");
	const [foodId, setFoodId] = useState("");
	const [amount, setAmount] = useState("");
	const [notes, setNotes] = useState("");

	// Fetch foods when dialog opens
	useEffect(() => {
		if (open) {
			fetchFoods();
		}
	}, [open]);

	const fetchFoods = async () => {
		try {
			const response = await fetch("/api/foods");
			if (response.ok) {
				const data = await response.json();
				// Filter out archived foods
				const activeFoods = data.filter((food: any) => !food.archived);
				setFoods(activeFoods);
			}
		} catch (error) {
			console.error("Error fetching foods:", error);
		}
	};

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
		setMealDate(new Date().toISOString().split("T")[0]);
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
							<Select value={foodId} onValueChange={setFoodId}>
								<SelectTrigger id="food">
									<SelectValue placeholder="Select a food" />
								</SelectTrigger>
								<SelectContent>
									{foods.map((food) => (
										<SelectItem key={food.id} value={food.id}>
											{food.name}
										</SelectItem>
									))}
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
