import React, { useEffect, useState, useMemo } from "react";
import { getCoordinates, getPOI } from "../helpers/data";

const UserForm = () => {
  const [location, setLocation] = useState("");
  const [POI, setPOI] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [fetchCoordinates, setFetchCoordinates] = useState(false);
  
  useEffect(() => {

  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentCoordinates = await getCoordinates(location);
    console.log("New Coordinates:", currentCoordinates);
    setCoordinates(currentCoordinates);
  };

  return (
    <div className="container">
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
        <button
          type="submit"
          className="btn btn-primary"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default UserForm;
