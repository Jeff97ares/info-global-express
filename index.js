const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// 🔐 API Key de OpenWeather
const WEATHER_API_KEY = '6905b56a651ff74fc3929b1ada511d98';

app.get('/info/:country', async (req, res) => {
  const countryName = req.params.country;

  try {
    // 1. Obtener datos del país
    const countryRes = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);
    const country = countryRes.data[0];

    const capital = country.capital?.[0];
    const currency = Object.keys(country.currencies || {})[0];

    if (!capital || !currency) throw new Error("No se encontró capital o moneda del país");

    console.log("Capital:", capital);
    console.log("Moneda:", currency);

    // 2. Obtener clima
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${WEATHER_API_KEY}&units=metric`
    );
    const temperature = weatherRes.data.main.temp;

    // 3. Obtener tipo de cambio
    let exchangeRate;

    if (currency === 'USD') {
      exchangeRate = 1; // Caso especial: USD a USD
    } else {
      const exchangeRes = await axios.get(
        `https://api.exchangerate.host/latest?base=${currency}&symbols=USD`
      );
      exchangeRate = exchangeRes.data.rates?.USD;
      if (!exchangeRate) throw new Error(`No se encontró tipo de cambio para la moneda ${currency}`);
    }

    // 4. Respuesta final
    res.json({
      country: country.name.common,
      capital,
      weather: `${temperature} °C`,
      currency,
      exchangeRateToUSD: exchangeRate
    });

  } catch (error) {
    console.error("ERROR DETECTADO:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
