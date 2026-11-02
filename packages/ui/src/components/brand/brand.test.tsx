import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SidebarContext } from "../../hooks/use-sidebar";
import Stagger from "../motion/stagger";
import JsonLd from "./json-ld";
import PageHeader from "./page-header";
import SidebarItem from "./sidebar-item";
import ToolAbout from "./tool-about";

describe("PageHeader", () => {
  it("renders a regular-weight title, the description, and the leading and aside slots", () => {
    render(
      <Stagger>
        <PageHeader title="Batch Pipeline" leading={<span>mark</span>} aside={<span>tag</span>}>
          A quiet description.
        </PageHeader>
      </Stagger>,
    );
    const title = screen.getByRole("heading", { level: 1, name: "Batch Pipeline" });
    expect(title).toHaveClass("font-normal");
    expect(screen.getByText("A quiet description.")).toBeInTheDocument();
    expect(screen.getByText("mark")).toBeInTheDocument();
    expect(screen.getByText("tag")).toBeInTheDocument();
  });

  it("leaves out the description paragraph when there are no children", () => {
    const { container } = render(
      <Stagger>
        <PageHeader title="Only a title" />
      </Stagger>,
    );
    expect(container.querySelector("p")).toBeNull();
  });
});

describe("SidebarItem", () => {
  it("shows the meta value at the right edge of the row", () => {
    render(
      <SidebarItem href="/" icon={<svg />} meta={3}>
        Batch Pipeline
      </SidebarItem>,
    );
    const row = screen.getByRole("link", { name: /Batch Pipeline/ });
    expect(row).toHaveTextContent("3");
    expect(screen.getByText("3")).toHaveClass("font-mono");
  });

  it("renders no meta element when none is given", () => {
    render(
      <SidebarItem href="/" icon={<svg />}>
        Batch Pipeline
      </SidebarItem>,
    );
    expect(screen.getByRole("link").querySelectorAll("span")).toHaveLength(1);
  });

  it("marks the active row as the current page", () => {
    render(
      <SidebarItem href="/" icon={<svg />} active>
        Batch Pipeline
      </SidebarItem>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("aria-current", "page");
  });

  it("renders a plain anchor for a hash href and closes the drawer on a pick", () => {
    const onNavigate = vi.fn();
    render(
      <SidebarContext.Provider value={{ onNavigate }}>
        <SidebarItem href="#room=quiet-sync-101" icon={<svg />}>
          Room
        </SidebarItem>
      </SidebarContext.Provider>,
    );
    const row = screen.getByRole("link", { name: "Room" });
    expect(row.tagName).toBe("A");
    expect(row).toHaveAttribute("href", "#room=quiet-sync-101");
    // Not prevented, so the browser itself changes the hash and fires hashchange.
    expect(fireEvent.click(row)).toBe(true);
    expect(onNavigate).toHaveBeenCalledTimes(1);
  });
});

describe("ToolAbout", () => {
  const content = {
    heading: "About demo",
    intro: "A demo tool.",
    points: [{ title: "Point one", body: "Body one." }],
    faq: [
      { q: "Is it free?", a: "Yes, free." },
      { q: "Is it open source?", a: "Yes." },
    ],
  };

  it("renders the heading, intro, points and every FAQ answer as native details", () => {
    const { container } = render(<ToolAbout {...content} source="https://github.com/wzee1/zeetools" />);
    expect(screen.getByRole("heading", { level: 1, name: "About demo" })).toBeInTheDocument();
    expect(screen.getByText("A demo tool.")).toBeInTheDocument();
    expect(screen.getByText("Body one.")).toBeInTheDocument();
    expect(container.querySelectorAll("details > summary")).toHaveLength(2);
    // Closed answers stay in the markup, so crawlers read them.
    expect(screen.getByText("Yes, free.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Source on GitHub" })).toHaveAttribute("href", "https://github.com/wzee1/zeetools");
  });

  it("leaves the source link out when there is none", () => {
    render(<ToolAbout {...content} />);
    expect(screen.queryByRole("link", { name: "Source on GitHub" })).toBeNull();
    expect(screen.getByRole("link", { name: "Privacy notice" })).toHaveAttribute("href", "https://wzee.dev/privacy");
  });
});

describe("JsonLd", () => {
  it("emits a data script with < escaped", () => {
    const { container } = render(<JsonLd data={{ a: "</script>" }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script?.textContent).toBe('{"a":"\\u003c/script>"}');
  });
});
