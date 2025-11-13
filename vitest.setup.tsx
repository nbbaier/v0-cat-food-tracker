import "@testing-library/jest-dom/vitest";
import type { ComponentPropsWithoutRef } from "react";

vi.mock("next/link", () => ({
	default: ({ href, children, ...rest }: ComponentPropsWithoutRef<"a">) => {
		return (
			<a href={href} {...rest}>
				{children}
			</a>
		);
	},
}));
vi.mock("next/navigation", () => {
	return {
		useRouter: () => ({
			push: vi.fn(),
			replace: vi.fn(),
			back: vi.fn(),
		}),
		useSearchParams: () => new URLSearchParams(),
		usePathname: () => "/",
	};
});

// MSW global server for hook tests - initialized lazily when handlers are provided
let server: ReturnType<typeof import("msw/node").setupServer> | null = null;

export function getServer() {
	if (!server) {
		const { setupServer } = require("msw/node");
		server = setupServer();
		const currentServer = server;
		beforeAll(() => {
			if (currentServer) {
				currentServer.listen({ onUnhandledRequest: "error" });
			}
		});
		afterEach(() => {
			if (currentServer) {
				currentServer.resetHandlers();
			}
		});
		afterAll(() => {
			if (currentServer) {
				currentServer.close();
			}
		});
	}
	return server;
}
