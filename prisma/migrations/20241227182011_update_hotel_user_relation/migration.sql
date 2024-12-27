/*
  Warnings:

  - You are about to drop the column `userId` on the `Hotel` table. All the data in the column will be lost.
  - Added the required column `userEmail` to the `Hotel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Hotel" DROP CONSTRAINT "Hotel_userId_fkey";

-- DropIndex
DROP INDEX "Hotel_userId_idx";

-- AlterTable
ALTER TABLE "Hotel" DROP COLUMN "userId",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Hotel_userEmail_idx" ON "Hotel"("userEmail");

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
