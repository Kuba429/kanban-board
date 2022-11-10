import { animated, useSpring } from "@react-spring/web";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { IoMdMenu } from "react-icons/io";

const Drawer = () => {
	const [status, setStatus] = useAtom(drawerStatusAtom);
	const x = () => (status ? "0%" : "-200%");
	const [style, api] = useSpring(() => ({ from: { x: x() } }));
	useEffect(() => {
		api.start({ to: { x: x() } });
	}, [status, api]);
	return (
		<>
			<div className="border-b border-white/25 bg-black-800 p-3 text-white">
				<div
					className="aspect-square w-fit cursor-pointer rounded p-2 transition-colors hover:bg-black-100/10"
					onClick={() => setStatus((x) => !x)}
				>
					<IoMdMenu />
				</div>
			</div>
			<animated.div
				style={style}
				className="fixed z-20 h-full w-52 border-r border-white/25 bg-black-800 text-white"
			>
				drawer
			</animated.div>
			{status && (
				<div
					onClick={() => setStatus(false)}
					className="fixed z-10 h-full w-full bg-black-100/5"
				></div>
			)}
		</>
	);
};

export default Drawer;

const drawerStatusAtom = atom(false);
