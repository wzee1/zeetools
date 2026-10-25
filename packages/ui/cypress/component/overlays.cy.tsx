import CopyIcon from "../../src/components/icons/actions/copy-icon";
import TrashIcon from "../../src/components/icons/actions/trash-icon";
import MoreIcon from "../../src/components/icons/navigation/more-icon";
import Button from "../../src/components/ui/actions/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../src/components/ui/forms/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../src/components/ui/overlays/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../src/components/ui/overlays/dropdown-menu";
import { Tooltip } from "../../src/components/ui/overlays/tooltip";

describe("DropdownMenu", () => {
  beforeEach(() => {
    cy.mount(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            Options
            <MoreIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem hotkey="mod+shift+c">
            <CopyIcon />
            Copy file list
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Open in</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>zeecut</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="danger">
            <TrashIcon />
            Clear file list
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
  });

  it("opens below its trigger as frosted glass", () => {
    cy.contains("button", "Options").click();
    cy.get("[role=menu]").should("be.visible").and("have.css", "backdrop-filter").and("contain", "blur");
    cy.contains("button", "Options").then(($trigger) => {
      cy.get("[role=menu]").should(($menu) => expect($menu[0].getBoundingClientRect().top).to.be.greaterThan($trigger[0].getBoundingClientRect().bottom));
    });
  });

  it("opens the submenu on hover", () => {
    cy.contains("button", "Options").click();
    cy.contains("[role=menuitem]", "Open in").realHover();
    cy.contains("[role=menuitem]", "zeecut").should("be.visible");
  });

  it("fades out instead of vanishing when closed", () => {
    cy.contains("button", "Options").click();
    cy.get("[role=menu]").should("be.visible");
    cy.get("body").type("{esc}");
    cy.get("[role=menu]").should("have.attr", "data-state", "closed");
    cy.get("[role=menu]").should("not.exist");
  });
});

describe("Select", () => {
  it("picks an option", () => {
    cy.mount(
      <div style={{ width: 280 }}>
        <Select defaultValue="9:16">
          <SelectTrigger aria-label="Aspect ratio">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="9:16">9:16 · Reels</SelectItem>
            <SelectItem value="16:9">16:9 · YouTube</SelectItem>
          </SelectContent>
        </Select>
      </div>,
    );
    cy.get("[role=combobox]").click();
    cy.contains("[role=option]", "16:9 · YouTube").click();
    cy.get("[role=combobox]").should("contain", "16:9 · YouTube");
    cy.get("[role=listbox]").should("not.exist");
  });
});

describe("Dialog", () => {
  it("moves focus inside and returns it to the trigger on close", () => {
    cy.mount(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Delete files</Button>
        </DialogTrigger>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Delete 3 files?</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    cy.contains("button", "Delete files").click();
    cy.get("[role=dialog]").should("be.visible");
    cy.focused().closest("[role=dialog]").should("exist");
    cy.get("[role=dialog]").contains("button", "Close").click();
    cy.get("[role=dialog]").should("not.exist");
    cy.focused().should("contain", "Delete files");
  });
});

describe("Tooltip", () => {
  it("appears on hover and goes away when the pointer leaves", () => {
    cy.mount(
      <div style={{ padding: 60, display: "flex", gap: 200 }}>
        <Tooltip label="Download file list" hotkey="mod+s">
          <Button>Download</Button>
        </Tooltip>
        <p>Elsewhere</p>
      </div>,
    );
    cy.contains("button", "Download").realHover();
    cy.get("[data-radix-popper-content-wrapper]").should("be.visible").and("contain", "Download file list");
    // Radix keeps a tooltip open while the pointer heads toward it and decides on the next move,
    // so move twice, like a real pointer would.
    cy.contains("p", "Elsewhere").realHover({ position: "left" });
    cy.contains("p", "Elsewhere").realHover({ position: "right" });
    cy.get("[data-radix-popper-content-wrapper]").should("not.exist");
  });
});
