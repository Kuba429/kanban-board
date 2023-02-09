import { render, screen } from "@testing-library/react";
import { expect, test, describe } from "vitest";
import { copyMap, Item } from "../src/components/Item";
import { type Item as ItemInterface } from "../src/stores/columns";

describe("Item component", () => {
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
	test("item exists", () => {
		expect(itemElement).toBeInTheDocument();
	});
	test("item displays title", () => {
		expect(itemElement).toHaveTextContent(itemProp.title);
	});
});

// functions from Item file
test("copy map", () => {
	const originalMap = new Map([
		["a", { a: "abcdefg" }],
		["b", { a: "vvv" }],
		["c", { a: "pppasdasd" }],
		["d", { a: "123" }],
	]);
	const copiedMap = copyMap(originalMap);
	expect(JSON.stringify([...originalMap.entries()])).toEqual(
		JSON.stringify([...copiedMap.entries()])
	);
});
