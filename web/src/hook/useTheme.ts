import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("system");

  // Lấy theme từ localStorage sau khi client render
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme("system");
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", isDark);
  };

  // Áp dụng theme khi thay đổi
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (newTheme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", newTheme);
    }
  };

  // Theo dõi thay đổi system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => theme === "system" && applyTheme("system");
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return { theme, changeTheme };
};

export default useTheme;
