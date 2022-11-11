import { ReactNode } from "react";
import Drawer from "./Drawer";

interface LayoutProps {
	children: ReactNode;
}
const Layout = ({ children }: LayoutProps) => {
	return (
		<div className="flex h-full flex-col">
			<Drawer />
			{children}
		</div>
	);
};

export default Layout;
