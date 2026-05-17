export const isAuthenticated = async () => {
  try {
    const response = await fetch("/api/me", {
      method: "GET",
      credentials: "include",
    });

    return response.ok;
  } catch (error) {
    console.error("Authentication check failed:", error);
    return false;
  }
};

export const logout = async () => {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout failed:", error);
  }
};