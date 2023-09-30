import React, { useEffect, useState } from "react";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import osm from "./osm-providers";
import { useRef } from "react";
import "leaflet/dist/leaflet.css";
import { Popup } from "leaflet";
import L from "leaflet";
L.Icon.Default.imagePath='images/'

const MapDisplay = ({ markers }) => {
  const [center, setCenter] = useState({ lat: 17.5449, lng: 78.5718 });
  const ZOOM_LEVEL = 12;
  const mapRef = useRef();

  return (
    <>
      <div className="row">
        <div className="col text-center">
          <div className="col">
            <MapContainer center={center} zoom={ZOOM_LEVEL} ref={mapRef} style={{width: "60vw", height: "60vh"}}>
              <TileLayer
                url={osm.maptiler.url}
                attribution={osm.maptiler.attribution}
              />
              {markers.forEach((marker, idx) => {
                <Marker key={idx} position={[17.5449, 78.5718]}>
                  <Popup><span>A pretty CSS3 popup. <br/> Easily customizable.</span></Popup>
                </Marker>
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapDisplay;
