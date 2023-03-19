import { gql, useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dish } from "../../components/dish";
import { DishOption } from "../../components/dish-option";
import { DISH_FRAGMENT, RESTAURANT_FRAGMENT } from "../../fragments";
import {
  CreateAccountMutationVariables,
  CreateOrderItemInput,
  CreateOrderMutation,
  CreateOrderMutationVariables,
  RestaurantQuery,
  RestaurantQueryVariables,
} from "../../__api__/types";

const RESTAURANT_QUERY = gql`
  query restaurant($input: RestaurantInput!) {
    restaurant(input: $input) {
      error
      ok
      restaurant {
        ...RestaurantParts
        menu {
          ...DishParts
        }
      }
    }
  }
  ${RESTAURANT_FRAGMENT}
  ${DISH_FRAGMENT}
`;

type IRestaurantParams = {
  id: string;
};

const CREATE_ORDER_MUTATIONS = gql`
  mutation createOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      ok
      error
      orderId
    }
  }
`;

export const Restaurant = () => {
  const params = useParams<IRestaurantParams>();
  const { data, loading } = useQuery<RestaurantQuery, RestaurantQueryVariables>(
    RESTAURANT_QUERY,
    {
      variables: {
        input: {
          restaurantId: Number(params.id),
        },
      },
    }
  );

  const [orderStarted, setOrderStarted] = useState(false);
  const [orderItems, setOrderItems] = useState<CreateOrderItemInput[]>([]);
  const triggerStartOrder = () => {
    setOrderStarted(true);
  };

  const getItem = (dishId: number) => {
    return orderItems.find((order) => order.dishId === dishId);
  };

  const isSelected = (dishId: number) => {
    return Boolean(getItem(dishId));
  };

  const addItemToOrder = (dishId: number) => {
    if (isSelected(dishId)) {
      return;
    }
    setOrderItems((currrent) => [{ dishId, options: [] }, ...currrent]);
  };

  const removeFromOrder = (dishId: number) => {
    setOrderItems((current) =>
      current.filter((dish) => dish.dishId !== dishId)
    );
  };

  const addOptionToItem = (dishId: number, optionName: string) => {
    if (!isSelected(dishId)) {
      return;
    }
    const oldItem = getItem(dishId);
    if (oldItem) {
      const hasOption = Boolean(
        oldItem.options?.find((x) => x.name === optionName)
      );
      if (!hasOption) {
        removeFromOrder(dishId);
        setOrderItems((currrent) => [
          { dishId, options: [{ name: optionName }, ...oldItem.options!] },
          ...currrent,
        ]);
      }
    }
  };

  const getOptionFromItem = (
    item: CreateOrderItemInput,
    optionName: string
  ) => {
    return item.options?.find((option) => option.name === optionName);
  };
  const isOptionSelected = (dishId: number, optionName: string) => {
    const item = getItem(dishId);
    if (item) {
      return Boolean(getOptionFromItem(item, optionName));
    }
    return false;
  };

  const removeOptionFromItem = (dishId: number, optionName: string) => {
    if (!isSelected(dishId)) {
      return;
    }
    const oldItem = getItem(dishId);
    if (oldItem) {
      removeFromOrder(dishId);
      setOrderItems((currrent) => [
        {
          dishId,
          options: oldItem.options?.filter(
            (option) => option.name !== optionName
          ),
        },
        ...currrent,
      ]);
      return;
    }
  };
  const triggerCancelOrder = () => {
    setOrderStarted(false);
    setOrderItems([]);
  };
  const navigate = useNavigate();
  const onCompleted = (data: CreateOrderMutation) => {
    const {
      createOrder: { ok, orderId },
    } = data;
    if (ok) {
      navigate(`/orders/${orderId}`);
    }
  };
  const [createOrderMutation, { loading: placingOrder }] = useMutation<
    CreateOrderMutation,
    CreateOrderMutationVariables
  >(CREATE_ORDER_MUTATIONS, {
    onCompleted,
  });
  const triggerConfirmOrder = () => {
    if (orderItems.length === 0) {
      alert("Can't place empty Order");
      return;
    }

    const ok = window.confirm("You are about to confirm order?");

    if (ok) {
      createOrderMutation({
        variables: {
          input: {
            restaurantId: Number(params.id),
            items: orderItems,
          },
        },
      });
    }
  };
  console.log(orderItems);
  return (
    <div>
      <div
        className="bg-gray-800 py-48 bg-cover bg-center"
        style={{
          backgroundImage: `url(${data?.restaurant.restaurant?.coverImage})`,
        }}
      >
        <div className="bg-white w-3/12 py-8 pl-44">
          <h4 className="text-4xl mt-4">{data?.restaurant.restaurant?.name}</h4>
          <h5 className="text-sm font-light mb-2">
            {data?.restaurant.restaurant?.category?.name}
          </h5>
          <h6 className="text-sm font-light mb-2">
            {data?.restaurant.restaurant?.address}
          </h6>
        </div>
      </div>
      <div className="container mt-20 flex flex-col">
        <div className="grid mt-16 md:grid-cols-3 gap-x-5 gap-y-10">
          {!orderStarted && (
            <button onClick={triggerStartOrder} className="btn px-10">
              Start Order
            </button>
          )}
          {orderStarted && (
            <div className="flex items-center">
              <button onClick={triggerConfirmOrder} className="btn px-10 mr-3">
                Confirm Order
              </button>
              <button
                onClick={triggerCancelOrder}
                className="btn px-10 bg-black hover:bg-black"
              >
                Cancel Order
              </button>
            </div>
          )}
          {data?.restaurant.restaurant?.menu.map((dish) => (
            <Dish
              isSelected={isSelected(dish.id)}
              key={dish.id}
              id={dish.id}
              orderStarted={orderStarted}
              name={dish.name}
              price={dish.price}
              description={dish.description}
              isCustomer={true}
              options={dish.options}
              addItemToOrder={addItemToOrder}
              removeFromOrder={removeFromOrder}
            >
              <>
                {dish.options?.map((option, index) => (
                  <DishOption
                    key={index}
                    dishId={dish.id}
                    isSelected={isOptionSelected(dish.id, option.name)}
                    name={option.name}
                    extra={option.extra}
                    addOptionToItem={addOptionToItem}
                    removeOptionFromItem={removeOptionFromItem}
                  />
                ))}
              </>
            </Dish>
          ))}
        </div>
      </div>
    </div>
  );
};
