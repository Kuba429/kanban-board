import { animated, type SpringRef, useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useAtom } from "jotai";
import { MdDragIndicator } from "react-icons/md";
import { useEffect, useRef, type FC } from "react";
import { columnPositions } from "../components/Column";
import { type Column, columnsAtom } from "../stores/columns";
import { sleep } from "../utils/sleep";
import { modalAtom } from "../stores/modal";
import { type Item as ItemType } from "../stores/columns";
import { trpc } from "../utils/trpc";

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
	let centerX = x; // only check if center of dragged item collided with a column
	const centerWidth = 20;
	centerX += width / 2 - centerWidth / 2;

	for (const i of columnPositions) {
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
export const itemsPositions = new Map<string, ItemPosition>();

const resetRelative = (toReset: typeof itemsPositions) => {
	toReset.forEach((i) =>
		i.api.start({ to: { x: 0, y: 0 }, immediate: true })
	);
};

export const Item: FC<{ item: ItemType; parentId: string }> = ({
	item,
	parentId,
}) => {
	const [columns, setColumns] = useAtom(columnsAtom); // used to get new indexes of all items
	const mutation = trpc.main.moveItem.useMutation();
	const [style, api] = useSpring(() => ({ to: { x: 0, y: 0 } }));
	let ogY: number | null = null; // y before item was dragged
	const itemRef = useRef<HTMLDivElement>(null);
	const bind = useDrag(async (state) => {
		if (state.down) {
			const itemsLocal = copyMap(itemsPositions);
			api.start({
				to: { x: state.movement[0], y: state.movement[1] },
				config: { duration: 20 },
			});
			const rect = itemRef.current?.getBoundingClientRect();
			if (!rect) {
				resetRelative(itemsPositions);
				return;
			}
			const { left: x, top: y, width, height } = rect;
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
				const parent = columnPositions.get(parentId);
				const target = columnPositions.get(collidingId);
				if (!parent || !target) {
					resetRelative(itemsPositions);
					return;
				}
				for (const i of itemsLocal) {
					const [itemId, itemValue] = i;
					if (itemId === item.id) continue;
					if (collidingId === itemValue.parentId) {
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
			const { left: x, top: y, width, height } = rect;
			const col = getColliding({
				x,
				y,
				height,
				width,
			});
			if (col) {
				const { collidingId, colliding } = col;
				const duration = 300;
				const parent = columnPositions.get(parentId);
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
				const newColumns = moveItem({
					columns: columns,
					itemId: item.id,
					targetId: collidingId,
					parentId,
					newIndex,
				});
				const newIndexes = getNewItemIndexes(newColumns, [
					parentId,
					collidingId,
				]);
				!item.isLocalOnly &&
					mutation.mutate({
						newColumnId: collidingId,
						oldColumnId: parentId,
						itemId: item.id,
						newIndexes,
					});
				await sleep(duration);
				setColumns(newColumns!);
			}
			resetRelative(itemsPositions);
		}
	});
	const updatePosition = () => {
		const rect = itemRef.current?.getBoundingClientRect();
		if (!rect) return;
		itemsPositions.set(item.id, {
			api,
			y: rect.y,
			parentId,
			relY: 0,
			height: rect.height,
		});
	};
	useEffect(() => {
		updatePosition();
	}); // run on every rerender
	const [, setModalState] = useAtom(modalAtom);
	const showModal = () => {
		const rect = itemRef.current?.getBoundingClientRect();
		if (!rect) return;
		setModalState({ itemRect: rect, itemData: item });
	};
	return (
		<>
			<animated.div
				style={style}
				ref={itemRef}
				className="flex w-11/12 items-center justify-between rounded-md border border-white/25 bg-black-800 p-4 transition-colors hover:border-white"
			>
				<span onClick={showModal}>{item.title}</span>
				<div {...bind()} className="drag-handle">
					<MdDragIndicator />
				</div>
			</animated.div>
		</>
	);
};

const moveItem = ({
	columns,
	itemId,
	parentId,
	targetId,
	newIndex,
}: {
	columns: Column[];
	itemId: string;
	parentId: string;
	targetId: string;
	newIndex: number;
}) => {
	const newColumns = [...columns];
	const parentColumn = newColumns.find((b) => b.id === parentId);
	const targetColumn = newColumns.find((b) => b.id === targetId);

	const itemIndex =
		parentColumn?.items.findIndex((i) => i.id === itemId) ?? -1;
	if (itemIndex < 0 || !parentColumn || !targetColumn) return columns;
	const it = parentColumn.items.splice(itemIndex, 1)[0];
	if (!it) return columns;
	it.index = newIndex;
	it.columnId = targetId;
	targetColumn.items.splice(newIndex, 0, it);
	return newColumns;
};

const getNewItemIndexes = (columns: Column[], ids: string[]) => {
	type newIndexes = { id: string; index: number }[];
	const newIndexes: newIndexes = [];
	columns.forEach((col) => {
		if (ids.includes(col.id)) {
			col.items.forEach((i, index) => {
				!i.isLocalOnly && newIndexes.push({ id: i.id, index }); // ignore local items (ones that haven't been synced with db yet)
			});
		}
	});
	return newIndexes;
};

// map is being copied this way in order to avoid referencing the same value
const copyMap = <T, K>(originalMap: Map<T, K>) => {
	const newMap: typeof originalMap = new Map();
	originalMap.forEach((val, key) => newMap.set(key, { ...val }));
	return newMap;
};
