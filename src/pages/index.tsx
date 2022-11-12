import { useSession } from "next-auth/react";
import { FC } from "react";
import Layout from "../components/Layout";
import { boards } from "../server/trpc/router/_app";
import { trpc } from "../utils/trpc";
const Home = () => {
	const { data: session } = useSession();
	const query = trpc.main.getBoards.useQuery(undefined, {
		enabled: session?.user ? true : false,
	});
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
	return (
		<Layout>
			<div className="flex gap-5 p-5">
				{query.data.map((x) => (
					<Board board={x} key={x.id} />
				))}
			</div>
		</Layout>
	);
};

export default Home;

const Board: FC<{ board: boards[number] }> = ({ board }) => {
	return <h1>{board.title}</h1>;
};
