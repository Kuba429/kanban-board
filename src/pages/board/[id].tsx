import { useAtom } from "jotai";
import { type NextPage } from "next";
import { useEffect } from "react";
import { columnsAtom } from "../../stores/columns";
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
	}, [query, setColumns]);
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
		</div>
	);
};
