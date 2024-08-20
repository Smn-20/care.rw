import axios from 'axios';

const BASE_URL = "https://places.googleapis.com/v1/places:searchNearby"

export const API_KEY = "AIzaSyBJzI5WqtYu0LO2IGklY1u1hmd6ramZjAc"

const config = {
    headers:{
        "Content-Type":"application/json",
        "X-Goog-Api-Key":API_KEY,
        "X-Goog-FieldMask":['places.displayName','places.formattedAddress','places.location']
    }
}

const getPlaces = (data) => axios.post(BASE_URL,data,config);

export default {getPlaces};