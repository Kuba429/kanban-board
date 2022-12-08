import { useAtom } from "jotai";
import { type NextPage } from "next";
import { useEffect } from "react";
import { type Column as ColumnType, columnsAtom } from "../../stores/columns";
import { ItemModal } from "../../components/ItemModal";
import { modalAtom } from "../../stores/modal";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import Column from "../../components/Column";

const Board: NextPage = () => {
	const { id } = useRouter().query;
	const [, setColumns] = useAtom(columnsAtom);
	const query = trpc.main.getBoard.useQuery(
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
	return (
		<div className="flex h-full w-fit min-w-full select-none items-center justify-center gap-gap overflow-scroll">
			{columns.map((x) => (
				<Column key={x.id} column={x} />
			))}
			<AddColumn />
		</div>
	);
};
const AddColumn = () => {
	const { id } = useRouter().query;
	const mutation = trpc.main.createColumn.useMutation();
	const trpcContext = trpc.useContext();
	const handleClick = async () => {
		mutation.mutate({ boardId: id?.toString() ?? "" });
	};
	useEffect(() => {
		trpcContext.main.getBoard.setData((oldData) => {
			console.log(oldData);
			if (!oldData || !mutation.data) return oldData;
			const newColumn: ColumnType = { ...mutation.data, items: [] };
			// TODO oldData is undefined
			return {
				...oldData,
				columns: [...oldData.columns, newColumn],
			};
		});
	}, [mutation.data, trpcContext]);
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
