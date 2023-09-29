import React from "react";

function Card({ name, address, distance, lat, long }) {
  const googleMapsLink = `https://www.google.com/maps/place/${lat},${long}`
  return (
    <div className="w-[20rem] h-[18rem] rounded overflow-hidden shadow-lg">
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{name}</div>
        <p className="text-gray-700 text-base">
          <strong>Address: </strong>{address}
        </p>
        <p className="text-gray-700 text-base">
          <strong>Distance: </strong>{distance / 1000} km
        </p>
        <a href={googleMapsLink} className="text-blue-700">Google Maps Link</a>
      </div>
    </div>
  );
}

export default Card;
