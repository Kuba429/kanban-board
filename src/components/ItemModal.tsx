import { animated, useSpring } from "@react-spring/web";
import { useAtom } from "jotai";
import { useEffect, useState, type FC } from "react";
import { modalAtom, type ModalAtomType } from "../stores/modal";
import { sleep } from "../utils/sleep";

export const ItemModal: FC<{ modalState: ModalAtomType }> = ({
	modalState,
}) => {
	const [, setModalState] = useAtom(modalAtom);
	const { itemRect, itemData } = modalState;
	const from = {
		width: itemRect.width,
		height: itemRect.height,
		top: itemRect.y,
		left: itemRect.x,
	};
	const fullVW = document.documentElement.clientWidth;
	const fullVH = document.documentElement.clientHeight;
	const margin = { x: fullVW / 20, y: fullVH / 8 };
	const duration = 250;
	const [style, api] = useSpring(() => ({
		from,
		to: {
			width: fullVW - 2 * margin.x,
			height: fullVH - 2 * margin.y,
			left: margin.x,
			top: margin.y,
		},
		config: { duration },
	}));
	const [opacity, setOpacity] = useState("opacity-0");
	const [bgOpacity, setBgOpacity] = useState("opacity-0");
	const hideModal = async () => {
		setOpacity("opacity-0");
		await sleep(duration);
		setBgOpacity("opacity-0");
		api.start({ to: from, config: { duration } });
		await sleep(duration);
		setModalState(null);
	};
	useEffect(() => {
		setBgOpacity("opacity-1");
		const timeoutId = setTimeout(() => {
			setOpacity("opacity-1");
		}, duration);
		return () => {
			clearTimeout(timeoutId);
		};
	}, [setOpacity, setBgOpacity]);
	return (
		<>
			<div
				className={`fixed left-0 top-0 h-full w-full backdrop-blur transition-opacity ${bgOpacity}`}
				style={{ transitionDuration: duration + "ms" }}
				onClick={hideModal}
			></div>
			<animated.div
				style={style}
				className="[grid-template-rows: auto auto auto] fixed m-auto grid overflow-hidden rounded border border-white/25 bg-black-800 px-12 text-white"
			>
				<div
					className={`${opacity} overflow-scroll`}
					style={{ transitionDuration: duration + "ms" }}
				>
					<h1 className="py-5 text-center text-xl">
						{itemData.title}
					</h1>
					<pre className={`whitespace-pre-wrap transition-opacity`}>
						Lorem, ipsum dolor sit amet consectetur adipisicing
						elit. Accusantium, odio.
					</pre>
				</div>
				<div
					className={`${opacity} grid w-full grid-cols-2 gap-5 self-end py-5`}
					style={{ transitionDuration: duration + "ms" }}
				>
					<button onClick={hideModal} className="btn w-full">
						Cancel
					</button>
					<button className="btn-contrast w-full">Confirm</button>
				</div>
			</animated.div>
		</>
	);
};

export default ItemModal;
