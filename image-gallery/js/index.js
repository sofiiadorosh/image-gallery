const BASE_URL = "https://api.unsplash.com/search/photos";
const ACCESS_KEY = "oWb4niCWMIL8tscfNUbxNi6wnTDiAwUn4wKyxeUOcL4";

class ImagesApiService {
  constructor() {
    this._query = "";
    this.page = 1;
  }

  async getImages() {
    const URL = `${BASE_URL}?query=${this.query}&page=${this.page}&per_page=10&orientation=landscape&client_id=${ACCESS_KEY}`;
    try {
      const response = await fetch(URL);
      if (!response.ok) {
        throw new Error(response.status);
      }
      const { total, results } = await response.json();
      this.incrementPage();
      return { total, results };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this._query;
  }

  set query(query) {
    this._query = query;
  }
}

const refs = {
  form: document.querySelector("#form"),
  gallery: document.querySelector("#gallery"),
  guard: document.querySelector("#guard"),
};

const options = {
  root: null,
  rootMargin: "300px",
  threshold: 1.0,
};

let imagesLength = 10;
let isFetching = false;

const imagesApiService = new ImagesApiService();

const observer = new IntersectionObserver(onInfiniteScroll, options);

function onInfiniteScroll(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !isFetching) {
      getImages();
    }
  });
}

refs.form.addEventListener("submit", onSearchHandler);

function onSearchHandler(e) {
  e.preventDefault();

  imagesApiService.query = e.currentTarget.elements.query.value;

  if (!imagesApiService.query) {
    return "Search box cannot be empty. Please enter the word.";
  }

  imagesApiService.resetPage();
  clearGallery();
  getImages();
  observer.observe(refs.guard);

  refs.form.reset();
}

function getImages() {
  isFetching = true;
  imagesApiService.getImages().then(({ total, results }) => {
    if (imagesLength > total) {
      observer.unobserve(refs.guard);
      return "We're sorry, but you've reached the end of search results.";
    } else if (!results.length) {
      return "Sorry, there are no images matching your search query. Please try again.";
    } else {
      renderImagesCards(results);

      imagesLength += results.length;
      isFetching = false;
    }
  });
}

function renderImagesCards(images) {
  const markup = images
    .map(
      ({ alt_description, urls, user }) =>
        `<li class="gallery__item">
          <img src="${urls.regular}" alt="${alt_description}" class="gallery__pic">
          <div class="gallery__overlay">
            <div class="gallery__artist">
              <img src="${user.profile_image.medium}" alt="${user.name}" class="artist__pic">
              <span class="artist__name">${user.name}</span>
            </div>
          </div>
        </li>`
    )
    .join("");

  refs.gallery.insertAdjacentHTML("beforeend", markup);
}

function clearGallery() {
  refs.gallery.innerHTML = "";
}
