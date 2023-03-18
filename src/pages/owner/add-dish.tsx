import { gql, useMutation } from "@apollo/client";
import React, { useCallback, useState } from "react";
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
  [key: string]: string;
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
    setValue,
    formState: { isValid, errors },
  } = useForm<IForm>({
    mode: "onChange",
  });
  const [optionsNumber, setOptionsNumber] = useState<number[]>([]);

  const onAddOptionClick = () => {
    setOptionsNumber((cur) => [Date.now(), ...cur]);
  };

  const onSubmit = useCallback((value: IForm) => {
    const optionsObjects = optionsNumber.map((theId) => {
      return {
        name: value[`${theId}-optionName`],
        extra: Number(value[`${theId}-optionExtra`]),
      };
    });

    createDishMutation({
      variables: {
        input: {
          name: value.name,
          price: Number(value.price),
          description: value.description,
          restaurantId: Number(id),
          options: optionsObjects,
        },
      },
    });
    navigate(-1);
  }, []);

  const onDeleteClick = (idToDelete: number) => {
    setOptionsNumber((cur) => cur.filter((id) => id !== idToDelete));
    setValue(`${idToDelete}-optionName`, "");
    setValue(`${idToDelete}-optionExtra`, "");
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
        <div className="my-10">
          <h4 className="font-medium mb-3 text-lg">Dish Options</h4>
          <span
            className="cursor-pointer text-white bg=gray-900 py-1 px-2 mt-5 bg-black"
            onClick={onAddOptionClick}
          >
            Add Dish Option
          </span>
          {optionsNumber.length !== 0 &&
            optionsNumber.map((id) => {
              return (
                <div key={id} className="mt-5">
                  <input
                    {...register(`${id}-optionName`)}
                    className="py-2 px-4 focus:outline-none mr-3 focus:border-gray-600 border-2"
                    type="text"
                    placeholder="Option Name"
                  />
                  <input
                    {...register(`${id}-optionExtra`, {
                      min: 0,
                    })}
                    className="py-2 px-4 focus:outline-none focus:border-gray-600 border-2"
                    type="number"
                    min={0}
                    defaultValue={0}
                    placeholder="Option Extra Price"
                  />
                  <span
                    className="cursor-pointer text-white bg=gray-900 mt-5 bg-red-500 ml-3 py-3 px-4"
                    onClick={() => onDeleteClick(id)}
                  >
                    Delete Option
                  </span>
                </div>
              );
            })}
        </div>
        <Button loading={loading} canClick={isValid} actionText="Create Dish" />
      </form>
    </div>
  );
};
