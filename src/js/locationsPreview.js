import { weatherCode, locations } from './data.js';

class LocationsPreview {
  constructor() {
    this.init();
  }
  async getWeatherDataForCarousel() {
    const coordsPr = [];
    const weatherPr = [];
    locations.forEach(location => {
      coordsPr.push(
        fetch(`https://geocode.maps.co/search?q={${location}}`).then(response =>
          response.json()
        )
      );
    });
    const coords = await Promise.all(coordsPr);
    this.coords = coords;
    coords.forEach(coord => {
      weatherPr.push(
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coord[0].lat}&longitude=${coord[0].lon}&hourly=temperature_2m,weathercode&current_weather=true&timeformat=unixtime&timezone=auto&models=best_match&forecast_days=0`
        ).then(response => response.json())
      );
    });
    this.weatherData = await Promise.all(weatherPr);
  }

  renderlocationsCards() {
    locations.forEach((location, i) => {
      this.renderCard(this.weatherData[i], this.coords[i][0]);
    });
  }

  renderCard(data, coord) {
    const weatherObj = weatherCode.get(data.current_weather.weathercode);
    let html;
    html = `
                <div class="card-side ${localStorage.getItem('theme')}">
                  <p class="location"><i class="fa-solid fa-location-dot"></i> ${
                    coord.display_name.split(',')[0]
                  }</p>
                  <div>
                    <div class="weather-icon">
                      <img  src ='./src/Pictures/flaticon/png/${
                        data.current_weather.is_day
                          ? weatherObj.iconDay
                          : weatherObj.iconNight || weatherObj.iconDay
                      }-color.png'>
                    </div>
                    <p class="temperature">${Math.round(
                      data.current_weather.temperature
                    )} °C</p>
                  </div>
                  <p class = "weather">${
                    weatherCode.get(data.current_weather.weathercode).weather
                  }</p>
                </div>`;
    document.querySelector('.locations-container').innerHTML += html;
  }

  //overriding init()
  async init() {
    await this.getWeatherDataForCarousel();
    this.renderlocationsCards();
  }
}

export default LocationsPreview;
