import { atom } from "jotai";
import { type ItemType } from "../stores/columns";

export interface ModalAtomType {
	itemRect: DOMRect;
	itemData: ItemType;
}
export const modalAtom = atom<ModalAtomType | null>(null);
