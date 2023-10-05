import { weatherCode } from "./data.js";

const statusMsg = document.querySelector(".error");

class Forecast {
  constructor() {
    this.coords = {}; // Initialize coords object
    //Load location from localStorage
    this.locationName = localStorage.getItem("selectedLocation");

    //If it isn't in localStorage, try to get it  from geolocation
    if (!this.locationName) {
      this.getLocation()
        .then((locationName) => {
          this.locationName = locationName;
          this.init(); //Call the init after setting locationName
        })
        //Handle error getting locationName
        .catch((error) => (statusMsg.textContent = error.message));
    } else {
      this.init(); //Call init if locationName is already available
    }
  }

  async init() {
    try {
      await this.getWeather();
      if (!this.weatherData)
        throw new Error(`Could not get the data for ${this.locationName}`);
      await this.getCorrectTime();
      this.getCorrectHour(); // Get the correct hour first
      this.renderCurrentWeather(this.localHour); // Then render the weather data
      this.renderHourlyWeather();
      this.renderDailyWeather();
    } catch (err) {
      statusMsg.textContent = err.message;
    }
  }
  async getLocation() {
    return new Promise((resolve, reject) => {
      const success = async (position) => {
        try {
          const { latitude: lat, longitude: lon } = position.coords;

          //getting the name of the location
          const response = await fetch(
            `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`
          );
          const data = await response.json();
          const locationName = data.address.city;

          resolve(locationName);
        } catch (err) {
          reject(err);
        }
      };

      const error = (e) => {
        statusMsg.textContent = e.message;
        statusMsg.textContent ??= "Unable to retrieve your location.";
        reject(e);
      };

      // Checking if the geolocation api works
      if (!navigator.geolocation) {
        statusMsg.textContent = "Geolocation is not supported by your browser.";
      } else {
        statusMsg.textContent = "Locating...";
        navigator.geolocation.getCurrentPosition(success, error);
      }
    });
  }

  async getWeather() {
    statusMsg.textContent = "Getting coords...";
    try {
      const coordsResponse = await fetch(
        `https://geocode.maps.co/search?q=${this.locationName}`
      );

      if (!coordsResponse.ok) {
        throw new Error(
          `Failed to fetch location coordinates (HTTP ${coordsResponse.status})`
        );
      }

      const coordsData = await coordsResponse.json();

      console.log(coordsData.length);
      if (!coordsData.length) {
        throw new Error("Wrong location name.");
      }

      //getting the full name of the location
      this.locationName = coordsData[0].display_name;

      statusMsg.textContent = "Getting weather data...";
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coordsData[0].lat}&longitude=${coordsData[0].lon}&hourly=temperature_2m,apparent_temperature,precipitation_probability,weathercode,pressure_msl,surface_pressure,cloudcover,visibility,evapotranspiration,windspeed_10m,windspeed_80m,winddirection_10m,winddirection_80m,uv_index,uv_index_clear_sky,is_day&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_hours,precipitation_probability_max,windspeed_10m_max,windgusts_10m_max,winddirection_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&current_weather=true&timezone=auto&forecast_days=14&models=best_match`
      );

      if (!weatherResponse.ok) {
        throw new Error(
          `Failed to fetch weather data (HTTP ${weatherResponse.status})`
        );
      }

      this.weatherData = await weatherResponse.json();

      statusMsg.classList.add("hidden");
    } catch (error) {
      statusMsg.textContent = `Error: ${error.message}`;
    } finally {
      localStorage.clear();
    }
  }

  renderCurrentWeather(localHour) {
    const weatherObj = weatherCode.get(
      this.weatherData.hourly.weathercode[localHour]
    );
    const fields = [
      "temperature_2m",
      "windspeed_10m",
      "winddirection_10m",
      "apparent_temperature",
      "cloudcover",
      "precipitation_probability",
      "surface_pressure",
      "uv_index",
      "visibility",
    ];
    fields.forEach((field) => {
      document.getElementById(field).textContent =
        this.weatherData.hourly[field][localHour] +
        this.weatherData.hourly_units[field];
    });

    document.getElementById("weather").textContent = weatherObj.weather;

    document.getElementById("location").textContent = this.locationName;

    // displaying the time
    this.displayTime();
    setInterval(() => this.displayTime(), 1000);

    // setInterval(this.displayTime, 1000);

    document.getElementById("weather-icon").innerHTML = `<img
      src="/Pictures/flaticon/png/${
        this.weatherData.hourly.is_day[localHour]
          ? weatherObj.iconDay
          : weatherObj.iconNight || weatherObj.iconDay
      }-color.png" alt = "Weather Icon"
    />`;

    document
      .querySelector(".current-weather")
      .closest("section")
      .classList.remove("hidden");
  }

  renderDailyWeather() {
    const container = document.querySelector(".daily-weather");
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const data = this.weatherData.daily;

    data.time.forEach((dateString, i) => {
      const date = new Date(dateString);

      let day =
        i === 0 ? "Today" : i === 1 ? "Tomorrow" : weekdays[date.getDay()];
      if (i > 6) day = "Next " + day;

      const html = `
      <div class="card-side flex">
        <p class="date"> ${day}</p>
        <div class="flex">
        <p class="temperature">${data.temperature_2m_min[i]} - ${
        data.temperature_2m_max[i]
      } °C</p>
          <div class="weather-icon">
            <img  src ='/Pictures/flaticon/png/${
              weatherCode.get(data.weathercode[i]).iconDay
            }-color.png'>
          </div>
        </div>
        <p class = "weather">${weatherCode.get(data.weathercode[i]).weather}</p>
      </div>`;
      container.innerHTML += html;
    });
    container.closest("section").classList.remove("hidden");
    // adding the scroll on button functionality

    this.applyScroll(container, "daily");
  }

  renderHourlyWeather() {
    const container = document.querySelector(".hourly-weather");
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const data = this.weatherData.hourly;
    data.time.slice(this.localHour, 5 * 24).forEach((dateString, i, all) => {
      const date = new Date(dateString);
      const hour = String(date.getHours()).padStart(2, "0") + ":00";
      let day = weekdays[new Date(dateString).getDay()];

      if (i > all.length / 2 - 1) day = "Next " + day;
      const weatherObj = weatherCode.get(data.weathercode[i]);
      const isDay = data.is_day[date.getHours()];
      const icon = isDay
        ? weatherObj.iconDay
        : weatherObj.iconNight || weatherObj.iconDay;

      const html = `
      <div class="card-side flex">
        <p class="date"> ${day}<br/>${hour}</p>
        <div class="flex">
        <p class="temperature">${data.temperature_2m[i]}
       °C</p>
          <div class="weather-icon">
            <img  src ='/Pictures/flaticon/png/${icon}-color.png'>
          </div>
        </div>
        <p class = "weather">${weatherObj.weather}</p>
      </div>`;
      container.innerHTML += html;
    });

    container.closest("section").classList.remove("hidden");
    this.applyScroll(container, "hourly");
  }

  applyScroll(container, sectionType) {
    const cardsGap = Number(
      window.getComputedStyle(container).getPropertyValue("gap").slice(0, -2)
    );
    const cardWidth = container
      .querySelector(".card-side")
      .getBoundingClientRect().width;
    const containerLength = Math.floor(container.getBoundingClientRect().width);

    const scrollDistance =
      containerLength - (containerLength % (cardsGap + cardWidth));

    document
      .querySelector(`.btn-left-${sectionType}`)
      .addEventListener("click", () => {
        this.animateScrollContent(
          container.scrollLeft - scrollDistance,
          200,
          container
        );
      });
    document
      .querySelector(`.btn-right-${sectionType}`)
      .addEventListener("click", () => {
        this.animateScrollContent(
          container.scrollLeft + scrollDistance,
          200,
          container
        );
      });
  }

  animateScrollContent(targetScroll, duration, scrollableContent) {
    // targetScroll - the target scroll position (e.g., 500 pixels)
    // duration - the duration of the scroll animation (in milliseconds)

    // Calculate the current scroll position

    console.log(scrollableContent.scrollLeft);

    const currentScroll = scrollableContent.scrollLeft;

    // Calculate the distance to scroll
    const distance = targetScroll - currentScroll;

    // Record the start time of the animation
    const startTime = performance.now();

    // Animate the scroll
    const animateScroll = (currentTime) => {
      const elapsedTime = currentTime - startTime;

      // Use easeInOutQuad easing function for smooth animation
      const easedScroll = easeInOutQuad(
        elapsedTime,
        currentScroll,
        distance,
        duration
      );

      scrollableContent.scrollLeft = easedScroll;

      if (elapsedTime < duration) {
        requestAnimationFrame(animateScroll);
      }
    };

    // Easing function for smooth animation
    const easeInOutQuad = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    // Start the animation
    requestAnimationFrame(animateScroll);
  }

  async getCorrectTime() {
    try {
      const locationTimeZone = await this.weatherData.timezone;
      const options = {
        timeZone: locationTimeZone,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      };

      this.localTime = new Date().toLocaleString("en-US", options);
    } catch (error) {
      statusMsg.textContent = `Error: ${error.message}`;
    }
  }

  getCorrectHour() {
    let hour = Number(this.localTime.slice(-11, -9));
    if (this.localTime.endsWith("PM")) {
      hour += 12;
    }
    if (this.localTime.endsWith("AM") && hour === 12) {
      hour = 0;
    }
    this.localHour = hour;
  }

  displayTime() {
    this.getCorrectTime();
    this.getCorrectHour();
    const localHour = this.localTime;
    document.getElementById("time").textContent = `${
      localHour.split(",")[0]
    } ${localHour.slice(-11)}`;
  }
}

export default Forecast;
