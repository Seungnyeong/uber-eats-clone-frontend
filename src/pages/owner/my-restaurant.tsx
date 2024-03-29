import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import React, { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Dish } from "../../components/dish";
import {
  DISH_FRAGMENT,
  FULL_ORDER_FRAGMENT,
  ORDERS_FRAGMENT,
  RESTAURANT_FRAGMENT,
} from "../../fragments";
import {
  CreatePaymentMutation,
  CreatePaymentMutationVariables,
  MyRestaurantQuery,
  MyRestaurantQueryVariables,
  PendingOrdersSubscription,
} from "../../__api__/types";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryLine,
  VictoryTheme,
  VictoryZoomContainer,
} from "victory";
import { Helmet } from "react-helmet-async";
import { useMe } from "../../hooks/useMe";

export const MY_RESTAURANT_QUERY = gql`
  query myRestaurant($input: MyRestaurantInput!) {
    myRestaurant(input: $input) {
      ok
      error
      restaurant {
        ...RestaurantParts
        menu {
          ...DishParts
        }
        orders {
          ...OrderParts
        }
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
  ${DISH_FRAGMENT}
  ${ORDERS_FRAGMENT}
`;

const CREATE_PAYMENT_MUTATION = gql`
  mutation createPayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      ok
      error
    }
  }
`;

const PENDING_ORDERS_SUBSCRIPTION = gql`
  subscription pendingOrders {
    pendingOrders {
      ...FullOrderParts
    }
  }
  ${FULL_ORDER_FRAGMENT}
`;

type IParams = {
  id: string;
};

export const MyRestaurant = () => {
  const { id } = useParams<IParams>();
  const { data } = useQuery<MyRestaurantQuery, MyRestaurantQueryVariables>(
    MY_RESTAURANT_QUERY,
    {
      variables: {
        input: {
          id: Number(id),
        },
      },
    }
  );
  const onCompleted = (data: CreatePaymentMutation) => {
    if (data.createPayment.ok) {
      alert("Your Restaurant is being Promoted!");
    }
  };
  const [createPaymentMutation, { loading }] = useMutation<
    CreatePaymentMutation,
    CreatePaymentMutationVariables
  >(CREATE_PAYMENT_MUTATION, {
    onCompleted,
  });
  const { data: userData } = useMe();
  const triggerPaddle = () => {
    if (userData?.me.email) {
      //@ts-ignore
      window.Paddle.Setup({ vendor: Number(process.env.REACT_APP_VENDOR_ID) });
      //@ts-ignore
      window.Paddle.Checkout.open({
        product: Number(process.env.REACT_APP_PRODUCT_ID),
        email: userData.me.email,
        successCallback: (data: any) => {
          createPaymentMutation({
            variables: {
              input: {
                transactionId: data.checkout.id,
                restaurantId: Number(id),
              },
            },
          });
        },
      });
    }
  };
  const { data: subscriptionData } = useSubscription<PendingOrdersSubscription>(
    PENDING_ORDERS_SUBSCRIPTION
  );
  const navigate = useNavigate();
  useEffect(() => {
    if (subscriptionData?.pendingOrders.id) {
      navigate(`/orders/${subscriptionData.pendingOrders.id}`);
    }
  }, [subscriptionData]);
  return (
    <div>
      <Helmet>
        <title>
          {data?.myRestaurant.restaurant?.name || "Loading..."} | Nuber Eats
        </title>
        <script src="https://cdn.paddle.com/paddle/paddle.js"></script>
      </Helmet>
      <div
        className="bg-gray-700 py-28 bg-center bg-cover"
        style={{
          backgroundImage: `url(${data?.myRestaurant.restaurant?.coverImage})`,
        }}
      ></div>
      <div className="container mt-10">
        <h2 className="text-4xl font-medium mb-10">
          {data?.myRestaurant.restaurant?.name || "Loading..."}
        </h2>
        <Link
          to={`/restaurant/${id}/add-dish`}
          className="mr-8 text-white bg-gray-500 py-3 px-10"
        >
          Add Dish &rarr;
        </Link>
        <span
          onClick={triggerPaddle}
          className="cursor-pointer text-white bg-lime-700 py-3 px-10"
        >
          Buy Promotion &rarr;
        </span>
        <div className="mt-10">
          {data?.myRestaurant.restaurant?.menu.length === 0 ? (
            <h4 className="text-xl mb-5">Please upload a dish</h4>
          ) : (
            <div className="grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10">
              {data?.myRestaurant.restaurant?.menu.map((dish) => (
                <Dish
                  name={dish.name}
                  price={dish.price}
                  description={dish.description}
                />
              ))}
            </div>
          )}
        </div>
        <div className="mt-20 mb-10">
          <h4 className="text-center text-2xl font-medium">Sales</h4>
          <div className="mt-10">
            <VictoryChart
              theme={VictoryTheme.material}
              height={500}
              width={window.innerWidth}
              domainPadding={50}
              containerComponent={<VictoryZoomContainer />}
            >
              <VictoryLine
                labels={({ datum }) => `$${datum.y}`}
                labelComponent={
                  <VictoryLabel
                    style={{ fontSize: 20 }}
                    renderInPortal
                    dy={-20}
                  />
                }
                data={data?.myRestaurant.restaurant?.orders.map((order) => ({
                  x: order.createdAt,
                  y: order.total,
                }))}
                interpolation="catmullRom"
                style={{
                  data: {
                    stroke: "blue",
                    strokeWidth: 5,
                  },
                }}
              />
              <VictoryAxis
                style={{ tickLabels: { fontSize: 20, fill: "red" } as any }}
                dependentAxis
                tickFormat={(tick) => `$${tick}`}
              />
              <VictoryAxis
                style={{
                  tickLabels: {
                    fontSize: 20,
                  } as any,
                }}
                tickFormat={(tick) => new Date(tick).toLocaleString("ko")}
              />
            </VictoryChart>
          </div>
        </div>
      </div>
    </div>
  );
};
