-- AlterTable
ALTER TABLE "ServiceHistory" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
