/*
  Warnings:

  - The primary key for the `Resume` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `careerObjective` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `degree` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `educationDetails` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `github` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `graduationYear` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `interests` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `linkedin` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `portfolio` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `projects` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `university` on the `Resume` table. All the data in the column will be lost.
  - The `id` column on the `Resume` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `data` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_userId_fkey";

-- DropIndex
DROP INDEX "Resume_userId_key";

-- AlterTable
ALTER TABLE "Resume" DROP CONSTRAINT "Resume_pkey",
DROP COLUMN "careerObjective",
DROP COLUMN "certifications",
DROP COLUMN "degree",
DROP COLUMN "educationDetails",
DROP COLUMN "email",
DROP COLUMN "experience",
DROP COLUMN "github",
DROP COLUMN "graduationYear",
DROP COLUMN "interests",
DROP COLUMN "languages",
DROP COLUMN "linkedin",
DROP COLUMN "location",
DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "portfolio",
DROP COLUMN "projects",
DROP COLUMN "skills",
DROP COLUMN "university",
ADD COLUMN     "data" JSONB NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "template" DROP DEFAULT,
ADD CONSTRAINT "Resume_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
