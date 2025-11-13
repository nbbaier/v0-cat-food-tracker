"use client";

import { createContext, type ReactNode, useState } from "react";

type HeaderActionsContextType = {
	actions: ReactNode | null;
	setActions: (actions: ReactNode | null) => void;
};

const HeaderActionsContext = createContext<
	HeaderActionsContextType | undefined
>(undefined);

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
	const [actions, setActions] = useState<ReactNode | null>(null);

	return (
		<HeaderActionsContext.Provider value={{ actions, setActions }}>
			{children}
		</HeaderActionsContext.Provider>
	);
}
