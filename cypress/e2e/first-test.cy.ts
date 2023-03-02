describe("First Test", () => {
  it("should see login page", () => {
    cy.visit("/").title().should("eq", "Login | Nuber Eats");
  });

  it("can fill out the form", () => {
    cy.visit("/");
    cy.findByPlaceholderText(/email/i).type("nico@nomadcoders.co");
    cy.findAllByPlaceholderText(/password/i).type("1234");
    cy.findByRole("button").should("not.have.class", "pointer-events-none");

    // to do (can log in)
  });

  it("can see email / password error", () => {
    cy.visit("/");
    cy.findByPlaceholderText(/email/i).type("dfsdfadf@email");
    cy.findAllByPlaceholderText(/password/i).type("1234");
    cy.findByText("Please enter a valid email");
    cy.findByPlaceholderText(/email/i).clear().blur();
    cy.findByText("Email Required");
    cy.findByPlaceholderText(/email/i).type("workingsnkim@gmail.com");
    cy.findByRole("button").click();
    cy.window().its("localStorage.nuber-token").should("be.a", "string");
  });
});
