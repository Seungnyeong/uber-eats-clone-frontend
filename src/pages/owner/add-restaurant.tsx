import { gql, useApolloClient, useMutation } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/button";
import { FormError } from "../../components/form-error";
import {
  CreateRestaurantMutation,
  CreateRestaurantMutationVariables,
} from "../../__api__/types";
import { MY_RESTAURANTS_QUERY } from "./my-restaurants";

const CREATE_RESTAURANT_MUTATION = gql`
  mutation createRestaurant($input: CreateRestaurantInput!) {
    createRestaurant(input: $input) {
      error
      ok
      restaurantId
    }
  }
`;

interface IFormProps {
  name: string;
  address: string;
  categoryName: string;
  file: FileList;
}

export const AddRestaurant = () => {
  const client = useApolloClient();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState("");
  const onCompleted = (data: CreateRestaurantMutation) => {
    const {
      createRestaurant: { ok, restaurantId },
    } = data;

    if (ok) {
      const { file, address, categoryName, name } = getValues();
      setUploading(false);
      const queryResult = client.readQuery({
        query: MY_RESTAURANTS_QUERY,
      });

      console.log(queryResult);

      client.writeQuery({
        query: MY_RESTAURANTS_QUERY,
        data: {
          myRestaurants: {
            ...queryResult.myRestaurants,
            restaurants: [
              {
                address,
                category: {
                  name: categoryName,
                  __typename: "Category",
                },
                coverImage: imageUrl,
                id: restaurantId,
                isPromoted: false,
                name,
                __typename: "Restaurant",
              },
              ...queryResult.myRestaurants.restaurants,
            ],
          },
        },
      });
      navigate("/");
    }
  };
  const [createRestaurantMutation, { data }] = useMutation<
    CreateRestaurantMutation,
    CreateRestaurantMutationVariables
  >(CREATE_RESTAURANT_MUTATION, {
    onCompleted,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const queryResult = client.readQuery({
      query: MY_RESTAURANTS_QUERY,
    });
    console.log(queryResult);
  }, []);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { isValid },
  } = useForm<IFormProps>({
    mode: "onChange",
  });

  const onSubmit = async (form: IFormProps) => {
    try {
      setUploading(true);
      const { file, name, categoryName, address } = form;
      const actaulFile = file[0];
      const formBody = new FormData();
      formBody.append("file", actaulFile);
      const { url: coverImage } = await (
        await fetch("http://localhost:4000/uploads/", {
          method: "POST",
          body: formBody,
        })
      ).json();
      setImageUrl(coverImage);
      createRestaurantMutation({
        variables: {
          input: {
            name,
            categoryName,
            address,
            coverImage,
          },
        },
      });
    } catch (e) {}
  };

  return (
    <div className="container flex flex-col items-center mt-52">
      <Helmet>
        <title>Add Restaurant | Nuber Eats</title>
      </Helmet>
      <h4 className="font-semibold text-2xl mb-3">Add Restaurant</h4>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          className="input"
          type="text"
          placeholder="name"
          {...register("name", {
            required: "Name is required.",
          })}
        />
        <input
          className="input"
          type="text"
          placeholder="address"
          {...register("address", {
            required: "Name is required",
          })}
        />
        <input
          className="input"
          type="text"
          placeholder="category name"
          {...register("categoryName", {
            required: "Category Name  is required",
          })}
        />
        <div>
          <input
            type="file"
            accept="image/*"
            {...register("file", {
              required: true,
            })}
          />
        </div>
        <Button
          loading={uploading}
          canClick={isValid}
          actionText={"Create Account"}
        />
        {data?.createRestaurant?.error && (
          <FormError errorMessage={data.createRestaurant.error} />
        )}
      </form>
    </div>
  );
};
