import requests
import json
from datetime import datetime, timedelta

# Define your API keys and URLs
api_key = "JyqRuKA9_ZnHZwzbbDDTALLegqB-w4bI40054gV112c"
get_coordinates_url = "https://geocode.search.hereapi.com/v1/geocode"
poi_url = "https://discover.search.hereapi.com/v1/discover"
find_eta_url = "https://router.hereapi.com/v8/routes"

# Step 1: Get Coordinates
origin_query = "BITS Pilani, Hyderabad"
destination_query = "Bits Pilani Hyderabad Campus, CRPF, Secunderabad, Telangana, India"

origin_response = requests.get(
    get_coordinates_url,
    params={"q": origin_query, "apiKey": api_key}
)


destination_response = requests.get(
    get_coordinates_url,
    params={"q": destination_query, "apiKey": api_key}
)

origin_coordinates = origin_response.json()["items"][0]["position"]
destination_coordinates = destination_response.json()["items"][0]["position"]

# Step 2: Search for Restaurants (POI)
poi_response = requests.get(
    poi_url,
    params={
        "at": f"{destination_coordinates['lat']},{destination_coordinates['lng']}",
        "limit": 20,
        "lang": "en",
        "q": "gas station",
        "apiKey": api_key
    }
)

restaurants = poi_response.json()["items"]
# Step 4: Find ETA for Restaurants
filtered_restaurants = []

for restaurant in restaurants:
    restaurant_coordinates = restaurant["position"]
    origin_lat = origin_coordinates["lat"]
    origin_lng = origin_coordinates["lng"]
    restaurant_lat = restaurant_coordinates["lat"]
    restaurant_lng = restaurant_coordinates["lng"]

    # Calculate ETA from origin to restaurant
    eta_response = requests.get(
        find_eta_url,
        params={
            "apiKey": api_key,
            "origin": f"{origin_lat},{origin_lng}",
            "destination": f"{restaurant_lat},{restaurant_lng}",
            "transportMode": "car"
        }
    )
    arrival_time_string = eta_response.json()["routes"][0]["sections"][0]["arrival"]["time"] 
    arrival_time = datetime.strptime(arrival_time_string, "%Y-%m-%dT%H:%M:%S%z")
    departure_time_string = eta_response.json()["routes"][0]["sections"][0]["departure"]["time"]
    departure_time = datetime.strptime(departure_time_string, "%Y-%m-%dT%H:%M:%S%z")
    time_difference = arrival_time - departure_time

    # Check if travel time is within 20 minutes (1200 seconds)
    if time_difference < timedelta(minutes=20):
        filtered_restaurants.append(restaurant)

# Step 5: Print or use filtered_restaurants as needed
for restaurant in filtered_restaurants:
    print("restaurant name: ", restaurant["title"])
