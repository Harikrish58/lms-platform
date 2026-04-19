-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "pdfPublicId" TEXT,
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "thumbnailPublicId" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "videoKey" TEXT;
