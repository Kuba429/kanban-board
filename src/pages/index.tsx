import { type NextPage } from "next";
import { FC } from "react";
import { v4 } from "uuid";

const Home: NextPage = () => {
	return <BoardContainer />;
};

export default Home;
interface ItemType {
	data: string;
	id: string;
}
interface BoardType {
	name: string;
	id: string;
	items: ItemType[];
}
const BoardContainer = () => {
	const boards: BoardType[] = [
		{ name: "a", id: v4(), items: [{ data: "costam", id: v4() }] },
		{ name: "b", id: v4(), items: [{ data: "cosinnego", id: v4() }] },
	];
	return (
		<div className="flex h-full w-full items-center justify-center gap-5 bg-blue-300">
			{boards.map((x) => (
				<Board key={x.id} board={x} />
			))}
		</div>
	);
};

const Board: FC<{ board: BoardType }> = ({ board }) => {
	return (
		<div className="m-12 h-4/5 w-52 bg-blue-800">
			<h2 className="text-center text-xl">{board.name}</h2>
			{board.items.map((x) => (
				<Item item={x} />
			))}
		</div>
	);
};
const Item: FC<{ item: ItemType }> = ({ item }) => {
	return <div>{item.data}</div>;
};
