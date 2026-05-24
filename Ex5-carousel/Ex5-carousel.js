let slideIndex = 1;
let isAnimating = false;

showFirstSlide();

function plusSlides(n) {
  if (isAnimating) return;

  const oldIndex = slideIndex;
  const newIndex = getValidIndex(slideIndex + n);

  if (newIndex === oldIndex) return;

  const direction = n > 0 ? "next" : "prev";

  changeSlide(oldIndex, newIndex, direction);
}

function currentSlide(n) {
  if (isAnimating) return;
  if (n === slideIndex) return;

  const oldIndex = slideIndex;
  const newIndex = n;

  const direction = newIndex > oldIndex ? "next" : "prev";

  changeSlide(oldIndex, newIndex, direction);
}

function getValidIndex(n) {
  const slides = document.getElementsByClassName("mySlides");

  if (n > slides.length) {
    return 1;
  }

  if (n < 1) {
    return slides.length;
  }

  return n;
}

function showFirstSlide() {
  const slides = document.getElementsByClassName("mySlides");
  const dots = document.getElementsByClassName("dot");
  const container = document.querySelector(".slideshow-container");

  for (let i = 0; i < slides.length; i++) {
    slides[i].className = "mySlides";
    slides[i].style.display = "none";
  }

  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active");
  }

  slides[slideIndex - 1].style.display = "block";
  slides[slideIndex - 1].classList.add("active-slide");
  dots[slideIndex - 1].classList.add("active");

  if (container) {
    container.style.height = slides[slideIndex - 1].offsetHeight + "px";
  }
}

function changeSlide(oldIndex, newIndex, direction) {
  const slides = document.getElementsByClassName("mySlides");
  const dots = document.getElementsByClassName("dot");
  const container = document.querySelector(".slideshow-container");

  const oldSlide = slides[oldIndex - 1];
  const newSlide = slides[newIndex - 1];

  isAnimating = true;

  if (container) {
    container.style.height = oldSlide.offsetHeight + "px";
  }

  oldSlide.className = "mySlides animating-slide";
  newSlide.className = "mySlides animating-slide";
  oldSlide.style.display = "block";
  newSlide.style.display = "block";

  // Force a reflow so the browser registers the state before animation starts.
  void newSlide.offsetWidth;

  if (direction === "next") {
    oldSlide.classList.add("slide-out-to-left");
    newSlide.classList.add("slide-in-from-right");
  } else {
    oldSlide.classList.add("slide-out-to-right");
    newSlide.classList.add("slide-in-from-left");
  }

  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active");
  }

  dots[newIndex - 1].classList.add("active");
    
  oldSlide.addEventListener(
    "animationend",
    function () {
      oldSlide.className = "mySlides";
      oldSlide.style.display = "none";

      newSlide.className = "mySlides active-slide";
      newSlide.style.display = "block";

      if (container) {
        container.style.height = newSlide.offsetHeight + "px";
      }

      slideIndex = newIndex;
      isAnimating = false;
    },
    { once: true }
  );
}