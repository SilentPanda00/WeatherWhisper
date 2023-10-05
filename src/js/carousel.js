class Carousel {
  constructor() {
    this.slides = [];
    this.btnLeft = document.querySelector(".slider__btn--left");
    this.btnRight = document.querySelector(".slider__btn--right");
    this.dotContainer = document.querySelector(".dots");
    this.carousel = document.querySelector(".carousel");
    this.curSlide = 0;
    this.totalSlides = this.slides.length;
    this.elemPerSlide = this.getCardsPerSlide();

    // Initialize the slider
    this.init();
  }

  setInitialClasses() {
    this.slides[this.totalSlides - 1].classList.add("prev");
    this.slides[0].classList.add("active");
    this.slides[1].classList.add("next");
  }

  createDots() {
    this.slides.forEach((_, i) => {
      this.dotContainer.insertAdjacentHTML(
        "beforeend",
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  }

  activateDot(slide) {
    document
      .querySelectorAll(".dots__dot")
      .forEach((dot) => dot.classList.remove("dots__dot--active"));

    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add("dots__dot--active");
  }

  goToSlide(slide) {
    this.curSlide = slide;
    let newPrevious = slide - 1;
    let newNext = slide + 1;
    let oldPrevious = slide - 2;
    let oldNext = slide + 2;

    // Test if carousel has more than three items
    if (this.totalSlides - 1 > 3) {
      if (newPrevious <= 0) {
        oldPrevious = this.totalSlides - 1;
      } else if (newNext >= this.totalSlides - 1) {
        oldNext = 0;
      }
    }

    // Checks and updates if slide is at the beginning/end
    if (slide === 0) {
      newPrevious = this.totalSlides - 1;
      oldPrevious = this.totalSlides - 2;
      oldNext = slide + 2;
    } else if (slide === this.totalSlides - 1) {
      newPrevious = slide - 1;
      newNext = 0;
      oldNext = 1;
    }

    // Now we've worked out where we are and where we're going,
    // by adding/removing classes we'll trigger the transitions.
    // Reset old next/prev elements to default classes
    this.slides[oldPrevious].className = "slide";
    this.slides[oldNext].className = "slide";
    // Add new classes
    this.slides[newPrevious].className = "slide" + " prev";
    this.slides[slide].className = "slide" + " active";
    this.slides[newNext].className = "slide" + " next";
  }

  nextSlide() {
    if (this.curSlide === this.totalSlides - 1) {
      this.curSlide = 0;
    } else {
      this.curSlide++;
    }
    this.goToSlide(this.curSlide);
    this.activateDot(this.curSlide);
  }

  prevSlide() {
    if (this.curSlide === 0) {
      this.curSlide = this.totalSlides - 1;
    } else {
      this.curSlide--;
    }
    this.goToSlide(this.curSlide);
    this.activateDot(this.curSlide);
  }

  getCardsPerSlide() {
    const maxWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
    switch (true) {
      case maxWidth <= 860:
        return 1;
      case maxWidth <= 1280:
        return 2;
      case maxWidth <= 1560:
        return 3;
    }
    return 3;
  }

  init() {
    this.slides = [...document.querySelectorAll(".slide")];
    this.elemPerSlide = this.getCardsPerSlide();
    if (this.elemPerSlide === 1) {
      this.slides = this.slides.slice(1);
      this.totalSlides -= 1;
    }
    this.setInitialClasses();
    this.createDots();
    this.activateDot(0);

    // navigation event listeners
    //on buttons
    this.btnRight.addEventListener("click", () => this.nextSlide());
    this.btnLeft.addEventListener("click", () => this.prevSlide());

    //on swiped
    this.carousel.addEventListener("swiped-left", () => this.nextSlide());
    this.carousel.addEventListener("swiped-right", () => this.prevSlide());

    //using arrow keys
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.prevSlide();
      if (e.key === "ArrowRight") this.nextSlide();
    });
  }
}

export default Carousel;

// Create an instance of the Slider class
// const slider = new Slider();
