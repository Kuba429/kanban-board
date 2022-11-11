-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'No title';

-- AlterTable
ALTER TABLE "Column" ALTER COLUMN "title" SET DEFAULT 'No title';

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "title" SET DEFAULT 'No title';
