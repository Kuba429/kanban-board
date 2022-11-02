import { animated, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useAtom } from "jotai";
import { useRef, type FC } from "react";
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
export const Item: FC<{ item: ItemType; parentId: string }> = ({
	item,
	parentId,
}) => {
	const [, moveItem] = useAtom(moveItemAtom);
	const [style, api] = useSpring(() => ({ to: { x: 0, y: 0, top: 0 } }));
	const itemRef = useRef<HTMLDivElement>(null);
	const bind = useDrag(async (state) => {
		if (state.down) {
			const [x, y] = state.movement;
			api.start({ to: { x, y: y }, config: { duration: 20 } });
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
				const parent = boardPositions.get(parentId);
				if (!parent) {
					api.start({
						to: { x: 0, y: 0 },
						config: { duration: 200 },
					});
					return;
				}
				const duration = 300;
				api.start({
					to: { x: colliding.x - parent.x, y: 0 },
					config: { duration },
				});
				// TODO figure out ys
				// move the item and set state
				await sleep(duration);
				moveItem({ itemId: item.id, targetId: collidingId, parentId });
				return;
			}
			// no collision, get back
			api.start({
				to: { x: 0, y: 0 },
				config: { duration: 200 },
			});
		}
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
