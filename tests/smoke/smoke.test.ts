import { describe, expect, it } from "vitest";

describe("smoke", () => {
	it("runs vitest", () => {
		expect(true).toBe(true);
	});

	it("has jsdom available", () => {
		const el = document.createElement("div");
		el.id = "root";
		document.body.appendChild(el);
		expect(document.getElementById("root")).toBe(el);
	});
});
