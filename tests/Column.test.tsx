import { cleanup, render, screen } from "@testing-library/react";
import { describe, test, expect, beforeEach, afterEach } from "vitest";
import Column from "../src/components/Column";
import { Column as ColumnType } from "../src/stores/columns";
describe("Column component", () => {
	const columnId = "columnid1";
	const columnProp: ColumnType = {
		items: [
			{
				id: "someitem1",
				updatedAt: new Date(),
				createdAt: new Date(),
				title: "Item1",
				index: 0,
				content: "Elit nisi nam cumque ducimus",
				columnId,
				isLocalOnly: false,
			},
			{
				id: "someitem2",
				updatedAt: new Date(),
				createdAt: new Date(),
				title: "Item2",
				index: 1,
				content: "Elit nisi nam cumque ducimus",
				columnId,
				isLocalOnly: false,
			},
		],
		id: columnId,
		title: "Some column",
		boardId: "boardid12312",
		createdAt: new Date(),
		updatedAt: new Date(),
	};
	beforeEach(() => {
		render(<Column column={columnProp} key={columnProp.id} />);
	});
	afterEach(() => cleanup());
	test("column exists", () => {
		expect(screen.getByTestId("column")).toBeInTheDocument();
	});
	test("has correct number of items", () => {
		const columnElement = screen.getByTestId("column");
		const items = columnElement.querySelectorAll('[data-testid="item"]');
		items.forEach((i) => {
			expect(i).toBeInTheDocument();
		});
		expect(items.length).toEqual(columnProp.items.length);
	});
});
