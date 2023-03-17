import { gql, useQuery } from "@apollo/client";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { RESTAURANT_FRAGMENT } from "../../fragments";
import { MyRestaurantsQuery } from "../../__api__/types";
import { Restaurant } from "../../components/restaurant";

export const MY_RESTAURANTS_QUERY = gql`
  query myRestaurants {
    myRestaurants {
      ok
      error
      restaurants {
        ...RestaurantParts
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
`;

export const MyRestaurants = () => {
  const { data } = useQuery<MyRestaurantsQuery>(MY_RESTAURANTS_QUERY);
  return (
    <div>
      <Helmet>
        <title>My restaurarnts | Nuber Eats</title>
      </Helmet>
      <div className="max-w-screen-2xl mx-auto mt-32">
        <h2 className="text-4xl font-medium mb-10">My Restaurants</h2>
        {data?.myRestaurants.ok &&
        data.myRestaurants.restaurants.length === 0 ? (
          <>
            <h4 className="text-xl mb-5">You Have no restaurants.</h4>
            <Link
              className="text-lime-600 hover:underline"
              to="/add-restaurant"
            >
              Create one &rarr;
            </Link>
          </>
        ) : (
          <div className="grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10">
            {data?.myRestaurants.restaurants?.map((restaurant, index) => (
              <Restaurant
                key={index}
                id={restaurant.id + ""}
                name={restaurant.name}
                categoryName={restaurant.category?.name}
                coverImage={restaurant.coverImage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
