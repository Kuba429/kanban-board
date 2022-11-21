import { type Item } from "@prisma/client";
import { animated, useSpring } from "@react-spring/web";
import { useAtom } from "jotai";
import { useEffect, useState, type FC } from "react";
import { updateItemAtom } from "../stores/columns";
import { modalAtom, type ModalAtomType } from "../stores/modal";
import { sleep } from "../utils/sleep";
import { trpc } from "../utils/trpc";

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
				className="fixed m-auto flex flex-col overflow-hidden rounded border border-white/25 bg-black-800 px-10 text-white"
			>
				<ModalContent
					opacity={opacity}
					duration={duration}
					itemData={itemData}
					hideModal={hideModal}
				/>
			</animated.div>
		</>
	);
};

export default ItemModal;

// nested inside modal to focus only on data and let the parent take care of animation, ui and all that crap
const ModalContent = ({
	opacity,
	duration,
	itemData,
	hideModal,
}: {
	opacity: string;
	duration: number;
	itemData: Item;
	hideModal: () => Promise<void>;
}) => {
	const [title, setTitle] = useState(itemData.title);
	const [content, setContent] = useState(itemData.content ?? "");
	const [, updateItem] = useAtom(updateItemAtom);
	const mutation = trpc.main.updateItem.useMutation({
		onSuccess: (_, variables) => {
			updateItem(variables);
			hideModal();
		},
	});

	const handleClick = () => {
		// only mutate when item has changed
		if (title === itemData.title && content === itemData.content) {
			hideModal();
			return;
		}
		mutation.mutate({ id: itemData.id, title: title, content: content });
	};
	return (
		<>
			<div
				className={`${opacity} flex h-full flex-col overflow-scroll `}
				style={{ transitionDuration: duration + "ms" }}
			>
				<input
					onInput={(e) =>
						setTitle((e.target as HTMLInputElement).value)
					}
					value={title}
					className="my-5 w-full rounded bg-transparent text-center text-xl outline-none transition-colors focus:bg-black-700"
				/>
				<textarea
					className={`h-full w-full resize-none whitespace-pre-wrap rounded bg-transparent px-2 outline-none transition-all focus:bg-black-700`}
					placeholder="Empty"
					defaultValue={content}
					onInput={(e) =>
						setContent((e.target as HTMLTextAreaElement).value)
					}
				></textarea>
			</div>
			<div
				className={`${opacity} grid h-fit w-full grid-cols-2 gap-5 py-5`}
				style={{ transitionDuration: duration + "ms" }}
			>
				<button onClick={hideModal} className="btn w-full">
					Cancel
				</button>
				{mutation.status === "loading" ? (
					<button
						disabled
						onClick={handleClick}
						className="btn-contrast w-full cursor-wait opacity-60"
					>
						Loading
					</button>
				) : mutation.status === "error" ? (
					<button
						onClick={handleClick}
						className="btn w-full bg-red-600 text-white"
					>
						Try again
					</button>
				) : (
					<button
						onClick={handleClick}
						className="btn-contrast w-full"
					>
						Confirm
					</button>
				)}
			</div>
		</>
	);
};
