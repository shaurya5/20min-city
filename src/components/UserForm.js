import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "./Card";
import "./userForm.css";
import logoImage from "../logo.png";

const UserForm = () => {
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [location, setLocation] = useState("");
  const [POI, setPOI] = useState("");
  const [buttonClicked, setButtonClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transportMode, setTransportMode] = useState("car");
  const [destinationWeather, setDestinationWeather] = useState(null);
  
  const fetchWeatherData = async (lat, lng) => {
    try {
      const weatherApiKey = "0e16e90e8fbd4c9da78225559232909"; // Replace with your actual weather API key
      const weatherApiUrl = `http://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${lat},${lng}`;

      const response = await axios.get(weatherApiUrl);
      const weatherData = response.data;
      console.log(weatherData);
      setDestinationWeather(weatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };


  useEffect(() => {
    // Define your API keys and URLs
    const api_key = process.env.REACT_APP_API_KEY;
    const getCoordinatesUrl = "https://geocode.search.hereapi.com/v1/geocode";
    const poiUrl = "https://discover.search.hereapi.com/v1/discover";
    const findEtaUrl = "https://router.hereapi.com/v8/routes";

    // Step 1: Get Coordinates
    const originQuery = location;
    const destinationQuery = location;

    async function fetchCoordinates() {
      try {
        setLoading(true);
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
            limit: 2,
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
          const address = restaurant.address.label
          // Calculate ETA from origin to restaurant
          const etaResponse = await axios.get(findEtaUrl, {
            params: {
              apiKey: api_key,
              origin: `${originLat},${originLng}`,
              destination: `${restaurantLat},${restaurantLng}`,
              transportMode,
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
        fetchWeatherData(destinationCoordinates.lat, destinationCoordinates.lng);
        
        setFilteredRestaurants(filteredRestaurants);
        setLoading(false)
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
      <div className="user-form-container">
      <img className="logo-img" src={logoImage} alt="Logo" />
        <h2 className="user-form-heading">We need to know some things..</h2>
        <div className="user-form-content">
          <form className="user-form">
            <div className="form-group">
              <label htmlFor="location">Location Name</label>
              <input
                className="form-control"
                id="location"
                type="text"
                placeholder="Location"
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="poi">Place of Interest</label>
              <input
                className="form-control"
                id="poi"
                type="text"
                placeholder="POI"
                onChange={(e) => setPOI(e.target.value)}
              />
            </div>
            <div className="form-group transport-options">
              <div>
                <input
                  id="car"
                  type="radio"
                  name="transport"
                  defaultChecked
                  value="car"
                />
                <label htmlFor="car">Car</label>
              </div>
              <div>
                <input
                  id="walking"
                  type="radio"
                  name="transport"
                  value="pedestrian"
                />
                <label htmlFor="walking">Walking</label>
              </div>
              <div>
                <input
                  id="bicycle"
                  type="radio"
                  name="transport"
                  value="bicycle"
                />
                <label htmlFor="walking">Cycle</label>
              </div>
            </div>
            <div className="form-group">
              <button
                className="submit-button"
                type="button"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
            {destinationWeather && (
              <div className="weather-info">
                <h2>Weather at Destination</h2>
                <p>Location: {destinationWeather.location.name}</p>
                <p>Temperature: {destinationWeather.current.temp_c}°C</p>
                <p>Condition: {destinationWeather.current.condition.text}</p>
              </div>
            )}
          </form>
        </div>
      </div>
      <div className="restaurant-list-container">
        {!loading ? (
          <ol className="restaurant-list">
            {filteredRestaurants.map((restaurant, index) => (
              <Card
                key={index}
                name={restaurant.title}
                address={restaurant.address.label}
                distance={restaurant.distance}
                lat={restaurant.position.lat}
                long={restaurant.position.lng}
              />
            ))}
          </ol>
        ) : (
          "Loading..."
        )}
      </div>
    </div>
  );
};


export default UserForm;
