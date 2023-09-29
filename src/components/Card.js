import React from "react";

function Card({ name, address }) {
  return (
    <div className="w-[20rem] h-[18rem] rounded overflow-hidden shadow-lg">
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{name}</div>
        <p className="text-gray-700 text-base">
          {address}
        </p>
      </div>
    </div>
  );
}

export default Card;
