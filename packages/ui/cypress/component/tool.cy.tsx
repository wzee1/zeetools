import ZeeHeader from "../../src/components/brand/zee-header";
import { useCommands } from "../../src/components/commands/commands";
import DropZone from "../../src/components/drop-zone/drop-zone";
import { mod } from "../support/component";

describe("DropZone", () => {
  it("accepts dropped files", () => {
    const onFiles = cy.stub().as("files");
    cy.mount(<DropZone onFiles={onFiles} />);
    cy.get("[role=button]").selectFile({ contents: Cypress.Buffer.from("hello"), fileName: "notes.txt" }, { action: "drag-drop" });
    cy.get("@files").should("have.been.calledOnce").its("firstCall.args.0.0.name").should("eq", "notes.txt");
  });

  it("invites the drop while a file is over it", () => {
    cy.mount(<DropZone onFiles={() => {}} />);
    cy.get("[role=button]").trigger("dragover");
    cy.contains("p", "Release to add").should("have.css", "opacity", "1");
  });
});

function WithCommand({ onRun }: { onRun: () => void }) {
  useCommands([{ id: "crop", label: "Crop to 9:16", run: onRun }]);
  return <ZeeHeader />;
}

describe("Header", () => {
  it("opens the command menu with the keyboard and runs a command", () => {
    const onRun = cy.stub().as("run");
    cy.mount(<WithCommand onRun={onRun} />);
    // Native key presses go to the focused frame, so click into the component first, as a user would.
    cy.get("header").realClick({ position: "bottom" });
    cy.realPress([mod, "k"]);
    cy.get("[cmdk-input]").should("be.focused").type("crop{enter}");
    cy.get("@run").should("have.been.calledOnce");
    cy.get("[cmdk-input]").should("not.exist");
  });

  it("turns the logo into a terminal window on hover", () => {
    cy.mount(<ZeeHeader />);
    cy.get("header nav a svg rect[height='8.5']").as("caret").should("have.css", "opacity", "0");
    cy.get("header nav a").realHover();
    cy.get("@caret").should(($c) => expect(Number(getComputedStyle($c[0]).opacity)).to.be.greaterThan(0));
    cy.get("header nav a svg circle").first().should(($dot) => expect(getComputedStyle($dot[0]).opacity).to.eq("1"));
  });
});
