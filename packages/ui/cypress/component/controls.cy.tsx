import DownloadIcon from "../../src/components/icons/actions/download-icon";
import Button from "../../src/components/ui/actions/button";
import Slider from "../../src/components/ui/forms/slider";
import Switch from "../../src/components/ui/forms/switch";

describe("Button", () => {
  it("darkens on hover", () => {
    cy.mount(
      <Button variant="primary">
        <DownloadIcon />
        Download
      </Button>,
    );
    cy.contains("button", "Download").then(($b) => {
      const rest = getComputedStyle($b[0]).backgroundColor;
      cy.wrap($b).realHover();
      cy.wrap($b).should(($el) => expect(getComputedStyle($el[0]).backgroundColor).not.to.eq(rest));
    });
  });

  it("shows a not-allowed cursor and ignores clicks while disabled", () => {
    const onClick = cy.stub().as("click");
    cy.mount(
      <Button onClick={onClick} disabled>
        Export
      </Button>,
    );
    cy.contains("button", "Export").should("have.css", "cursor", "not-allowed").click({ force: true });
    cy.get("@click").should("not.have.been.called");
  });
});

describe("Switch", () => {
  it("slides the thumb across when switched on", () => {
    cy.mount(<Switch aria-label="Include audio" />);
    cy.get("[role=switch] span").then(($thumb) => {
      const off = $thumb[0].getBoundingClientRect().left;
      cy.get("[role=switch]").click();
      cy.get("[role=switch]").should("have.attr", "aria-checked", "true");
      cy.get("[role=switch] span").should(($t) => expect($t[0].getBoundingClientRect().left).to.be.greaterThan(off + 10));
    });
  });
});

describe("Slider", () => {
  it("moves with the arrow keys", () => {
    cy.mount(
      <div style={{ width: 300 }}>
        <Slider defaultValue={[50]} max={100} step={5} />
      </div>,
    );
    cy.get("[role=slider]").focus().type("{rightarrow}{rightarrow}");
    cy.get("[role=slider]").should("have.attr", "aria-valuenow", "60");
  });

  it("shows a not-allowed cursor while disabled", () => {
    cy.mount(
      <div style={{ width: 300 }}>
        <Slider defaultValue={[30]} disabled />
      </div>,
    );
    cy.get("[role=slider]").should("have.css", "cursor", "not-allowed");
  });
});
