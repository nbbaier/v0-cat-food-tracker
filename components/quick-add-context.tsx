"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useRef,
} from "react";

type QuickAddDialogContextType = {
	registerDialog: (
		openHandler: (defaultTab?: "food" | "meal") => void,
	) => () => void;
	openDialog: (defaultTab?: "food" | "meal") => void;
};

const QuickAddDialogContext = createContext<
	QuickAddDialogContextType | undefined
>(undefined);

export function QuickAddDialogProvider({ children }: { children: ReactNode }) {
	const openHandlerRef = useRef<
		((defaultTab?: "food" | "meal") => void) | null
	>(null);

	const registerDialog = useCallback(
		(handler: (defaultTab?: "food" | "meal") => void) => {
			openHandlerRef.current = handler;
			return () => {
				if (openHandlerRef.current === handler) {
					openHandlerRef.current = null;
				}
			};
		},
		[],
	);

	const openDialog = useCallback((defaultTab?: "food" | "meal") => {
		if (openHandlerRef.current) {
			openHandlerRef.current(defaultTab);
		}
	}, []);

	const value = useMemo(
		() => ({ registerDialog, openDialog }),
		[registerDialog, openDialog],
	);

	return (
		<QuickAddDialogContext.Provider value={value}>
			{children}
		</QuickAddDialogContext.Provider>
	);
}

export function useQuickAddDialog() {
	const context = useContext(QuickAddDialogContext);
	if (context === undefined) {
		throw new Error(
			"useQuickAddDialog must be used within QuickAddDialogProvider",
		);
	}
	return context;
}
