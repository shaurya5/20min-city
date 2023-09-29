import axios from "axios"

const API_KEY = process.env.REACT_APP_API_KEY

export const getCoordinates = async (location) => {
  const data = await axios.get(`https://geocode.search.hereapi.com/v1/geocode?q=${location}&apiKey=${API_KEY}`)
  return data.data.items[0].position
}

export const getPOI = async (coordinates, POI) => {
  const limit = 2;
  const data = await axios.get(`https://discover.search.hereapi.com/v1/discover?at=${coordinates}&q=${POI}&apiKey=${API_KEY}&lang=en&limit=${limit}`)
  return data.data.items[0].position
} 