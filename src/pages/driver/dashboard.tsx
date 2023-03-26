import React, { useEffect, useState } from "react";
import GoogleMapReact from "google-map-react";
import { gql, useMutation, useSubscription } from "@apollo/client";
import { FULL_ORDER_FRAGMENT } from "../../fragments";
import {
  CookedOrderSubscription,
  TakeOrderMutation,
  TakeOrderMutationVariables,
} from "../../__api__/types";
import { useNavigate } from "react-router-dom";

const COOKED_ORDERS_SUBSCRIPTION = gql`
  subscription cookedOrder {
    cookedOrders {
      ...FullOrderParts
    }
  }
  ${FULL_ORDER_FRAGMENT}
`;

const TAKE_ORDER_MUTATION = gql`
  mutation takeOrder($input: TakeOrderInput!) {
    takeOrder(input: $input) {
      ok
      error
    }
  }
`;

interface ICoords {
  lat: number;
  lng: number;
}

interface IDriverProps {
  lat: number;
  lng: number;
  $hover?: any;
}

const Driver: React.FC<IDriverProps> = () => <div className="text-lg">🚕</div>;

export const DashBoard = () => {
  const [driverCoords, setDriverCoords] = useState<ICoords>({
    lat: 0,
    lng: 0,
  });
  const [map, setMap] = useState<google.maps.Map>();
  const [maps, setMaps] = useState<any>();
  const onSuccess = ({
    coords: { latitude, longitude },
  }: GeolocationPosition) => {
    setDriverCoords({ lat: latitude, lng: longitude });
  };

  const onError = (error: GeolocationPositionError) => {
    console.log(error);
  };

  useEffect(() => {
    navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
    });
  }, [driverCoords]);

  useEffect(() => {
    if (map && maps) {
      map.panTo(new google.maps.LatLng(driverCoords.lat, driverCoords.lng));
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        {
          location: new google.maps.LatLng(driverCoords.lat, driverCoords.lng),
        },
        (results, status) => {
          console.log(status);
          console.log(results);
        }
      );
    }
  }, [driverCoords.lat, driverCoords.lng, map, maps]);

  const onApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    map.panTo(new google.maps.LatLng(driverCoords.lat, driverCoords.lng));
    setMap(map);
    setMaps(maps);
  };

  const makeRoute = () => {
    if (map) {
      const directionService = new google.maps.DirectionsService();
      const directionRenderer = new google.maps.DirectionsRenderer({
        polylineOptions: {
          strokeColor: "black",
        },
      });
      directionRenderer.setMap(map);
      directionService.route(
        {
          origin: {
            location: new google.maps.LatLng(
              driverCoords.lat,
              driverCoords.lng
            ),
          },
          destination: {
            location: new google.maps.LatLng(
              driverCoords.lat + 0.01,
              driverCoords.lng
            ),
          },
          travelMode: google.maps.TravelMode.TRANSIT,
        },
        (result) => {
          directionRenderer.setDirections(result);
        }
      );
    }
  };

  const { data: cockedOrdersData } = useSubscription<CookedOrderSubscription>(
    COOKED_ORDERS_SUBSCRIPTION
  );

  useEffect(() => {
    if (cockedOrdersData?.cookedOrders.id) {
      makeRoute();
    }
  }, [cockedOrdersData]);

  const onCompleted = (data: TakeOrderMutation) => {
    if (data.takeOrder.ok) {
      navigate(`/orders/${cockedOrdersData?.cookedOrders.id}`);
    }
  };

  const navigate = useNavigate();
  const [takeOrderMutation] = useMutation<
    TakeOrderMutation,
    TakeOrderMutationVariables
  >(TAKE_ORDER_MUTATION, { onCompleted });

  const triggerMutation = (orderId: number) => {
    takeOrderMutation({
      variables: {
        input: {
          id: orderId,
        },
      },
    });
  };

  return (
    <div>
      <div
        className="bg-gray-800 overflow-hidden"
        style={{
          width: "100%",
          height: "50vh",
        }}
      >
        <GoogleMapReact
          defaultZoom={20}
          defaultCenter={{
            lat: 37.58,
            lng: 126.9,
          }}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={onApiLoaded}
          bootstrapURLKeys={{
            key: String(process.env.REACT_APP_GOOGLE_MAP_KEY),
          }}
        >
          <Driver lng={driverCoords.lng} lat={driverCoords.lat} />
        </GoogleMapReact>
      </div>
      {cockedOrdersData?.cookedOrders.restaurant ? (
        <div className="max-w-screen-sm mx-auto bg-white relative -top-10 shadow-lg py-8 px-5 ">
          <h1 className="text-center text-3xl font-medium">New Cooked Order</h1>
          <h4 className="text-center text-3xl my-3 font-medium">
            Pick up soon @ {cockedOrdersData.cookedOrders.restaurant?.name}
          </h4>
          <button
            onClick={() => triggerMutation(cockedOrdersData?.cookedOrders.id)}
            className="btn w-full mt-5"
          >
            Accept Challenge &rarr;
          </button>
        </div>
      ) : (
        <h4 className="text-center text-3xl font-medium">No orders yet...</h4>
      )}
    </div>
  );
};
