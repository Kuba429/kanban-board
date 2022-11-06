import { animated, type SpringRef, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useAtom } from "jotai";
import { MdDragIndicator } from "react-icons/md";
import { useEffect, useRef, useState, type FC } from "react";
import { boardPositions } from "../pages";
import { moveItemAtom, type ItemType } from "../stores/boards";
import { sleep } from "../utils/sleep";
import { modalAtom, type ModalAtomType } from "../stores/modal";

export const GAP = 20; // this is tied to custom tailwind spacing variable

const getColliding = ({
	x,
	y,
	width,
	height,
}: {
	x: number;
	width: number;
	y: number;
	height: number;
}) => {
	let centerX = x; // only check if center of dragged item collided with a board
	const centerWidth = 20;
	centerX += width / 2 - centerWidth / 2;

	for (const i of boardPositions) {
		const [idx, b] = i;
		if (
			centerX < b.x + b.width &&
			centerX + centerWidth > b.x &&
			y < b.y + b.height &&
			y + height > b.y
		)
			return { collidingId: idx, colliding: b };
	}
	return null;
};

interface ItemPosition {
	y: number;
	relY: number;
	height: number;
	parentId: string;
	api: SpringRef<{
		x: number;
		y: number;
	}>;
}
const itemsPositions = new Map<string, ItemPosition>();

const resetRelative = (toReset: typeof itemsPositions) => {
	toReset.forEach((i) =>
		i.api.start({ to: { x: 0, y: 0 }, immediate: true })
	);
};

export const Item: FC<{ item: ItemType; parentId: string }> = ({
	item,
	parentId,
}) => {
	const [, moveItem] = useAtom(moveItemAtom);
	const [style, api] = useSpring(() => ({ to: { x: 0, y: 0 } }));
	let ogY: number | null = null; // y before item was dragged
	const itemRef = useRef<HTMLDivElement>(null);
	const bind = useDrag(async (state) => {
		// map is being copied this way in order to avoid referencing the same value
		const itemsLocal: typeof itemsPositions = new Map();
		itemsPositions.forEach((val, key) => itemsLocal.set(key, { ...val }));
		if (state.down) {
			api.start({
				to: { x: state.movement[0], y: state.movement[1] },
				config: { duration: 20 },
			});
			const rect = itemRef.current?.getBoundingClientRect();
			if (!rect) {
				resetRelative(itemsPositions);
				return;
			}
			const { x, y, width, height } = rect;
			if (!ogY) {
				ogY = y;
			}
			const col = getColliding({
				x,
				y,
				height,
				width,
			});
			if (col) {
				const { collidingId } = col;
				const parent = boardPositions.get(parentId);
				const target = boardPositions.get(collidingId);
				if (!parent || !target) {
					resetRelative(itemsPositions);
					return;
				}
				for (const i of itemsLocal) {
					const [itemId, itemValue] = i;
					if (itemId === item.id) continue;
					if (collidingId === itemValue.parentId) {
						/// target stuff
						if (collidingId && itemValue.y >= y) {
							const fromMap = itemsLocal.get(itemId)!;
							fromMap.relY += GAP + height;
							itemsLocal.set(itemId, fromMap);
						}
					}
					if (parentId === itemValue.parentId && itemValue.y > ogY) {
						const fromMap = itemsLocal.get(itemId)!;
						fromMap.relY -= GAP + height;
						itemsLocal.set(itemId, fromMap);
					}
				}
				itemsLocal.forEach(
					(val, key) =>
						key !== item.id &&
						val.api.start({ to: { y: val.relY } })
				);
			}
		} else {
			const rect = itemRef.current?.getBoundingClientRect();
			if (!rect) return;
			const { x, y, width, height } = rect;
			const col = getColliding({
				x,
				y,
				height,
				width,
			});
			if (col) {
				const { collidingId, colliding } = col;
				// collision detected
				console.log("collision");
				const duration = 300;
				const parent = boardPositions.get(parentId);
				if (!parent) {
					api.start({
						to: { x: 0, y: 0 },
						config: { duration },
					});
					return;
				}
				let oldOffset = 0; // old y, relative to the first item in the list
				let newOffset = 0; // new y, relative to the first item in the new list
				let newIndex = 0;
				for (const i of itemsPositions) {
					const [itemId, itemValue] = i;
					if (itemId === item.id) continue;
					if (
						itemValue.parentId === parentId &&
						itemValue.y < (ogY ?? -Infinity)
					) {
						oldOffset += itemValue.height + GAP;
					}
					if (
						itemValue.parentId === collidingId &&
						itemValue.y <= y
					) {
						newOffset += itemValue.height + GAP;
						newIndex++;
					}
				}
				api.start({
					to: { x: colliding.x - parent.x, y: newOffset - oldOffset },
					config: { duration },
				});
				ogY = null;
				// move the item and set state
				await sleep(duration);
				moveItem({
					itemId: item.id,
					targetId: collidingId,
					parentId,
					newIndex,
				});
			}
			resetRelative(itemsPositions);
		}
	});
	useEffect(() => {
		const rect = itemRef.current?.getBoundingClientRect();
		if (!rect) return;
		itemsPositions.set(item.id, {
			api,
			y: rect.y,
			parentId,
			relY: 0,
			height: rect.height,
		});
	});
	const [, setModalState] = useAtom(modalAtom);
	const showModal = () => {
		console.log("asd");
		const rect = itemRef.current?.getBoundingClientRect();
		if (!rect) return;
		setModalState({ itemRect: rect, itemData: item });
	};
	return (
		<>
			<animated.div
				style={style}
				ref={itemRef}
				className="flex w-11/12 touch-none items-center justify-between rounded-md border border-white/25 bg-black-800 p-4 transition-colors hover:border-white"
			>
				<span onClick={showModal}>{item.data}</span>
				<div {...bind()} className="drag-handle">
					<MdDragIndicator />
				</div>
			</animated.div>
		</>
	);
};
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
	const duration = 300;
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
				className={`fixed left-0 top-0 h-full w-full backdrop-blur duration-[${duration}ms] transition-opacity ${bgOpacity}`}
				onClick={hideModal}
			></div>
			<animated.div
				style={style}
				className="[grid-template-rows: auto auto auto] fixed m-auto grid overflow-hidden rounded border border-white/25 bg-black-800 px-12 text-white"
			>
				<div
					className={`${opacity} overflow-scroll duration-[${duration}ms]`}
				>
					<h1 className="py-5 text-center text-xl">
						{itemData.data}
					</h1>
					<pre className={`whitespace-pre-wrap transition-opacity`}>
						Lorem, ipsum dolor sit amet consectetur adipisicing
						elit. Accusantium, odio.
					</pre>
				</div>
				<div
					className={`${opacity} grid w-full grid-cols-2 gap-5 py-5 duration-[${duration}ms] self-end`}
				>
					<button
						onClick={hideModal}
						className="w-full rounded border border-white/25 bg-black-900 p-4 hover:border-white"
					>
						Cancel
					</button>
					<button className="w-full rounded border bg-white p-4 text-black-900 hover:border-black-900">
						Confirm
					</button>
				</div>
			</animated.div>
		</>
	);
};
