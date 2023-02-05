import { afterEach, beforeAll, expect, vi } from "vitest";
import matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";

expect.extend(matchers);

afterEach(() => {
	cleanup();
});

beforeAll(() => {
	// mock trpc
	vi.mock("../src/utils/trpc", () => ({
		trpc: {
			item: {
				moveItem: {
					useMutation: vi.fn(() => ({
						mutate: vi.fn(() => () => console.log("mutate")),
						status: "success",
					})),
				},
			},
		},
	}));
});
