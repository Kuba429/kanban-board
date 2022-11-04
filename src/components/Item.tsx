import { animated, type SpringRef, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useAtom } from "jotai";
import { useEffect, useRef, type FC } from "react";
import { boardPositions } from "../pages";
import { moveItemAtom, type ItemType } from "../store";
import { sleep } from "../utils/sleep";

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
						if (collidingId && itemValue.y > y) {
							const fromMap = itemsLocal.get(itemId)!;
							fromMap.relY += 20 + height;
							itemsLocal.set(itemId, fromMap);
						}
					}
					if (parentId === itemValue.parentId && itemValue.y > ogY) {
						const fromMap = itemsLocal.get(itemId)!;
						fromMap.relY -= 20 + height;
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
				for (const i of itemsPositions) {
					const [itemId, itemValue] = i;
					if (itemId === item.id) continue;
					if (
						itemValue.parentId === parentId &&
						itemValue.y < (ogY ?? -Infinity)
					) {
						oldOffset += itemValue.height + 20;
					}
					if (
						itemValue.parentId === collidingId &&
						itemValue.y <= y
					) {
						newOffset += itemValue.height + 20;
					}
				}
				api.start({
					to: { x: colliding.x - parent.x, y: newOffset - oldOffset },
					config: { duration },
				});
				ogY = null;
				// move the item and set state
				await sleep(duration);
				moveItem({ itemId: item.id, targetId: collidingId, parentId });
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
	return (
		<animated.div
			style={style}
			ref={itemRef}
			className="w-11/12 touch-none bg-blue-600 p-4 text-center"
			{...bind()}
		>
			{item.data}
		</animated.div>
	);
};
