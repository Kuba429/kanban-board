import { type Item } from "./columns";
import { atom } from "jotai";

export interface ModalAtomType {
	itemRect: DOMRect;
	itemData: Item;
}
export const modalAtom = atom<ModalAtomType | null>(null);
