import { atom } from "jotai";
import { Prisma } from "@prisma/client";

const columnWithItems = Prisma.validator<Prisma.ColumnArgs>()({
	include: { items: true },
});
export type Column = Prisma.ColumnGetPayload<typeof columnWithItems>;

export const columnsAtom = atom<Column[]>([]);
