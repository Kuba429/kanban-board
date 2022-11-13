import { ReactNode } from "react";
import Drawer from "./Drawer";

interface LayoutProps {
	children: ReactNode;
}
const Layout = ({ children }: LayoutProps) => {
	return (
		<div className="flex h-full flex-col bg-black-800 text-white">
			<Drawer />
			{children}
		</div>
	);
};

export default Layout;