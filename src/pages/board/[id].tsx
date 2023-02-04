import { useAtom } from "jotai";
import { type NextPage } from "next";
import { useEffect, useMemo, useRef } from "react";
import { columnsAtom, addColumnAtom } from "../../stores/columns";
import { ItemModal } from "../../components/ItemModal";
import { modalAtom } from "../../stores/modal";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import Column from "../../components/Column";
import { columnsScrollAtom } from "../../stores/scrolls";
import { throttle } from "../../utils/throttle";

const Board: NextPage = () => {
	const { id } = useRouter().query;
	const [, setColumns] = useAtom(columnsAtom);
	const query = trpc.board.getBoard.useQuery(
		{
			boardId: id?.toString() ?? "",
		},
		{ refetchOnWindowFocus: false }
	);
	useEffect(() => {
		query.data && setColumns(query.data.columns);
	}, [query.data, setColumns]);
	const [itemModal] = useAtom(modalAtom);
	return (
		<Layout>
			<Columns />
			{itemModal && <ItemModal modalState={itemModal} />}
		</Layout>
	);
};

export default Board;

const Columns = () => {
	const [columns] = useAtom(columnsAtom);
	const [, setScroll] = useAtom(columnsScrollAtom);
	const divRef = useRef<HTMLDivElement>(null);
	const handleScroll = useMemo(
		() => throttle(() => setScroll(divRef.current?.scrollLeft ?? 0), 1000),
		[setScroll, divRef]
	);
	return (
		<div
			ref={divRef}
			onScroll={() => handleScroll()}
			className="h-full w-full overflow-auto px-5"
		>
			<div className="flex h-full w-fit min-w-full select-none items-center justify-center gap-gap overflow-auto">
				{columns.map((x) => (
					<Column key={x.id} column={x} />
				))}
				<AddColumn />
			</div>
		</div>
	);
};
const AddColumn = () => {
	const { id } = useRouter().query;
	const [, addColumn] = useAtom(addColumnAtom);
	const mutation = trpc.column.createColumn.useMutation();
	const handleClick = async () => {
		mutation.mutate({ boardId: id?.toString() ?? "" });
	};
	useEffect(() => {
		if (!mutation.data) return;
		addColumn({ ...mutation.data, items: [] });
	}, [mutation.data]);
	return (
		<div className="h-4/5 w-64 text-center">
			<button
				onClick={handleClick}
				className="w-full rounded-xl border border-white/25 bg-black-800 p-3"
			>
				Add column
			</button>
		</div>
	);
};
