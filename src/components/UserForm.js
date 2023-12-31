import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "./Card";
import "./userForm.css";
import logoImage from "../logo.png";
import MapDisplay from "./MapDisplay";
import weatherImage from "../weather.png";

const UserForm = () => {
  const [filteredrequiredPoints, setFilteredrequiredPoints] = useState([]);
  const [location, setLocation] = useState("");
  const [POI, setPOI] = useState("");
  const [buttonClicked, setButtonClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transportMode, setTransportMode] = useState("car");
  const [destinationWeather, setDestinationWeather] = useState(null);
  const [isMapShown, setIsMapShown] = useState(false);
  const [originCoordinates, setOriginCoordinates] = useState({});
  const [useLiveLocation, setUseLiveLocation] = useState(false);


  console.log(originCoordinates)
  const fetchWeatherData = async (lat, lng) => {
    try {
      const weatherApiKey = "0e16e90e8fbd4c9da78225559232909"; // Replace with your actual weather API key
      const weatherApiUrl = `https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${lat},${lng}`;

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
    async function fetchCoordinates() {
      try {
        setLoading(true);
        let originCoordinates = {};
        let destinationCoordinates = {};
        if (useLiveLocation) {
          // Fetch live location coordinates using IP address (You can use a suitable IP Geolocation service)
          const response = await axios.get("https://ipapi.co/json/");
          const { latitude, longitude } = response.data;
          destinationCoordinates = {lat: latitude, lng: longitude};
          originCoordinates = { lat: latitude, lng: longitude };
        } else {
          const originQuery = location;
          const destinationQuery = location;
          // Fetch coordinates based on the manually entered location
          const originResponse = await axios.get(getCoordinatesUrl, {
            params: { q: originQuery, apiKey: api_key },
          });

          originCoordinates = originResponse.data.items[0].position;
          console.log(originCoordinates);
          const destinationResponse = await axios.get(getCoordinatesUrl, {
            params: { q: destinationQuery, apiKey: api_key },
          });
          destinationCoordinates = destinationResponse.data.items[0].position;
        }
        
        
        setOriginCoordinates(originCoordinates);
        // Step 2: Search for requiredPoints (POI)
        const poiResponse = await axios.get(poiUrl, {
          params: {
            at: `${destinationCoordinates.lat},${destinationCoordinates.lng}`,
            limit: 2,
            lang: "en",
            q: POI,
            apiKey: api_key,
          },
        });
        console.log(poiResponse);

        const requiredPoints = poiResponse.data.items;

        // Step 4: Find ETA for requiredPoints
        const filteredrequiredPoints = [];

        for (const requiredPoint of requiredPoints) {
          const requiredPointCoordinates = requiredPoint.position;
          const originLat = originCoordinates.lat;
          const originLng = originCoordinates.lng;
          const requiredPointLat = requiredPointCoordinates.lat;
          const requiredPointLng = requiredPointCoordinates.lng;
          const address = requiredPoint.address.label;
          // Calculate ETA from origin to requiredPoint
          const etaResponse = await axios.get(findEtaUrl, {
            params: {
              apiKey: api_key,
              origin: `${originLat},${originLng}`,
              destination: `${requiredPointLat},${requiredPointLng}`,
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
            filteredrequiredPoints.push(requiredPoint);
          }
        }

        // Step 5: Set filtered requiredPoints in the state
        fetchWeatherData(
          destinationCoordinates.lat,
          destinationCoordinates.lng
        );

        setFilteredrequiredPoints(filteredrequiredPoints);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    // Call the function to start the chain of API calls
    if (buttonClicked) {
      fetchCoordinates();
      setButtonClicked(false);
    }
  }, [buttonClicked, location, useLiveLocation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setButtonClicked(true);
  };

  const handleMap = (e) => {
    e.preventDefault();
    setIsMapShown(!isMapShown);
  };

  return (
    <div className="flex flex-col">
      <div className="user-form-container">
        <img className="logo-img" src={logoImage} alt="Logo" />
        <h2 className="user-form-heading">We need to know some things..</h2>
        <div className="user-form-content">
          <form className="user-form">
            <div className="form-group">
              <div className="liveLoc">                
                <label className="isLive">
                  <input
                    type="checkbox"
                    name="locationOption"
                    value="live"
                    checked={useLiveLocation}
                    onChange={() => setUseLiveLocation(!useLiveLocation)}
                  />
                  <p>Use Live Location</p>
                </label>
              </div>
            </div>
            {!useLiveLocation && <div className="form-group named">
              <label htmlFor="location">Location Name</label>
              <input
                className="form-control"
                id="location"
                type="text"
                placeholder="Location"
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>}
            <div className="form-group named">

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
                  onChange={e => setTransportMode(e.target.value)}
                />
                <label htmlFor="car">Car</label>
              </div>
              <div>
                <input
                  id="walking"
                  type="radio"
                  name="transport"
                  value="pedestrian"
                  onChange={e => setTransportMode(e.target.value)}
                />
                <label htmlFor="walking">Walking</label>
              </div>
              <div>
                <input
                  id="bicycle"
                  type="radio"
                  name="transport"
                  value="bicycle"
                  onChange={e => setTransportMode(e.target.value)}
                />
                <label htmlFor="bicycle">Cycle</label>
              </div>
            </div>
            <div className="form-group submit">
              <button
                className="submit-button"
                type="button"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
            {destinationWeather && (
              <div className="weather-card">
                <div className="weather-card__content">
                  <div className="weather-card__info">
                    <h2 className="weather-card__title">
                      Weather at Destination
                    </h2>
                    <p className="weather-card__location">
                      Location: {destinationWeather.location.name}
                    </p>
                    <p className="weather-card__temperature">
                      Temperature: {destinationWeather.current.temp_c}°C
                    </p>
                    <p className="weather-card__condition">
                      Condition: {destinationWeather.current.condition.text}
                    </p>
                  </div>
                  <div className="weather-card__image">
                    <img src={weatherImage} alt="Weather Icon" />
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      <div className="requiredPoint-list-container">
        <p className="logo-text">20 minute finds!</p>
        {!loading ? (
          <ol className="requiredPoint-list">
            {filteredrequiredPoints.map((requiredPoint, index) => (
              <Card
                key={index}
                name={requiredPoint.title}
                address={requiredPoint.address.label}
                distance={requiredPoint.distance}
                lat={requiredPoint.position.lat}
                long={requiredPoint.position.lng}
              />
            ))}
          </ol>
        ) : (
          "Loading..."
        )}
      </div>
      <br></br>
      <div className="mapImg">
        {Object.keys(originCoordinates).length !== 0 && (
          <button className="submit-button mapbtn" onClick={handleMap}>
            Open Map
          </button>
        )}
        {isMapShown && !loading && (
          <MapDisplay className="map" initial={originCoordinates} coordinates={filteredrequiredPoints} />
        )}
      </div>


    </div>
  );
};

export default UserForm;
