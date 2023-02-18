import { deleteItemAtom, type Item } from "../stores/columns";
import { animated, useSpring } from "@react-spring/web";
import { useAtom } from "jotai";
import {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useState,
	type FC,
} from "react";
import { updateItemAtom } from "../stores/columns";
import { modalAtom, type ModalAtomType } from "../stores/modal";
import { sleep } from "../utils/sleep";
import { trpc } from "../utils/trpc";
import { AiFillDelete } from "react-icons/ai";
import {
	confirmModalAtom,
	confirmWithModalAtom as confirmWithModalAtom,
} from "./ConfirmModal";

export const DURATION = 250;

// modal is divided into 3 components:
// - ItemModal - only modal logic, animation and stuff
// - ModalUpdate / ModalCreate - handle logic for updating and creating items and pass state and handlers to last component
// - ModalContent - basically a form. Both components for creating and updating render this component.
// ModalUpdate and ModalCreate were made to separate their logic while keeping the exact same experience by showing user the same form.
//
// Please note that even though this component is separated, it's parts aren't meant to be used independently. It is tailored specifically for this situation

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
	const [style, api] = useSpring(() => ({
		from,
		to: {
			width: fullVW - 2 * margin.x,
			height: fullVH - 2 * margin.y,
			left: margin.x,
			top: margin.y,
		},
		config: { duration: DURATION },
	}));
	const [opacity, setOpacity] = useState("opacity-0");
	const [bgOpacity, setBgOpacity] = useState("opacity-0");
	const hideModal = async () => {
		setOpacity("opacity-0");
		await sleep(DURATION);
		setBgOpacity("opacity-0");
		api.start({ to: from, config: { duration: DURATION } });
		await sleep(DURATION);
		setModalState(null);
	};
	useEffect(() => {
		setBgOpacity("opacity-1");
		const timeoutId = setTimeout(() => {
			setOpacity("opacity-1");
		}, DURATION);
		return () => {
			clearTimeout(timeoutId);
		};
	}, [setOpacity, setBgOpacity]);

	const ModalAction = itemData.isLocalOnly ? ModalCreate : ModalUpdate;
	return (
		<>
			<div
				className={`fixed left-0 top-0 z-10 h-full w-full backdrop-blur transition-opacity ${bgOpacity}`}
				style={{ transitionDuration: DURATION + "ms" }}
				onClick={hideModal}
			></div>
			<animated.div
				style={style}
				className="fixed z-20 m-auto flex flex-col overflow-hidden rounded border border-white/25 bg-black-800 px-10 text-white"
			>
				<ModalAction
					itemData={itemData}
					opacity={opacity}
					hideModal={hideModal}
				/>
			</animated.div>
		</>
	);
};

export default ItemModal;

type ModalUpdateOrCreateProps = {
	opacity: string;
	itemData: Item;
	hideModal: () => Promise<void>;
};

const ModalUpdate = ({
	opacity,
	itemData,
	hideModal,
}: ModalUpdateOrCreateProps) => {
	const [title, setTitle] = useState(itemData.title);
	const [content, setContent] = useState(itemData.content ?? "");
	const [, updateItem] = useAtom(updateItemAtom);
	const mutation = trpc.item.updateItem.useMutation({
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
		<ModalContent
			mutationStatus={mutation.status}
			{...{
				opacity,
				hideModal,
				setContent,
				setTitle,
				content,
				title,
				handleClick,
				itemData,
			}}
		/>
	);
};

const ModalCreate = ({
	opacity,
	itemData,
	hideModal,
}: ModalUpdateOrCreateProps) => {
	const [title, setTitle] = useState(itemData.title);
	const [content, setContent] = useState(itemData.content ?? "");
	const [, updateItem] = useAtom(updateItemAtom);
	const mutation = trpc.item.createItem.useMutation({
		onSuccess: () => {
			hideModal();
		},
	});
	useEffect(() => {
		mutation.data &&
			updateItem({
				id: itemData.id,
				content: mutation.data.content,
				title: mutation.data.title,
				newId: mutation.data?.id,
			});
	}, [mutation.data, itemData.id, updateItem]);
	const handleClick = () => {
		// only mutate when item has changed
		if (title === itemData.title && content === itemData.content) {
			hideModal();
			return;
		}
		mutation.mutate({
			title: title,
			content: content,
			columnId: itemData.columnId,
			index: itemData.index ?? 0,
		});
	};
	return (
		<ModalContent
			mutationStatus={mutation.status}
			{...{
				opacity,
				hideModal,
				setContent,
				setTitle,
				content,
				title,
				handleClick,
				itemData,
			}}
		/>
	);
};
const ModalContent = ({
	opacity,
	hideModal,
	title,
	setTitle,
	content,
	setContent,
	mutationStatus,
	handleClick,
	itemData,
}: {
	opacity: string;
	hideModal: () => Promise<void>;
	title: string;
	setTitle: Dispatch<SetStateAction<string>>;
	content: string;
	setContent: Dispatch<SetStateAction<string>>;
	mutationStatus: string; // TODO figure out to infer type of mutation.status
	handleClick: () => void;
	itemData: Item;
}) => {
	return (
		<>
			<div
				className={`${opacity} flex h-full flex-col overflow-scroll `}
				style={{ transitionDuration: DURATION + "ms" }}
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
				<DeleteItemButton itemData={itemData} hideModal={hideModal} />
			</div>
			<div
				className={`${opacity} grid h-fit w-full grid-cols-2 gap-5 py-5`}
				style={{ transitionDuration: DURATION + "ms" }}
			>
				<button onClick={hideModal} className="btn w-full">
					Cancel
				</button>

				{mutationStatus === "loading" ? (
					<button
						disabled
						onClick={handleClick}
						className="btn-contrast w-full cursor-wait opacity-60"
					>
						Loading
					</button>
				) : mutationStatus === "error" ? (
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

const DeleteItemButton = ({
	hideModal,
	itemData,
}: {
	hideModal: () => Promise<void>;
	itemData: Item;
}) => {
	const [, deleteItem] = useAtom(deleteItemAtom);
	const deleteMutation = trpc.item.deleteItem.useMutation({
		onSuccess: async () => {
			deleteItem(itemData);
			await hideModal();
		},
	});
	const [, confirmWithModal] = useAtom(confirmModalAtom);
	const handleClick = async () => {
		confirmWithModal({
			content: "This item will be deleted forever",
			header: "Are you sure?",
			callback: () => {
				if (itemData.isLocalOnly) {
					deleteItem(itemData);
					hideModal();
					return;
				}
				deleteMutation.mutate({ itemId: itemData.id });
			},
		});
	};
	return (
		<button
			onClick={handleClick}
			className="text-red inline-flex w-fit items-center gap-1 rounded bg-red-500 p-2"
		>
			{
				//TODO improve design so it doesn't look out of place
			}
			<AiFillDelete /> Delete
		</button>
	);
};
