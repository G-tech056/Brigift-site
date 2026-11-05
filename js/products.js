const WHATSAPP_NUMBER = "254183562384";

const productGrid = document.getElementById("product-grid");
const lastUpdated = document.getElementById("last-updated");
const productsById = {};

const filterBar = document.querySelector(".filter-bar");
const resultCount = document.getElementById("result-count");
let allProducts = [];

const categoryInfo = {
  lpg: { label: "LPG Cylinders", icon: "🔥" },
  accessories: { label: "Gas Accessories", icon: "🔧" },
  electrical: { label: "Electrical", icon: "💡" },
};
const validCategories = ["all",...Object.keys(categoryInfo)]

const priceLabels = {
  refill: "Refill price",
  exchange: "Exchange price",
  new: "New cylinder price",
  standard: "Price",
};

const optionNames = { refill: "Refill", exchange: "Exchange", new: "New" };

function formatPrice(price) {
  if (price === null) return "Call for price";
  return "KSh " + price.toLocaleString("en-KE");
}

function getOptions(product) {
  return Object.entries(product.prices)
    .filter(([, price]) => price !== null)
    .map(([key, price]) => ({ key, price }));
}

function whatsappLink(product, optionKey) {
  const price = optionKey ? product.prices[optionKey] : null;
  const priceText = price !== null && price !== undefined ? ` (${formatPrice(price)})` : "";

  const messages = {
    refill: `Hello BRIGIFT, I'd like a gas refill: ${product.name}${priceText}`,
    exchange: `Hello BRIGIFT, I'd like to exchange my empty cylinder for a full one: ${product.name}${priceText}`,
    new: `Hello BRIGIFT, I'd like to buy a new cylinder: ${product.name}${priceText}`,
  };
  const message = messages[optionKey] || `Hello BRIGIFT, I'd like to order: ${product.name}`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function createCard(product) {
  const info = categoryInfo[product.category];
  const options = getOptions(product);
  const selected = options[0];

  const hasPhoto = Boolean(product.image);
  const media = hasPhoto
    ? `<img src="${product.image}" alt="${product.name}" width="600" height="450" loading="lazy" />`
    : `<span aria-hidden="true">${info.icon}</span>`;

  const selector =
    options.length > 1
      ? `<div class="option-group" role="group" aria-label="Choose how you want it">
          ${options
            .map(
              (o) => `<button type="button" class="option-btn${o.key === selected.key ? " is-active" : ""}"
                data-option="${o.key}" aria-pressed="${o.key === selected.key}">${optionNames[o.key]}</button>`
            )
            .join("")}
        </div>`
      : "";

  const priceHtml = selected
    ? `<p class="product-price">
         <span class="price-label">${priceLabels[selected.key]}</span>
         <span class="price-amount">${formatPrice(selected.price)}</span>
       </p>`
    : `<p class="product-price is-call">Call for price</p>`;

  return `
    <article class="product-card" data-id="${product.id}">
      <div class="product-image${hasPhoto ? " has-photo" : ""}">${media}</div>
      <div class="product-body">
        <p class="product-category">${info.label}</p>
        <h3>${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="price-area">
          ${selector}
          ${priceHtml}
        </div>
        <a href="${whatsappLink(product, selected ? selected.key : null)}"
           class="btn btn--primary order-link" target="_blank" rel="noopener">
          Order on WhatsApp
        </a>
      </div>
    </article>
  `;
}

function selectOption(card, product, optionKey) {
  card.querySelector(".price-label").textContent = priceLabels[optionKey];
  card.querySelector(".price-amount").textContent = formatPrice(product.prices[optionKey]);
  card.querySelector(".order-link").href = whatsappLink(product, optionKey);

  card.querySelectorAll(".option-btn").forEach((button) => {
    const active = button.dataset.option === optionKey;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active);
  });
}

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".option-btn");
  if (!button) return;

  const card = button.closest(".product-card");
  selectOption(card, productsById[card.dataset.id], button.dataset.option);
});

function getCategoryFromUrl() {
  const category = new URLSearchParams(window.location.search).get("category");
  return validCategories.includes(category) ? category : "all";
}

function renderProducts(category) {
  const list =
    category === "all" ? allProducts : allProducts.filter((p) => p.category === category);

  productGrid.innerHTML = list.length
    ? list.map(createCard).join("")
    : '<p class="products-error">No products in this category yet.</p>';

  resultCount.textContent = `Showing ${list.length} ${list.length === 1 ? "product" : "products"}`;

  filterBar.querySelectorAll(".filter-btn").forEach((button) => {
    const active = button.dataset.category === category;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active);
  });
}

filterBar.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-btn");
  if (!button) return;

  const category = button.dataset.category;
  renderProducts(category);

  const url = new URL(window.location);
  if (category === "all") {
    url.searchParams.delete("category");
  } else {
    url.searchParams.set("category", category);
  }
  history.replaceState(null, "", url);
});

async function loadProducts() {
  try {
    const response = await fetch("data/products.json");
    if (!response.ok) throw new Error("Could not load products.json");

    const data = await response.json();
    data.products.forEach((product) => (productsById[product.id] = product));
    lastUpdated.textContent = data.lastUpdated;
     allProducts = data.products;
    renderProducts(getCategoryFromUrl());
  } catch (error) {
    console.error(error);
    productGrid.innerHTML =
      '<p class="products-error">Sorry, we could not load the products. Please call us on 0183562384.</p>';
  }
}

loadProducts();