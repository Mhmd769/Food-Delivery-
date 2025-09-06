/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."MenuItem" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "public"."Restaurant" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "closingTime" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "openingTime" TEXT,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION DEFAULT 0.0;

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_phone_key" ON "public"."Restaurant"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_email_key" ON "public"."Restaurant"("email");

-- AddForeignKey
ALTER TABLE "public"."Restaurant" ADD CONSTRAINT "Restaurant_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
