import { render, screen } from "@testing-library/react";
import { expect, test, it } from "vitest";
import { Item } from "../src/components/Item";
import { type Item as ItemInterface } from "../src/stores/columns";

test("Item component", () => {
	const itemProp: ItemInterface = {
		id: "some id",
		index: 0,
		title: "Title of item",
		content: "Content of item",
		columnId: "columnsid",
		createdAt: new Date(),
		updatedAt: new Date(),
	};
	render(
		<Item item={itemProp} key={itemProp.id} parentId={itemProp.columnId} />
	);
	const itemElement = screen.getByTestId("item");
	it("item exists", () => {
		expect(itemElement).toBeInTheDocument();
	});
	it("item displays title", () => {
		expect(itemElement).toHaveTextContent(itemProp.title);
	});
});
