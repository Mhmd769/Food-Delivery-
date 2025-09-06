/*
  Warnings:

  - You are about to drop the column `rating` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Address" DROP CONSTRAINT "Address_userId_fkey";

-- DropIndex
DROP INDEX "public"."Order_customerId_idx";

-- DropIndex
DROP INDEX "public"."Order_driverId_idx";

-- DropIndex
DROP INDEX "public"."Order_restaurantId_idx";

-- DropIndex
DROP INDEX "public"."Order_status_idx";

-- AlterTable
ALTER TABLE "public"."Restaurant" DROP COLUMN "rating";

-- DropTable
DROP TABLE "public"."Address";
