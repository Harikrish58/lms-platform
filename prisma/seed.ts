import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Hash password
  const hashedPassword = await bcrypt.hash("123456", 10);

  // 1. Create Instructor
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@test.com" },
    update: {},
    create: {
      name: "Test Instructor",
      email: "instructor@test.com",
      password: hashedPassword,
      role: "INSTRUCTOR",
    },
  });

  // 2. Create Course
  const course = await prisma.course.create({
    data: {
      title: "Full Stack LMS with Next.js",
      description: "Learn how to build a real-world LMS step by step.",
      price: 0,
      isPublished: true,
      instructorId: instructor.id,

      thumbnail:
        "https://res.cloudinary.com/dmupw3asw/image/upload/v1779608890/Thumbnail_ytvbhx.png",
      thumbnailPublicId: "Thumbnail_ytvbhx",
    },
  });

  // 3. Create Sections
  const section1 = await prisma.section.create({
    data: {
      title: "Introduction",
      order: 1,
      courseId: course.id,
    },
  });

  const section2 = await prisma.section.create({
    data: {
      title: "Backend Setup",
      order: 2,
      courseId: course.id,
    },
  });

  // 4. Create Lessons
  await prisma.lesson.createMany({
    data: [
      {
        title: "Welcome",
        description: "Course overview",
        videoUrl:
          "https://lms-videos-hari-2026.s3.eu-central-1.amazonaws.com/lms_Working/Create_a_cinematic_modern_SaaS.mp4",
        thumbnailUrl:
          "https://res.cloudinary.com/dmupw3asw/image/upload/v1779608890/Thumbnail_ytvbhx.png",
        thumbnailPublicId: "Thumbnail_ytvbhx",
        sectionId: section1.id,
        order: 1,
      },
      {
        title: "Project Structure",
        description: "Understanding folders",
        videoUrl:
          "https://lms-videos-hari-2026.s3.eu-central-1.amazonaws.com/lms_Working/Create_a_cinematic_modern_SaaS.mp4",
        thumbnailUrl:
          "https://res.cloudinary.com/dmupw3asw/image/upload/v1779608890/Thumbnail_ytvbhx.png",
        thumbnailPublicId: "Thumbnail_ytvbhx",
        sectionId: section1.id,
        order: 2,
      },
      {
        title: "Database Setup",
        description: "Prisma + PostgreSQL",
        videoUrl:
          "https://lms-videos-hari-2026.s3.eu-central-1.amazonaws.com/lms_Working/Create_a_cinematic_modern_SaaS.mp4",
        thumbnailUrl:
          "https://res.cloudinary.com/dmupw3asw/image/upload/v1779608890/Thumbnail_ytvbhx.png",
        thumbnailPublicId: "Thumbnail_ytvbhx",
        sectionId: section2.id,
        order: 1,
      },
    ],
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
