"use client";

import { HelpCircle, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Food } from "@/app/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EditFoodDialog } from "./edit-food-dialog";

type FoodTableProps = {
	foods: Food[];
	onUpdate: (id: string, updates: Partial<Food>) => void;
	onDelete: (id: string) => void;
};

export function FoodTable({ foods, onUpdate, onDelete }: FoodTableProps) {
	const [editingFood, setEditingFood] = useState<Food | null>(null);

	return (
		<>
			<div className="overflow-x-auto rounded-lg border">
				<table className="w-full min-w-[640px]">
					<thead className="bg-muted/50">
						<tr className="border-b">
							<th className="px-3 py-2 text-xs font-semibold text-left sm:px-4 sm:py-3 sm:text-sm">
								Name
							</th>
							<th className="px-3 py-2 text-xs font-semibold text-left sm:px-4 sm:py-3 sm:text-sm">
								Preference
							</th>
							<th className="px-3 py-2 text-xs font-semibold text-left sm:px-4 sm:py-3 sm:text-sm">
								Inventory
							</th>
							<th className="hidden px-3 py-2 text-xs font-semibold text-left lg:table-cell sm:px-4 sm:py-3 sm:text-sm">
								Nutrition (DMB)
							</th>
							<th className="hidden px-3 py-2 text-xs font-semibold text-left sm:table-cell sm:px-4 sm:py-3 sm:text-sm">
								Notes
							</th>
							<th className="px-3 py-2 text-xs font-semibold text-right sm:px-4 sm:py-3 sm:text-sm">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{foods.map((food) => (
							<tr
								key={food.id}
								className="border-b last:border-0 hover:bg-muted/30"
							>
								<td className="px-3 py-2 sm:px-4 sm:py-3">
									<Button
										type="button"
										variant="link"
										onClick={() => setEditingFood(food)}
										className="text-sm font-medium text-left hover:underline sm:text-base"
									>
										{food.name}
									</Button>
								</td>
								<td className="px-3 py-2 sm:px-4 sm:py-3">
									<div className="flex gap-0.5 sm:gap-1">
										<Button
											variant={
												food.preference === "likes" ? "default" : "outline"
											}
											size="sm"
											className="p-0 size-7 sm:size-8"
											onClick={() => onUpdate(food.id, { preference: "likes" })}
											title="Likes"
										>
											<ThumbsUp className="size-3 sm:size-4" />
										</Button>
										<Button
											variant={
												food.preference === "dislikes"
													? "destructive"
													: "outline"
											}
											size="sm"
											className="p-0 size-7 sm:size-8"
											onClick={() =>
												onUpdate(food.id, { preference: "dislikes" })
											}
											title="Dislikes"
										>
											<ThumbsDown className="size-3 sm:size-4" />
										</Button>
										<Button
											variant={
												food.preference === "unknown" ? "secondary" : "outline"
											}
											size="sm"
											className="p-0 size-7 sm:size-8"
											onClick={() =>
												onUpdate(food.id, { preference: "unknown" })
											}
											title="Unknown"
										>
											<HelpCircle className="size-3 sm:size-4" />
										</Button>
									</div>
								</td>
								<td className="px-3 py-2 sm:px-4 sm:py-3">
									<Badge
										variant={
											food.inventoryQuantity > 0 ? "default" : "secondary"
										}
										className="text-xs"
									>
										{food.inventoryQuantity > 0
											? `${food.inventoryQuantity} in stock`
											: "Out"}
									</Badge>
								</td>
								<td className="hidden px-3 py-2 lg:table-cell sm:px-4 sm:py-3">
									{food.phosphorusDmb ||
									food.proteinDmb ||
									food.fatDmb ||
									food.fiberDmb ? (
										<div className="space-y-0.5 text-xs text-muted-foreground">
											{food.phosphorusDmb && (
												<div>P: {food.phosphorusDmb}%</div>
											)}
											{food.proteinDmb && <div>Protein: {food.proteinDmb}%</div>}
											{food.fatDmb && <div>Fat: {food.fatDmb}%</div>}
											{food.fiberDmb && <div>Fiber: {food.fiberDmb}%</div>}
										</div>
									) : (
										<span className="text-sm text-muted-foreground">—</span>
									)}
								</td>
								<td className="hidden px-3 py-2 max-w-xs sm:table-cell sm:px-4 sm:py-3">
									<p className="text-sm truncate text-muted-foreground">
										{food.notes || "—"}
									</p>
								</td>
								<td className="px-3 py-2 text-right sm:px-4 sm:py-3">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onDelete(food.id)}
										title="Delete food"
										className="p-0 size-7 sm:size-auto sm:p-2"
									>
										<Trash2 className="size-3.5 sm:size-4" />
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{editingFood && (
				<EditFoodDialog
					food={editingFood}
					open={!!editingFood}
					onOpenChange={(open) => !open && setEditingFood(null)}
					onSave={(updates) => {
						onUpdate(editingFood.id, updates);
						setEditingFood(null);
					}}
				/>
			)}
		</>
	);
}
