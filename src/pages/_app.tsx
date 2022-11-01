import { type AppType } from "next/app";

import { trpc } from "../utils/trpc";
import { Provider } from "jotai";

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
	return (
		<Provider>
			<Component {...pageProps} />
		</Provider>
	);
};

export default trpc.withTRPC(MyApp);
