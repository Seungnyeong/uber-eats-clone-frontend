import React from "react"
import { render , screen } from "@testing-library/react"
import { Button } from "../button"

describe("<Button />", () => {
    it("should render OK with props", () => {
        render(<Button canClick={true} loading={false} actionText={"test"} />)
        screen.getByText("test")
    });
    
    it("should display Loading...", () => {
        const {container : { firstChild }} = render(<Button canClick={false} loading={true} actionText={"test"} />)
        screen.getByText("Loading...")
        expect(firstChild).toHaveClass("pointer-events-none")
    });
})