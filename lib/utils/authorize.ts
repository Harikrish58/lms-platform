import { Role } from "@prisma/client";

export const requireRole = (userRole: Role | undefined, allowedRoles: Role[]) => {
  if (!userRole || !allowedRoles.includes(userRole)) {
    return {
      success: false,
      status: 403,
      message: "Forbidden: You do not have permission to access this resource",
    };
  }
  return { success: true };
};
