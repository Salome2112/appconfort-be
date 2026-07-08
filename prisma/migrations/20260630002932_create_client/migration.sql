/*
  Warnings:

  - You are about to drop the column `idNumber` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `furniture_sets` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `furniture_sets` table. All the data in the column will be lost.
  - You are about to drop the column `paidAt` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `receiptUrl` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `registeredBy` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryPaymentAmount` on the `sales_orders` table. All the data in the column will be lost.
  - You are about to drop the column `depositAmount` on the `sales_orders` table. All the data in the column will be lost.
  - You are about to drop the column `depositPercent` on the `sales_orders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nui]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nui` to the `clients` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "clients_idNumber_key";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "idNumber",
DROP COLUMN "phone",
ADD COLUMN     "nui" VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE "furniture_sets" DROP COLUMN "category",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "paidAt",
DROP COLUMN "paymentType",
DROP COLUMN "receiptUrl",
DROP COLUMN "reference",
DROP COLUMN "registeredBy";

-- AlterTable
ALTER TABLE "sales_orders" DROP COLUMN "deliveryPaymentAmount",
DROP COLUMN "depositAmount",
DROP COLUMN "depositPercent";

-- CreateIndex
CREATE UNIQUE INDEX "clients_nui_key" ON "clients"("nui");
