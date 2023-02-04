import { useSession } from "next-auth/react";
import { useEffect, type FC } from "react";
import Layout from "../components/Layout";
import { type boards } from "../server/trpc/router/_app";
import { AiOutlinePlus } from "react-icons/ai";
import { trpc } from "../utils/trpc";

const Home = () => {
	const { data: session } = useSession();
	const query = trpc.board.getBoards.useQuery(undefined, {
		enabled: session?.user ? true : false,
	});
	const mutation = trpc.board.createBoard.useMutation();
	const trpcContext = trpc.useContext();
	useEffect(() => {
		trpcContext.board.getBoards.setData((oldData) => {
			if (!mutation.data || !oldData) return oldData;
			return [
				...oldData,
				{ id: mutation.data.id, title: mutation.data.title },
			];
		});
	}, [mutation.data, trpcContext]);
	if (!session)
		return (
			<Layout>
				<h1>log in</h1>
			</Layout>
		);
	if (query.status === "loading")
		return (
			<Layout>
				<h1>loading...</h1>
			</Layout>
		);
	if (query.status === "error")
		return (
			<Layout>
				<h1>error</h1>
			</Layout>
		);

	const handleClick = async () => {
		mutation.mutate({ name: "test" });
	};
	return (
		<Layout>
			<div className="grid grid-cols-5 gap-5 p-5">
				{query.data.map((x) => (
					<Board board={x} key={x.id} />
				))}
				<div
					onClick={() => handleClick()}
					className="flex h-24 cursor-pointer items-center justify-center rounded border border-transparent bg-black-200 p-5 text-black-900 transition-colors hover:border-white hover:bg-black-100"
				>
					<AiOutlinePlus className="text-2xl" />
				</div>
			</div>
		</Layout>
	);
};

export default Home;

const Board: FC<{ board: boards[number] }> = ({ board }) => {
	return (
		<a
			href={`/board/${board.id}`}
			className="h-24 rounded border border-transparent bg-black-700 p-5 transition-colors hover:border-black-100 hover:bg-black-600"
		>
			{board.title}
		</a>
	);
};
