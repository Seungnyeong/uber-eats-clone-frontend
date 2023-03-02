import { ApolloClient, ApolloProvider } from "@apollo/client";
import { render, RenderResult, waitFor, screen } from "@testing-library/react";
import { createMockClient } from "mock-apollo-client";
import React from "react";
import { HelmetProvider } from "react-helmet-async";
import { Login } from "../login";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";

describe("<Login />", () => {
  const mockedClient = createMockClient();
  const renderResult = () =>
    render(
      <HelmetProvider>
        <Router>
          <ApolloProvider client={mockedClient}>
            <Login />
          </ApolloProvider>
        </Router>
      </HelmetProvider>
    );

  it("should render OK", async () => {
    renderResult();
    await waitFor(() => {
      expect(document.title).toBe("Login | Nuber Eats");
    });
  });

  it("displays email validation error", async () => {
    const { getByPlaceholderText, debug, getByRole } = renderResult();
    // const email = getByPlaceholderText(/email/i);
    // await waitFor(() => {
    //   userEvent.type(email, "this@wont");
    //   debug();
    // });
  });
});
