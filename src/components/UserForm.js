import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "./Card";

const UserForm = () => {
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [location, setLocation] = useState("");
  const [POI, setPOI] = useState("");
  const [buttonClicked, setButtonClicked] = useState(false);

  useEffect(() => {
    // Define your API keys and URLs
    const api_key = process.env.REACT_APP_API_KEY;
    const getCoordinatesUrl = "https://geocode.search.hereapi.com/v1/geocode";
    const poiUrl = "https://discover.search.hereapi.com/v1/discover";
    const findEtaUrl = "https://router.hereapi.com/v8/routes";

    // Step 1: Get Coordinates
    const originQuery = location;
    const destinationQuery =
      "Bits Pilani Hyderabad Campus, CRPF, Secunderabad, Telangana, India";

    async function fetchCoordinates() {
      try {
        const originResponse = await axios.get(getCoordinatesUrl, {
          params: { q: originQuery, apiKey: api_key },
        });

        const destinationResponse = await axios.get(getCoordinatesUrl, {
          params: { q: destinationQuery, apiKey: api_key },
        });

        const originCoordinates = originResponse.data.items[0].position;
        const destinationCoordinates =
          destinationResponse.data.items[0].position;

        // Step 2: Search for Restaurants (POI)
        const poiResponse = await axios.get(poiUrl, {
          params: {
            at: `${destinationCoordinates.lat},${destinationCoordinates.lng}`,
            limit: 20,
            lang: "en",
            q: POI,
            apiKey: api_key,
          },
        });

        const restaurants = poiResponse.data.items;

        // Step 4: Find ETA for Restaurants
        const filteredRestaurants = [];

        for (const restaurant of restaurants) {
          const restaurantCoordinates = restaurant.position;
          const originLat = originCoordinates.lat;
          const originLng = originCoordinates.lng;
          const restaurantLat = restaurantCoordinates.lat;
          const restaurantLng = restaurantCoordinates.lng;

          // Calculate ETA from origin to restaurant
          const etaResponse = await axios.get(findEtaUrl, {
            params: {
              apiKey: api_key,
              origin: `${originLat},${originLng}`,
              destination: `${restaurantLat},${restaurantLng}`,
              transportMode: "car",
            },
          });

          const arrivalTimeString =
            etaResponse.data.routes[0].sections[0].arrival.time;
          const arrivalTime = new Date(arrivalTimeString);
          const departureTimeString =
            etaResponse.data.routes[0].sections[0].departure.time;
          const departureTime = new Date(departureTimeString);
          const timeDifference = arrivalTime - departureTime;

          // Check if travel time is within 20 minutes (1200 seconds)
          if (timeDifference < 1200 * 1000) {
            filteredRestaurants.push(restaurant);
          }
        }

        // Step 5: Set filtered restaurants in the state
        setFilteredRestaurants(filteredRestaurants);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    // Call the function to start the chain of API calls
    if (buttonClicked) {
      fetchCoordinates();
      setButtonClicked(false);
    }
  }, [buttonClicked]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setButtonClicked(true);
  };

  return (
    <div className="flex flex-row">
      <div className="flex flex-col w-[30rem] border h-screen fixed">
        <h2 className="text-3xl mt-1 p-3 border-b-2">
          Welcome to 20 minutes city
        </h2>
        <div className="w-full">
          <form className="bg-white rounded px-8 pt-6 pb-8 mb-4 mt-[4rem]">
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                for="location"
              >
                Location Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="location"
                type="text"
                placeholder="Location"
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                for="poi"
              >
                Place of Interest
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="poi"
                type="text"
                placeholder="POI"
                onChange={(e) => setPOI(e.target.value)}
              />
              <div className="flex flex-row gap-5 justify-center">
                <div>
                  <input
                    id="walking"
                    class="peer/draft"
                    type="radio"
                    name="status"
                    checked
                  />
                  <label for="walking" class="peer-checked/draft:text-sky-500">
                    Walking
                  </label>
                </div>
                <div>
                  <input
                    id="car"
                    class="peer/published"
                    type="radio"
                    name="status"
                  />
                  <label for="car" class="peer-checked/published:text-sky-500">
                    Car
                  </label>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="flex flex-col w-[75rem] mt-1 ml-[30rem]">
        {POI && <h1 className="text-3xl">Filtered {POI}s</h1>}
        <ol className="mt-3 grid grid-cols-3 place-items-center">
          {filteredRestaurants.map((restaurant, index) => (
            // <li key={index}>{index + 1}. {restaurant.title}</li>
            <Card name={restaurant.title} address={restaurant.title} />
          ))}
        </ol>
      </div>
    </div>
  );
};

export default UserForm;
