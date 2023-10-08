'use strict';

import Forecast from './forecast.js';
import LocationsPreview from './locationsPreview.js';

const searchImput = document.querySelector('.search');
const searchBtn = document.querySelector('.searchbutton');
const menuBtn = document.querySelector('.mobile-button');
const closeMenuBtn = document.querySelector('.close-menu-button');
const locationsContainer = document.querySelector('.locations-container');

class WeatherApp {
  constructor() {
    this.selectedLocation = null;

    // Add event listeners
    this.addEventListeners();

    // Check if the current page is "weather.html" and initialize Forecast
    if (window.location.pathname.includes('src/html/weather.html')) {
      window.addEventListener('load', () => {
        this.initForecast();
      });
    }

    // Set CSS variable for viewport height
    this.setVHVariable();
  }

  addEventListeners() {
    // Event listener for window resize
    window.addEventListener('resize', () => {
      this.setVHVariable();
    });

    // Event listener for search button
    searchImput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        this.handleSearch();
      }
    });

    // Event listener for mobile menu button
    menuBtn.addEventListener('click', () => {
      document.querySelector('.mobile').classList.toggle('side');
    });

    // Event listener for closing mobile menu
    closeMenuBtn.addEventListener('click', () => {
      document.querySelector('.mobile').classList.toggle('side');
    });

    // Initialize the WeatherCarousel if the carousel exists on the page
    if (locationsContainer) {
      window.addEventListener('load', () => {
        this.renderLocationsPreview();
      });
      // Event listener for card click (inside the carousel)
      locationsContainer.addEventListener('click', e => {
        if (e.target.closest('.card-side')) {
          this.selectedLocation = e.target
            .closest('.card-side')
            .querySelector('.location').textContent;
          localStorage.setItem('selectedLocation', this.selectedLocation);
          window.location.href = './src/html/weather.html';
        }
      });
    }
  }

  renderLocationsPreview() {
    new LocationsPreview();
  }

  initForecast() {
    // Initialize Forecast here
    const forecast = new Forecast();
    console.log(forecast);
  }

  setVHVariable() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    // if (window.location.pathname.includes("index")) window.location.reload();
  }

  handleSearch() {
    this.selectedLocation = searchImput.value;
    localStorage.setItem('selectedLocation', this.selectedLocation);
    if(window.location.pathname.includes("index.html")) window.location.href = './src/html/weather.html';
    else window.location.href = './weather.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WeatherApp();
});
