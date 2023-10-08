import Carousel from "./carousel.js";
import { weatherCode, locations } from "./data.js";

class WeatherCarousel extends Carousel {
  constructor() {
    super();
  }

  async getWeatherDataForCarousel() {
    const coordsPr = [];
    const carouselDataPr = [];
    locations.forEach((location) => {
      coordsPr.push(
        fetch(`https://geocode.maps.co/search?q={${location}}`).then(
          (response) => response.json()
        )
      );
    });
    const coords = await Promise.all(coordsPr);
    this.coords = coords;
    coords.forEach((coord) => {
      carouselDataPr.push(
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coord[0].lat}&longitude=${coord[0].lon}&hourly=temperature_2m,weathercode&current_weather=true&timeformat=unixtime&timezone=auto&models=best_match&forecast_days=1`
        ).then((response) => response.json())
      );
    });
    this.carouselData = await Promise.all(carouselDataPr);
  }

  async renderCarousel() {
    this.carouselData = this.carouselData.reverse();
    this.coords = this.coords.reverse();
    const noSlides = Math.trunc(this.carouselData.length / this.elemPerSlide);
    for (let i = 1; i <= noSlides; i++) {
      const slide = document.createElement("div");
      slide.classList.add("slide");
      for (
        let j = i * this.elemPerSlide - this.elemPerSlide + 1;
        j <= i * this.elemPerSlide;
        j++
      ) {
        if (this.carouselData[j]) {
          this.createCard(this.carouselData[j], this.coords[j], slide);
        }
      }
      this.carousel.prepend(slide);
    }
  }

  createCard(data, coord, slide) {
    const weatherObj = weatherCode.get(data.current_weather.weathercode);
    let html;
    html = `
                <div class="card">
                  <p class="location"><i class="fa-solid fa-location-dot"></i> ${
                    coord[0].display_name.split(",")[0]
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
    slide.insertAdjacentHTML("afterbegin", html);
  }

  //overriding init()
  async init() {
    await this.getWeatherDataForCarousel();
    this.renderCarousel();
    this.slides = [...document.querySelectorAll(".slide")];
    this.totalSlides = this.slides.length;
    super.init();
  }
}

export default WeatherCarousel;
