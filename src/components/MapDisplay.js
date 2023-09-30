import React, { useState } from "react";

import { MapContainer, TileLayer } from "react-leaflet";
import osm from "./osm-providers";
import { useRef } from "react";
import "leaflet/dist/leaflet.css";

const MapDisplay = () => {
  const [center, setCenter] = useState({ lat: 17.5449, lng: 78.5718 });
  const ZOOM_LEVEL = 9;
  const mapRef = useRef();

  return (
    <>
      <div className="row">
        <div className="col text-center">
          <h2>React-leaflet - Basic Openstreet Maps</h2>
          <p>Loading basic map using layer from maptiler</p>
          <div className="col">
            <MapContainer center={center} zoom={ZOOM_LEVEL} ref={mapRef} style={{width: "1000px", height: "1000px"}}>
              <TileLayer
                url={osm.maptiler.url}
                attribution={osm.maptiler.attribution}
              />
            </MapContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapDisplay;
