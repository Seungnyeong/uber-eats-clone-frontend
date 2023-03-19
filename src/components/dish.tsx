import React from "react";
import { DishOption } from "../__api__/types";

interface IDishProps {
  id?: number;
  description: string;
  name: string;
  price: number;
  isCustomer?: boolean;
  options?: DishOption[] | null;
  orderStarted?: boolean;
  addItemToOrder?: (dishId: number) => void;
  removeFromOrder?: (dishId: number) => void;
  isSelected?: boolean;
  children?: string | JSX.Element | JSX.Element[];
}

export const Dish: React.FC<IDishProps> = ({
  description,
  name,
  price,
  isCustomer = false,
  orderStarted = false,
  options,
  addItemToOrder,
  removeFromOrder,
  id = 0,
  isSelected,
  children: dishOptions,
}) => {
  const onClick = () => {
    if (orderStarted) {
      if (!isSelected && addItemToOrder) {
        return addItemToOrder(id);
      }

      if (isSelected && removeFromOrder) {
        return removeFromOrder(id);
      }
    }
  };
  return (
    <div
      className={`px-8 pt-3 pb-8 border cursor-pointer hover:border-gray-800 transition-all ${
        isSelected ? "border-gray-800" : "hover:border-gray-800"
      }`}
    >
      <div className="mb-5">
        <h3 className="font-medium text-lg flex items-center">
          {name}{" "}
          {orderStarted && (
            <button
              className={`ml-3 py-1 px-3 focus:outline-none text-sm text-white ${
                isSelected ? "bg-red-500" : "bg-lime-500"
              }`}
              onClick={onClick}
            >
              {isSelected ? "Remove" : "Add"}
            </button>
          )}
        </h3>
        <h4 className="text-lg font-medium">{description}</h4>
      </div>
      <span>${price}</span>
      {isCustomer && options && options?.length !== 0 && (
        <div>
          <h5 className="mt-5 my-3 font-medium">Dish Options:</h5>
          {dishOptions}
        </div>
      )}
    </div>
  );
};
