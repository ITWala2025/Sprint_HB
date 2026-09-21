import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import MobileNavigation from "@/components/header/MobileNavigation";

describe("MobileNavigation", () => {
  const mockSetIsOpen = vi.fn();
  const pathname = "/courses";

  const renderWithProps = (overrides = {}) =>
    render(
      <MobileNavigation
        pathname={pathname}
        isOpen={false}
        setIsOpen={mockSetIsOpen}
        {...overrides}
      />,
    );

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders an Enroll link", () => {
      renderWithProps();
      expect(screen.getByRole("link", { name: "Enroll" })).toHaveAttribute(
        "href",
        "/register",
      );
    });

    it("renders a toggle button with correct aria-label when closed", () => {
      renderWithProps();
      expect(
        screen.getByRole("button", { name: "Open navigation menu" }),
      ).toBeInTheDocument();
    });

    it("renders a toggle button with correct aria-label when open", () => {
      renderWithProps({ isOpen: true });
      expect(
        screen.getByRole("button", { name: "Close navigation menu" }),
      ).toBeInTheDocument();
    });

    it("sets aria-expanded to false when menu is closed", () => {
      renderWithProps();
      expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
    });

    it("sets aria-expanded to true when menu is open", () => {
      renderWithProps({ isOpen: true });
      expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    });

    it("sets aria-controls to mobile-navigation", () => {
      renderWithProps();
      expect(screen.getByRole("button")).toHaveAttribute("aria-controls", "mobile-navigation");
    });
  });

  describe("icon display", () => {
    it("renders Menu icon when closed", () => {
      renderWithProps();
      const button = screen.getByRole("button");
      const svg = button.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveClass("lucide-menu");
    });

    it("renders X icon when open", () => {
      renderWithProps({ isOpen: true });
      const button = screen.getByRole("button");
      const svg = button.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveClass("lucide-x");
    });
  });

  describe("drawer visibility", () => {
    it("does not render the drawer when isOpen is false", () => {
      renderWithProps();
      expect(screen.queryByRole("navigation", { name: /Mobile navigation/i })).not.toBeInTheDocument();
    });

    it("renders the drawer when isOpen is true", () => {
      renderWithProps({ isOpen: true });
      expect(
        screen.getByRole("navigation", { name: /Mobile navigation/i }),
      ).toBeInTheDocument();
    });

    it("renders all navigation links in the drawer", () => {
      renderWithProps({ isOpen: true });
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("navigation links", () => {
    it("renders Home, Courses, About Us, and Contact links in the drawer", () => {
      renderWithProps({ isOpen: true });
      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
      expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute("href", "/courses");
      expect(screen.getByRole("link", { name: "About Us" })).toHaveAttribute("href", "/about");
      expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    });

    it("renders Student Login and Enroll Now links in the drawer", () => {
      renderWithProps({ isOpen: true });
      expect(screen.getByRole("link", { name: /Student Login/i })).toHaveAttribute(
        "href",
        "/student/login",
      );
      expect(screen.getByRole("link", { name: /Enroll Now/i })).toHaveAttribute(
        "href",
        "/register",
      );
    });

    it("marks the active link with aria-current page", () => {
      renderWithProps({ isOpen: true });
      expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    it("marks Home as active when pathname is exactly /", () => {
      renderWithProps({ isOpen: true, pathname: "/" });
      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    it("marks parent route as active for nested children", () => {
      renderWithProps({ isOpen: true, pathname: "/about/team" });
      expect(screen.getByRole("link", { name: "About Us" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  });

  describe("interaction", () => {
    it("calls setIsOpen(true) when toggle button is clicked while closed", () => {
      renderWithProps();
      mockSetIsOpen.mockClear();
      fireEvent.click(screen.getByRole("button"));
      expect(mockSetIsOpen).toHaveBeenCalledTimes(1);
      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
    });

    it("calls setIsOpen(false) when toggle button is clicked while open", () => {
      renderWithProps({ isOpen: true });
      mockSetIsOpen.mockClear();
      fireEvent.click(screen.getByRole("button"));
      expect(mockSetIsOpen).toHaveBeenCalledTimes(1);
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it("calls setIsOpen(false) when a navigation link is clicked", () => {
      renderWithProps({ isOpen: true });
      mockSetIsOpen.mockClear();
      const homeLink = screen.getByRole("link", { name: "Home" });
      fireEvent.click(homeLink);
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it("calls setIsOpen(false) when Student Login link is clicked", () => {
      renderWithProps({ isOpen: true });
      mockSetIsOpen.mockClear();
      fireEvent.click(screen.getByRole("link", { name: /Student Login/i }));
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it("calls setIsOpen(false) when Enroll Now link is clicked", () => {
      renderWithProps({ isOpen: true });
      mockSetIsOpen.mockClear();
      fireEvent.click(screen.getByRole("link", { name: /Enroll Now/i }));
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });
  });

  describe("effects", () => {
    it("calls setIsOpen(false) on Escape keydown", async () => {
      renderWithProps({ isOpen: true });
      mockSetIsOpen.mockClear();
      fireEvent.keyDown(document, { key: "Escape" });
      await waitFor(() => {
        expect(mockSetIsOpen).toHaveBeenCalledWith(false);
      });
    });

    it("does not call setIsOpen on other keydown", () => {
      renderWithProps({ isOpen: true });
      mockSetIsOpen.mockClear();
      fireEvent.keyDown(document, { key: "Enter" });
      expect(mockSetIsOpen).not.toHaveBeenCalled();
    });

    it("calls setIsOpen(false) on resize when window is desktop width", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1200,
      });
      renderWithProps({ isOpen: true });
      mockSetIsOpen.mockClear();
      fireEvent.resize(window);
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it("does not call setIsOpen on resize when window is mobile width", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768,
      });
      renderWithProps({ isOpen: true });
      mockSetIsOpen.mockClear();
      fireEvent.resize(window);
      expect(mockSetIsOpen).not.toHaveBeenCalled();
    });

    it("calls setIsOpen(false) when pathname changes", () => {
      const { rerender } = renderWithProps({ pathname: "/courses", isOpen: true });
      mockSetIsOpen.mockClear();
      rerender(
        <MobileNavigation pathname="/about" isOpen={true} setIsOpen={mockSetIsOpen} />,
      );
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it("adds keydown event listener on mount", () => {
      const addSpy = vi.spyOn(document, "addEventListener");
      renderWithProps();
      expect(addSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
      addSpy.mockRestore();
    });

    it("adds resize event listener on mount", () => {
      const addSpy = vi.spyOn(window, "addEventListener");
      renderWithProps();
      expect(addSpy).toHaveBeenCalledWith("resize", expect.any(Function));
      addSpy.mockRestore();
    });
  });
});
