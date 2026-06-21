import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { CourseCategory } from "@/generated/prisma/enums";

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
    // --- DEVELOPMENT CATEGORY (5 Courses) ---
    {
      title: "Full Stack LMS with Next.js",
      category: "DEVELOPMENT",
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
      title: "Advanced Next.js 16",
      category: "DEVELOPMENT",
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
      category: "DEVELOPMENT",
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
      category: "DEVELOPMENT",
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
      title: "Authentication & Security",
      category: "DEVELOPMENT",
      description: "Build secure applications using JWT, OAuth and RBAC.",
      price: 69,
      sections: [
        "Authentication Basics",
        "JWT Authentication",
        "OAuth Login",
        "Security Best Practices",
      ],
    },

    // --- DESIGN CATEGORY (5 Courses) ---
    {
      title: "UI/UX Design Fundamentals",
      category: "DESIGN",
      description:
        "Master the core principles of user interface and user experience design.",
      price: 49,
      sections: [
        "Design Theory",
        "Wireframing",
        "Color Psychology",
        "Typography",
      ],
    },
    {
      title: "Advanced Figma Prototyping",
      category: "DESIGN",
      description: "Create high-fidelity, interactive prototypes using Figma.",
      price: 89,
      sections: [
        "Figma Basics",
        "Components & Variants",
        "Auto Layout",
        "Interactive Prototyping",
      ],
    },
    {
      title: "Web Design Psychology",
      category: "DESIGN",
      description:
        "Learn how human psychology influences web design and conversions.",
      price: 59,
      sections: [
        "Cognitive Load",
        "Visual Hierarchy",
        "F-Pattern & Z-Pattern",
        "Trust & Credibility",
      ],
    },
    {
      title: "Mobile App Design Strategies",
      category: "DESIGN",
      description:
        "Design beautiful and intuitive iOS and Android applications.",
      price: 75,
      sections: [
        "Platform Guidelines",
        "Touch Targets",
        "Navigation Patterns",
        "Dark Mode Design",
      ],
    },
    {
      title: "Creating Design Systems",
      category: "DESIGN",
      description:
        "Build scalable and maintainable design systems for enterprise teams.",
      price: 120,
      sections: [
        "System Architecture",
        "Design Tokens",
        "Component Libraries",
        "Documentation",
      ],
    },

    // --- BUSINESS CATEGORY (5 Courses) ---
    {
      title: "SaaS Marketing Masterclass",
      category: "BUSINESS",
      description:
        "Learn how to acquire and retain users for your software products.",
      price: 149,
      sections: [
        "Go-to-Market Strategy",
        "Content Marketing",
        "Paid Acquisition",
        "Churn Reduction",
      ],
    },
    {
      title: "Startup Product Management",
      category: "BUSINESS",
      description:
        "From idea to launch: How to manage software products effectively.",
      price: 99,
      sections: [
        "User Research",
        "Agile Methodologies",
        "Roadmapping",
        "Metrics & KPIs",
      ],
    },
    {
      title: "Business Analytics with SQL",
      category: "BUSINESS",
      description:
        "Make data-driven business decisions using SQL and BI tools.",
      price: 85,
      sections: [
        "Data Fundamentals",
        "SQL Queries",
        "Data Visualization",
        "Predictive Analytics",
      ],
    },
    {
      title: "Entrepreneurship 101",
      category: "BUSINESS",
      description:
        "The complete guide to starting and funding your tech startup.",
      price: 0,
      sections: [
        "Validating Ideas",
        "Business Models",
        "Raising Capital",
        "Scaling Operations",
      ],
    },
    {
      title: "Digital Strategy & Growth",
      category: "BUSINESS",
      description: "Scale your online presence and dominate your niche.",
      price: 65,
      sections: [
        "Market Analysis",
        "SEO Fundamentals",
        "Social Media Strategy",
        "Conversion Optimization",
      ],
    },
  ];

  for (const courseData of courses) {
    const existingCourse = await prisma.course.findFirst({
      where: {
        title: courseData.title,
      },
    });

    if (existingCourse) {
      await prisma.course.update({
        where: {
          id: existingCourse.id,
        },
        data: {
          description: courseData.description,
          price: courseData.price,
          category: courseData.category as CourseCategory,
        },
      });

      console.log(`Updated course: ${courseData.title}`);
      continue;
    }

    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        category: courseData.category as CourseCategory,
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

    console.log(`Created course: ${courseData.title}`);
  }

  console.log("Database successfully seeded with 15 courses.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
