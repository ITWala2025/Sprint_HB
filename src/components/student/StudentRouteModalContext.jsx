"use client";

import { createContext, useEffect, useRef, useState } from "react";

export const StudentRouteModalContext = createContext({
  backgroundPath: null,
  historyDepth: 0,
});

const isStudentModalRoute = (pathname) =>
  pathname.startsWith("/student/") &&
  !["/student/dashboard", "/student/enroll"].includes(pathname);

export function StudentRouteModalProvider({ pathname, children }) {
  const navigationRef = useRef(null);

  if (!navigationRef.current) {
    navigationRef.current = {
      pathname,
      paths: [pathname],
      backgroundPath: isStudentModalRoute(pathname) ? null : pathname,
      wasPopState: false,
    };
  }

  const [navigation, setNavigation] = useState(() => ({
    backgroundPath: navigationRef.current.backgroundPath,
    historyDepth: 0,
  }));

  useEffect(() => {
    const markPopState = () => {
      navigationRef.current.wasPopState = true;
    };

    window.addEventListener("popstate", markPopState);
    return () => window.removeEventListener("popstate", markPopState);
  }, []);

  useEffect(() => {
    const current = navigationRef.current;
    if (current.pathname === pathname) return;

    const previousPath = current.pathname;
    if (current.wasPopState) {
      current.wasPopState = false;
      const previousIndex = current.paths.lastIndexOf(pathname);
      current.paths =
        previousIndex >= 0
          ? current.paths.slice(0, previousIndex + 1)
          : [...current.paths, pathname];
    } else if (
      isStudentModalRoute(pathname) &&
      !isStudentModalRoute(previousPath)
    ) {
      current.paths = [previousPath, pathname];
      current.backgroundPath = previousPath;
    } else {
      current.paths = [...current.paths, pathname];
    }

    if (!isStudentModalRoute(pathname)) {
      current.paths = [pathname];
      current.backgroundPath = pathname;
    }

    current.pathname = pathname;
    const backgroundIndex = current.backgroundPath
      ? current.paths.indexOf(current.backgroundPath)
      : -1;

    setNavigation({
      backgroundPath: current.backgroundPath,
      historyDepth:
        isStudentModalRoute(pathname) && backgroundIndex >= 0
          ? current.paths.length - backgroundIndex - 1
          : 0,
    });
  }, [pathname]);

  return (
    <StudentRouteModalContext.Provider value={navigation}>
      {children}
    </StudentRouteModalContext.Provider>
  );
}
