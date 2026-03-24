import { createUser } from "@/actions/user.actions";
import { createCourse } from "@/actions/course.actions";

async function main() {
  await createUser();
  await createCourse();
}

main();