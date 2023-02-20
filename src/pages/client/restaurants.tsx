import { gql, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Restaurant } from "../../components/restaurant";
import { CATEGORY_FRAGMENT, RESTAURANT_FRAGMENT } from "../../fragments";
import { RestaurantsPageQuery, RestaurantsPageQueryVariables } from "../../__api__/types";

const RESTAURANTS_PAGE_QUERY = gql`
    query restaurantsPage($input: RestaurantsInput!) {
        allCategories {
            ok
            error
            categories {
               ...CategoryParts
            }
        }
        restaurants(input : $input) {
            ok
            error
            totalPages
            totalResults
            results {
                ...RestaurantParts
            }
        }
    }
    ${RESTAURANT_FRAGMENT}
    ${CATEGORY_FRAGMENT}
`;

interface IFormProps {
    searchTerm: string;
}

export const Restaurants = () => {
    const [page, setPage] = useState(1)
    const { data, loading } = useQuery<RestaurantsPageQuery, RestaurantsPageQueryVariables>(RESTAURANTS_PAGE_QUERY, {
        variables : {
            input: {
                page: page
            }
        }
    });

    const onNextpageClick = () => setPage(current => current + 1);
    const onPrevPageClick = () => setPage(current => current - 1);
    const {register, handleSubmit, getValues} = useForm<IFormProps>();
    const navigate = useNavigate();
    const onSearchSubmit = () => {
        const { searchTerm } = getValues();
         navigate({
            pathname : "/search",
            search : `term=${searchTerm}`
         })
    }
    return <div>
        <Helmet>
            <title>Restaurant | Nuber Eats</title>
        </Helmet>
        <form onSubmit={handleSubmit(onSearchSubmit)} className="bg-gray-800 w-full py-40 flex items-center justify-center">
            <input type="search" className="input rounded-md border-0 w-3/4 md:w-3/12" placeholder="Search restaurants..." {...register("searchTerm", {
                required : true,
                min: 3
            })} />
        </form>
        <div className="px-5 xl:px-10 max-w-screen-2xl mx-auto mt-8">
            {!loading && <div className="pb-20">
                <div className="flex justify-around max-w-screen-xs mx-auto">
                    {data?.allCategories.categories?.map((category, index) => <Link to={`/category/${category.slug}`}><div key={index} className="flex flex-col items-center group-hover:bg-gray-100 cursor-pointer"><div className="w-14 h-14 rounded-full bg-cover hover:bg-gray-100" style={{
                        backgroundImage : `url(${category.coverImage})`
                    }}>
                        </div>
                        <span className="mt-1 text-sm text-center font-bold">{category.name}</span>
                    </div>
                    </Link>
                    )}
                </div>
                
                <div className="grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10">
                    {data?.restaurants.results?.map((restaurant, index) => (
                    <Restaurant key={index} id={restaurant.id + ""} name={restaurant.name} categoryName={restaurant.category?.name} coverImage={restaurant.coverImage} />
                ))}
                </div>
                <div className="grid grid-cols-3 text-center max-w-md mt-10 items-center mx-auto">
                    { page > 1 ? <button onClick={onPrevPageClick} className="font-medium text-2xl focus:outline-none">&larr;</button> : <div></div>}
                    <span className="mx-5">Page {page} of {data?.restaurants.totalPages}</span>
                    {page !== data?.restaurants.totalPages ? <button onClick={onNextpageClick} className="font-medium text-2xl focus:outline-none">&rarr;</button> : <div></div>}
                </div>
                </div>}
        </div>
    </div>
}