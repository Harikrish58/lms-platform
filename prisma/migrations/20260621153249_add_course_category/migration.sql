-- CreateEnum
CREATE TYPE "CourseCategory" AS ENUM ('DEVELOPMENT', 'DESIGN', 'BUSINESS');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "category" "CourseCategory" NOT NULL DEFAULT 'DEVELOPMENT';
