import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'


function MapDisplay({ initial, coordinates }) {
  console.log(coordinates)
  const position = [initial.lat, initial.lng];
  const position1 = {"0": [coordinates[0].position.lat, coordinates[0].position.lng]}
  console.log(position1[0])
  console.log(position)
  return (
    <MapContainer center={position} zoom={13} style={{height: "60vh", width: "60vw"}}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          Current Location
        </Popup>
      </Marker>
      {coordinates.map((coordinate, index) => {
        console.log(coordinate, index)
        const position = [coordinate.position.lat, coordinate.position.lng];
        const hereMapsLink = `https://share.here.com/l/${coordinate.position.lat},${coordinate.position.lng},z=20`;
        return (
          <Marker key={index} position={position}>
            <Popup>
              <a href = {hereMapsLink}>{coordinate.title}</a>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}

export default MapDisplay