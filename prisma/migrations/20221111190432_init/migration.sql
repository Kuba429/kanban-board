/*
  Warnings:

  - Added the required column `createdBy` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Column" ADD COLUMN     "boardId" TEXT;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "columnId" TEXT,
ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "index" INTEGER NOT NULL,
ADD COLUMN     "updatedBy" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE SET NULL ON UPDATE CASCADE;
