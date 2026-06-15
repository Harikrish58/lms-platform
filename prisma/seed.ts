import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const VIDEO_URL =
  "https://lms-videos-hari-2026.s3.eu-central-1.amazonaws.com/lms_Working/Create_a_cinematic_modern_SaaS.mp4";

const THUMBNAIL_URL =
  "https://res.cloudinary.com/dmupw3asw/image/upload/v1779608890/Thumbnail_ytvbhx.png";

const THUMBNAIL_PUBLIC_ID = "Thumbnail_ytvbhx";

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Admin User
  await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@test.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // Instructor User
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

  const courses = [
    {
      title: "Full Stack LMS with Next.js",
      description: "Learn how to build a real-world LMS step by step.",
      price: 0,
      sections: [
        "Introduction",
        "Backend Setup",
        "Authentication",
        "Deployment",
      ],
    },
    {
      title: "Advanced Next.js 15",
      description:
        "Master Server Components, Server Actions and production deployment.",
      price: 99,
      sections: [
        "Next.js Fundamentals",
        "Server Components",
        "Server Actions",
        "Performance Optimization",
      ],
    },
    {
      title: "TypeScript Masterclass",
      description:
        "Complete TypeScript course from beginner to advanced concepts.",
      price: 79,
      sections: [
        "TypeScript Basics",
        "Functions & Generics",
        "Advanced Types",
        "Real World Patterns",
      ],
    },
    {
      title: "Prisma & PostgreSQL",
      description: "Learn database design using Prisma ORM and PostgreSQL.",
      price: 59,
      sections: [
        "Database Fundamentals",
        "Prisma Setup",
        "Relationships",
        "Advanced Queries",
      ],
    },
    {
      title: "AWS S3 for Developers",
      description: "Store and manage files securely using AWS S3.",
      price: 89,
      sections: [
        "AWS Basics",
        "S3 Fundamentals",
        "File Uploads",
        "Production Strategies",
      ],
    },
    {
      title: "Authentication & Security",
      description:
        "Build secure applications using JWT, OAuth and RBAC.",
      price: 69,
      sections: [
        "Authentication Basics",
        "JWT Authentication",
        "OAuth Login",
        "Security Best Practices",
      ],
    },
  ];

  for (const courseData of courses) {
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        isPublished: true,
        instructorId: instructor.id,
        thumbnail: THUMBNAIL_URL,
        thumbnailPublicId: THUMBNAIL_PUBLIC_ID,
      },
    });

    for (
      let sectionIndex = 0;
      sectionIndex < courseData.sections.length;
      sectionIndex++
    ) {
      const section = await prisma.section.create({
        data: {
          title: courseData.sections[sectionIndex],
          order: sectionIndex + 1,
          courseId: course.id,
        },
      });

      await prisma.lesson.createMany({
        data: [
          {
            title: "Welcome & Overview",
            description: "Introduction to this topic.",
            videoUrl: VIDEO_URL,
            thumbnailUrl: THUMBNAIL_URL,
            thumbnailPublicId: THUMBNAIL_PUBLIC_ID,
            sectionId: section.id,
            order: 1,
          },
          {
            title: "Core Concepts",
            description: "Understand the fundamental concepts.",
            videoUrl: VIDEO_URL,
            thumbnailUrl: THUMBNAIL_URL,
            thumbnailPublicId: THUMBNAIL_PUBLIC_ID,
            sectionId: section.id,
            order: 2,
          },
          {
            title: "Hands-on Implementation",
            description: "Apply the concepts in a real project.",
            videoUrl: VIDEO_URL,
            thumbnailUrl: THUMBNAIL_URL,
            thumbnailPublicId: THUMBNAIL_PUBLIC_ID,
            sectionId: section.id,
            order: 3,
          },
          {
            title: "Best Practices",
            description: "Learn production-grade techniques.",
            videoUrl: VIDEO_URL,
            thumbnailUrl: THUMBNAIL_URL,
            thumbnailPublicId: THUMBNAIL_PUBLIC_ID,
            sectionId: section.id,
            order: 4,
          },
          {
            title: "Summary & Next Steps",
            description: "Review what was learned.",
            videoUrl: VIDEO_URL,
            thumbnailUrl: THUMBNAIL_URL,
            thumbnailPublicId: THUMBNAIL_PUBLIC_ID,
            sectionId: section.id,
            order: 5,
          },
        ],
      });
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });