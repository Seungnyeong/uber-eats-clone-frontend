import { render, screen } from "@testing-library/react";
import React from "react";
import { IRestaurantProps, Restaurant } from "../restaurant";
import { BrowserRouter as Router } from "react-router-dom";

describe("<Restaurant />", () => {
  it("renders ok with Props", () => {
    const restaurantProps: IRestaurantProps = {
      id: "1",
      coverImage: "x",
      name: "nameTest",
      categoryName: "catTest",
    };
    const {
      debug,
      container: { firstChild },
    } = render(
      <Router>
        <Restaurant
          id={restaurantProps.id}
          coverImage={restaurantProps.coverImage}
          name={restaurantProps.name}
          categoryName={restaurantProps.categoryName}
        />
      </Router>
    );

    screen.getByText("nameTest");
    screen.getByText("catTest");

    expect(firstChild).toHaveAttribute("href", "/restaurant/1");
  });
});
