describe("create account", () => {
  const user = cy;
  it("Should see email / password validation errors", () => {
    user.visit("/");
    user.findByText(/create an account/i).click();
    user.findByPlaceholderText(/email/i).type("non@good").blur();
    user.findByText("Please enter a valid email");
    user.findByPlaceholderText(/email/i).clear().blur();
    user.findByText("Email Required");
    user
      .findByPlaceholderText(/password/i)
      .type("a")
      .clear()
      .blur();
    user.findByText("Password Required");
    // user.findByPlaceholderText(/email/i).type("workingsnkim3@gmail.com");
  });

  it("should be able to create account", () => {
    user.intercept("http://localhost:4000/graphql", (req) => {
      req.reply((res) => {
        const { operationName } = req.body;
        if (operationName && operationName === "createAccount") {
          res.send({
            fixture: "auth/create-account.json",
          });
        }
      });
    });
    user.visit("/create-account");
    user.findByPlaceholderText(/email/i).type("workingsnkim@gmail.com");
    user.findByPlaceholderText(/password/i).type("1234");
    user.findByRole("button").click();
    cy.wait(1000);
    cy.title().should("eq", "Login | Nuber Eats");
    user.findByPlaceholderText(/email/i).type("workingsnkim@gmail.com");
    user.findByPlaceholderText(/password/i).type("1234");
    user.findByRole("button").click();
    cy.window().its("localStorage.nuber-token").should("be.a", "string");
    // @ts-ignore
    user.assertLoggedIn();
  });
});
