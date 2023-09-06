const BASE_URL = "https://api.unsplash.com/search/photos";
const ACCESS_KEY = "oWb4niCWMIL8tscfNUbxNi6wnTDiAwUn4wKyxeUOcL4";

class ImagesApiService {
  constructor() {
    this._query = "";
    this.page = 1;
  }

  async getImages() {
    const URL = `${BASE_URL}?query=${this.query}&page=${this.page}&per_page=40&orientation=landscape&client_id=${ACCESS_KEY}`;
    try {
      const response = await fetch(URL);
      if (!response.ok) {
        throw new Error(response.status);
      }
      const { total, results } = await response.json();
      return { total, results };
    } catch (error) {
      throw new Error(error.message);
    }
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

const overlay = document.querySelector(".backdrop");
const modal = document.querySelector(".modal");
const button = document.querySelector(".modal__button");

const imagesApiService = new ImagesApiService();

imagesApiService.query = "cat";
getImages();

refs.form.addEventListener("submit", onSearchHandler);
refs.gallery.addEventListener("click", onShowPicture);
button.addEventListener("click", onModalWindowClose);
overlay.addEventListener("click", onBackdropClick);

function onSearchHandler(e) {
  e.preventDefault();

  imagesApiService.query = e.currentTarget.elements.query.value;

  if (!imagesApiService.query) {
    return "Search box cannot be empty. Please enter the word.";
  }

  imagesApiService.resetPage();
  clearGallery();
  getImages();

  refs.form.reset();
}

function onShowPicture(e) {
  if (!e.target.closest("li")) {
    return;
  } else if (e.target.closest("li")) {
    const picture = document.querySelector(".modal__picture");
    if (picture) {
      picture.remove();
    }
    const src = e.target.closest("li").dataset.picture;
    modal.insertAdjacentHTML(
      "beforeend",
      `<img src="${src}" alt="" class="modal__picture">`
    );
    document.body.style.overflow = "hidden";
    overlay.classList.remove("is-hidden");
    document.addEventListener("keydown", onEscClose);
  }
}

function onModalWindowClose() {
  overlay.classList.add("is-hidden");
  document.body.style.overflow = "visible";
}

function onBackdropClick(e) {
  if (e.currentTarget === e.target) {
    onModalWindowClose();
  }
}

function onEscClose(e) {
  if (e.code === "Escape") {
    document.removeEventListener("keydown", onEscClose);
    onModalWindowClose();
  }
}

function getImages() {
  imagesApiService.getImages().then(({ results }) => {
    if (!results.length) {
      refs.gallery.innerHTML =
        "<li>Sorry, there are no images matching your search query. Please try again.</li>";
    } else {
      renderImagesCards(results);
    }
  });
}

function renderImagesCards(images) {
  const markup = images
    .map(
      ({ alt_description, urls, user }) =>
        `<li class="gallery__item" data-picture="${urls.full}">
          <img src="${urls.regular}" alt="${alt_description}" loading="lazy" class="gallery__pic">
          <div class="gallery__overlay">
            <div class="gallery__artist">
              <img src="${user.profile_image.medium}" alt="${user.name}" class="artist__pic">
              <span class="artist__name">${user.name}</span>
            </div>
          </div>
        </li>`
    )
    .join("");

  refs.gallery.innerHTML = markup;
}

function clearGallery() {
  refs.gallery.innerHTML = "";
}
