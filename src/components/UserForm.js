import React, { useEffect, useState } from "react";
import axios from "axios";

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
            q: {POI},
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
    if(buttonClicked) {
      fetchCoordinates();
    }
  }, [buttonClicked]);

  const handleSubmit = (e) => {  
    e.preventDefault();
    setButtonClicked(true);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            id="location"
            value={location}
            placeholder="Location"
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            className="form-control"
            id="place"
            value={POI}
            placeholder="Place of Interest"
            onChange={(e) => setPOI(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
      <h1>Filtered Restaurants:</h1>
      <ul>
        {filteredRestaurants.map((restaurant, index) => (
          <li key={index}>{restaurant.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserForm;
