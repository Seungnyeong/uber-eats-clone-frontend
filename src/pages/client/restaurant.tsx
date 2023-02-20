import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom"
import { RESTAURANT_FRAGMENT } from "../../fragments";
import { RestaurantQuery, RestaurantQueryVariables } from "../../__api__/types";

const RESTAURANT_QUERY = gql`
    query restaurant($input: RestaurantInput!) {
        restaurant(input: $input) {
            error
            ok
            restaurant {
                ...RestaurantParts
            }
        }
    }
    ${RESTAURANT_FRAGMENT}
`

type IRestaurantParams = {
    id: string;
}

export const Restaurant = () => {
    const params = useParams<IRestaurantParams>();
    const {data, loading} = useQuery<RestaurantQuery, RestaurantQueryVariables>(RESTAURANT_QUERY, {
        variables : {
            input : {
                restaurantId : Number(params.id)
            }
        }
    });
    
    return <div>
        <div className="bg-gray-800 py-48 bg-cover bg-center" style={{
            backgroundImage : `url(${data?.restaurant.restaurant?.coverImage})`

        }}>
        <div className="bg-white w-3/12 py-8 pl-44">
            <h4 className="text-4xl mt-4">{data?.restaurant.restaurant?.name}</h4>
            <h5 className="text-sm font-light mb-2">{data?.restaurant.restaurant?.category?.name}</h5>
            <h6 className="text-sm font-light mb-2">{data?.restaurant.restaurant?.address}</h6>
        </div>
        </div>
    </div>
}