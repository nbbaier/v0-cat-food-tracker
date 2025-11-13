"use client";

import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useLayoutEffect } from "react";
import { useHeaderActions } from "@/components/header-context";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";

interface HeaderQuickAddButtonProps {
	onClick: () => void;
}

export function HeaderQuickAddButton({
	onClick,
}: HeaderQuickAddButtonProps): ReactNode {
	const { setActions } = useHeaderActions();

	useLayoutEffect(() => {
		setActions(
			<ButtonGroup className="shrink-0">
				<Button variant="outline" size="icon-lg" onClick={onClick}>
					<Plus className="size-4" />
				</Button>
			</ButtonGroup>,
		);

		return () => {
			setActions(null);
		};
	}, [setActions, onClick]);

	return null;
}
