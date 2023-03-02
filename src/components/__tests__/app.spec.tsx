import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { isLoggedInVar } from "../../apollo";
import { App } from "../app";

jest.mock("../../routers/logged-out-router", () => {
    return {
        LoggedOutRouter : () =>  "logged-out"
    }
})


jest.mock("../../routers/logged-in-router", () => {
    return {
        LoggedInRouter : () => "logged-in"
    }
})

describe("<App />", () => {
    it("renders LoggedOutRouter", () => {
        render(<App />);
        screen.getByText("logged-out");
    })

    it("renders LoggedInRouter", async () => {
        const {debug} = render(<App />);
        await waitFor(() => {
            isLoggedInVar(true);
            screen.getByText("logged-in");
        })
        
    })
});