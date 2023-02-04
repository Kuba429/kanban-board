import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";

const AuthTest = () => {
	const { data: session } = useSession();
	const query = trpc.board.getBoards.useQuery(undefined, {
		enabled: session?.user ? true : false, // can't just cast it as bool for whatever reason
	});
	if (session) {
		return (
			<div>
				{query.status === "success" && (
					<pre className="w-screen whitespace-pre-wrap">
						{JSON.stringify(query.data)}
					</pre>
				)}
				<button onClick={() => signOut()}>Sign out</button>
			</div>
		);
	}
	return (
		<div>
			<button onClick={() => signIn()}>sign in</button>
		</div>
	);
};
export default AuthTest;
