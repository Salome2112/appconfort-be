/*
  Warnings:

  - Added the required column `name` to the `furniture_sets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "furniture_sets" ADD COLUMN     "name" VARCHAR(150) NOT NULL;
