const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const axios = require("axios");

const app = express();
const port = process.env.PORT || "8888";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Travel Companion" });
});

// Weather Page
app.get("/weather", async (req, res) => {
  const { city } = req.query;
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  try {
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;
    res.render("weather", { title: "Weather Forecast", weather: weatherData });
  } catch (error) {
    res.status(500).send("Error fetching weather data");
  }
});

// Function to get Amadeus Access Token
async function getAmadeusAccessToken() {
  const authUrl = "https://test.api.amadeus.com/v1/security/oauth2/token";
  const client_id = process.env.AMADEUS_API_KEY;
  const client_secret = process.env.AMADEUS_API_SECRET;

  try {
    const response = await axios.post(authUrl, new URLSearchParams({
      grant_type: "client_credentials",
      client_id,
      client_secret,
    }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting Amadeus access token:", error);
    throw error;
  }
}

// Hotels Page
app.get("/hotels", async (req, res) => {
  const { cityCode } = req.query;

  try {
    const token = await getAmadeusAccessToken();
    const amadeusUrl = `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${cityCode}`;
    
    const hotelsResponse = await axios.get(amadeusUrl, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const hotelsData = hotelsResponse.data.data;
    res.render("hotels", { title: "Hotels in City", hotels: hotelsData });
  } catch (error) {
    res.status(500).send("Error fetching hotels data");
  }
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
