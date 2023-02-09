import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
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
	render(<Column column={columnProp} key={columnProp.id} />);
	const columnElement = screen.getByTestId("column");
	test("column exists", () => {
		expect(columnElement).toBeInTheDocument();
	});
	test("has correct number of items", () => {
		const items = columnElement.querySelectorAll('[data-testid="item"]');
		expect(items.length).toEqual(columnProp.items.length);
	});
});
