import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { describe, test, expect, beforeEach, afterEach } from "vitest";
import Column from "../src/components/Column";
import { columnsAtom } from "../src/stores/columns";

describe("Column component", () => {
	beforeEach(async () => {
		render(<ColumnTestWrapper />);
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
	});
	test("adds item on click", async () => {
		const addItemButton = screen.getByTestId("add-item-button");
		expect(addItemButton).toBeInTheDocument();
		const itemsBeforeClick = screen.getAllByTestId("item").length;
		await userEvent.click(addItemButton);
		const itemsAfterClick = screen.getAllByTestId("item").length;
		expect(itemsBeforeClick).toEqual(itemsAfterClick - 1);
	});
});

const ColumnTestWrapper = () => {
	const [columns, setColumns] = useAtom(columnsAtom);
	const columnId = "columnid1";
	useEffect(() => {
		setColumns([
			{
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
			},
		]);
	}, []);
	return <>{columns[0] && <Column column={columns[0]} />}</>;
};
