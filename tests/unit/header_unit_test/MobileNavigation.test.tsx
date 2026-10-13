import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup, within } from "@testing-library/react";
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
      expect(screen.getByRole("link", { name: "Enroll Now" })).toHaveAttribute(
        "href",
        "/student/enroll",
      );
      expect(screen.getByRole("link", { name: "Enroll Now" }).tagName).toBe(
        "A",
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
      expect(screen.getByRole("button", { name: "Open navigation menu" })).toHaveAttribute("aria-expanded", "false");
    });

    it("sets aria-expanded to true when menu is open", () => {
      renderWithProps({ isOpen: true });
      expect(screen.getByRole("button", { name: "Close navigation menu" })).toHaveAttribute("aria-expanded", "true");
    });

    it("sets aria-controls to mobile-navigation", () => {
      renderWithProps();
      expect(screen.getByRole("button", { name: "Open navigation menu" })).toHaveAttribute("aria-controls", "mobile-navigation");
    });
  });

  describe("icon display", () => {
    it("renders Menu icon when closed", () => {
      renderWithProps();
      const button = screen.getByRole("button", { name: "Open navigation menu" });
      const svg = button.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveClass("lucide-menu");
    });

    it("renders X icon when open", () => {
      renderWithProps({ isOpen: true });
      const button = screen.getByRole("button", { name: "Close navigation menu" });
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
      expect(links.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("navigation links", () => {
    it("renders Home, Courses, About Us, and Contact links in the drawer", () => {
      renderWithProps({ isOpen: true });
      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
      expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute("href", "/courses");
      expect(screen.getByRole("link", { name: "About Us" })).toHaveAttribute("href", "/about");
      expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
    });

    it("renders Enroll in the header and Student Portal in the drawer", () => {
      renderWithProps({ isOpen: true });
      expect(screen.getByRole("link", { name: "Enroll Now" })).toHaveAttribute(
        "href",
        "/student/enroll",
      );
      const drawer = screen.getByRole("navigation", {
        name: /Mobile navigation/i,
      });
      expect(
        within(drawer).getByRole("link", { name: "Student Portal" }),
      ).toHaveAttribute("href", "/student/login");
      expect(
        screen.getAllByRole("link", { name: "Student Portal" }),
      ).toHaveLength(1);
      expect(screen.getAllByRole("link", { name: /Enroll Now/i })).toHaveLength(1);
    });

    it("marks the active link with aria-current page", () => {
      renderWithProps({ isOpen: true });
      expect(screen.getByRole("link", { name: "Courses" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });

    it("marks Home as active when pathname is exactly /home", () => {
      renderWithProps({ isOpen: true, pathname: "/home" });
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
      fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
      expect(mockSetIsOpen).toHaveBeenCalledTimes(1);
      expect(mockSetIsOpen).toHaveBeenCalledWith(true);
    });

    it("calls setIsOpen(false) when toggle button is clicked while open", () => {
      renderWithProps({ isOpen: true });
      mockSetIsOpen.mockClear();
      fireEvent.click(screen.getByRole("button", { name: "Close navigation menu" }));
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

    it("renders the Student Portal action inside the menu drawer", () => {
      renderWithProps({ isOpen: true });
      const drawer = screen.getByRole("navigation", {
        name: /Mobile navigation/i,
      });
      expect(
        within(drawer).getByRole("link", { name: "Student Portal" }),
      ).toHaveAttribute("href", "/student/login");
      expect(
        screen.queryByRole("link", { name: "Student Portal" })?.closest(
          "#mobile-navigation",
        ),
      ).toBeInTheDocument();
    });

    it("closes the drawer when Student Portal is selected", () => {
      renderWithProps({ isOpen: true });
      mockSetIsOpen.mockClear();
      fireEvent.click(screen.getByRole("link", { name: "Student Portal" }));
      expect(mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    it("does not duplicate the Enroll Now action in the menu drawer", () => {
      renderWithProps({ isOpen: true });
      const drawer = screen.getByRole("navigation", {
        name: /Mobile navigation/i,
      });
      expect(
        within(drawer).queryByRole("link", { name: /Enroll Now/i }),
      ).not.toBeInTheDocument();
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
