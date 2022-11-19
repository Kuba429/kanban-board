import { type Item } from "@prisma/client";
import { atom } from "jotai";

export interface ModalAtomType {
	itemRect: DOMRect;
	itemData: Item;
}
export const modalAtom = atom<ModalAtomType | null>(null);
