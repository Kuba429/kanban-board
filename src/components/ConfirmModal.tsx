"use client";
import { animated, useSpring } from "@react-spring/web";
import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { sleep } from "../utils/sleep";
import { DURATION } from "./ItemModal";

export const ConfirmModal = () => {
	const [modalState, setModalState] = useAtom(confirmModalAtom);
	const margin = {
		x: document.documentElement.clientWidth / 3,
		y: document.documentElement.clientHeight / 3,
	};
	// kinda like media query
	if (document.documentElement.clientWidth < 900) {
		margin.x = document.documentElement.clientWidth / 10;
		margin.y = document.documentElement.clientHeight / 4;
	}
	const [style, api] = useSpring(() => ({
		from: {
			height: document.documentElement.clientHeight - 2 * margin.y,
			width: document.documentElement.clientWidth - 2 * margin.x,
			top: -400,
		},
		to: {
			top: margin.y,
		},
		config: { duration: DURATION },
	}));
	const [opacity, setOpacity] = useState("opacity-0");
	useEffect(() => {
		setOpacity("opacity-1");
	}, []);
	const hideModal = async () => {
		api.start({ to: { top: -400 }, config: { duration: DURATION } });
		setOpacity("opacity-0");
		await sleep(DURATION);
		setModalState(null);
	};
	if (!modalState) return <></>; // this should never happen
	return (
		<>
			<div
				onClick={() => hideModal()}
				className={`${opacity} fixed top-0 left-0 z-20 h-full w-full backdrop-blur transition-opacity`}
				style={{ transitionDuration: DURATION + "ms" }}
			></div>
			<animated.div
				style={{ ...style, marginLeft: margin.x }}
				className="fixed z-30 flex flex-col rounded border border-white/25 bg-black-800 px-10 text-white"
			>
				<h2 className="my-10 text-center text-2xl">
					{modalState.header}
				</h2>
				<p className="text-center text-xl text-black-100">
					{modalState.content}
				</p>
				<div className="h-full"></div>
				<div className="grid h-fit w-full grid-cols-2 gap-5 py-5">
					<button className="btn" onClick={hideModal}>
						Cancel
					</button>
					<button
						className="btn-contrast"
						onClick={() => {
							modalState.callback();
							hideModal();
						}}
					>
						Do it
					</button>
				</div>
			</animated.div>
		</>
	);
};

interface ConfirmModalProps {
	header: string;
	content: string;
	callback: () => void;
}

export const confirmModalAtom = atom<ConfirmModalProps | null>(null);
export const confirmWithModalAtom = atom(
	null,
	(_get, set, update: ConfirmModalProps) => {
		set(confirmModalAtom, update);
	}
);
