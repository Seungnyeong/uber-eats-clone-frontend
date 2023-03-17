import { gql, useMutation } from "@apollo/client";
import React from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/button";
import {
  CreateDishMutation,
  CreateDishMutationVariables,
} from "../../__api__/types";
import { MY_RESTAURANT_QUERY } from "./my-restaurant";

const CREATE_DISH_MUTATION = gql`
  mutation createDish($input: CreateDishInput!) {
    createDish(input: $input) {
      ok
      error
    }
  }
`;

interface IForm {
  name: string;
  price: string;
  description: string;
}

export const AddDish = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [createDishMutation, { loading }] = useMutation<
    CreateDishMutation,
    CreateDishMutationVariables
  >(CREATE_DISH_MUTATION, {
    refetchQueries: [
      {
        query: MY_RESTAURANT_QUERY,
        variables: {
          input: {
            id: Number(id),
          },
        },
      },
    ],
  });
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<IForm>({
    mode: "onChange",
  });

  const onSubmit = (value: IForm) => {
    createDishMutation({
      variables: {
        input: {
          name: value.name,
          price: Number(value.price),
          description: value.description,
          restaurantId: Number(id),
        },
      },
    });
    navigate(-1);
  };

  return (
    <div className="container flex flex-col items-center mt-52">
      <Helmet>
        <title>Add Dish | Nuber eats</title>
      </Helmet>
      <h4 className="font-semibold text-2xl mb-3">Add Dish </h4>
      <form
        className="grid max-w-screen-sm gap-3 mt-5 w-full mb-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          className="input"
          type="text"
          placeholder="name"
          {...register("name", {
            required: "Name is Required",
          })}
        />
        <input
          className="input"
          type="text"
          placeholder="Price"
          {...register("price", {
            required: "Price is Required",
            min: 0,
          })}
        />
        <input
          className="input"
          type="text"
          placeholder="Description"
          {...register("description", {
            required: "Description is Required",
          })}
        />
        <Button loading={loading} canClick={isValid} actionText="Create Dish" />
      </form>
    </div>
  );
};
