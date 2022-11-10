import { type AppType } from "next/app";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../utils/trpc";
import { Provider } from "jotai";

import "../styles/globals.css";
import { type Session } from "next-auth";

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	return (
		<SessionProvider session={session}>
			<Provider>
				<Component {...pageProps} />
			</Provider>
		</SessionProvider>
	);
};

export default trpc.withTRPC(MyApp);
