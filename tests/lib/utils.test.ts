import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("lib/utils", () => {
	it("cn merges class names correctly", () => {
		expect(cn("a", false && "b", "c")).toBe("a c");
		expect(cn("a", ["b", null, "c"])).toBe("a b c");
	});
});
