import { signIn, signOut, useSession } from "next-auth/react";

const AuthTest = () => {
	const { data: session } = useSession();
	if (!session) {
		return (
			<div>
				<button onClick={() => signIn()}>sign in</button>
			</div>
		);
	}
	return (
		<div>
			<h1>{session.user?.name}</h1>
			<button onClick={() => signOut()}>Sign out</button>
		</div>
	);
};
export default AuthTest;
