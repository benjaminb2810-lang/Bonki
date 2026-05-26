const fallbackData = {
  shop: {
    name: "Bonkis Mercedes Paradies",
    tagline: "Exklusive Siku-Mercedes-Modelle mit Sammlerdrama, Chromfantasie und völlig unvernünftigen Preisen.",
    currency: "EUR"
  },
  effects: {
    heroParticles: 26,
    cardTilt: true,
    scrollReveal: true,
    pricePulse: true,
    spotlightColor: "#f6c84f"
  },
  vehicles: [
    {
      id: "mb-trac-800-gelb",
      name: "Siku MB trac 800 Kipper",
      category: "Gelber Baustellen-Klassiker",
      image: "assets/gelber-siku-mb-trac-800.jpeg",
      price: 84999,
      badge: "Unikat mit Arbeitslaune",
      shortDescription: "Gelber Mercedes MB trac 800 mit kräftigen Reifen, schwarzer Haube und großer Kippmulde. Sieht aus, als würde er jeden Schreibtisch sofort zur Baustelle erklären.",
      specs: ["Massiver Siku-Auftritt", "Kippmulde in Signalgelb", "Rustikaler Sammlercharme"]
    },
    {
      id: "mercedes-transporter-blau",
      name: "Siku Mercedes Transporter Blau",
      category: "Edler Frontlenker mit Chrom",
      image: "assets/blauer-mercedes-transporter.jpeg",
      price: 129999,
      badge: "Showroom-Legende",
      shortDescription: "Blauer Mercedes Modell-Transporter mit glänzender Front, Stern auf der Haube und silberner Ladefläche. Der Blick von vorne ist pure Miniatur-Chefetage.",
      specs: ["Mercedes-Stern doppelt sichtbar", "Glänzende Chromdetails", "Premium-Blau mit Sammlerblick"]
    }
  ]
};

const formatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});

async function loadProducts() {
  try {
    const response = await fetch("products.json", { cache: "no-store" });
    if (!response.ok) throw new Error("JSON konnte nicht geladen werden");
    return await response.json();
  } catch {
    return fallbackData;
  }
}

function createParticles(amount) {
  const stage = document.querySelector(".hero-particles");
  if (!stage) return;

  stage.innerHTML = Array.from({ length: amount }, (_, index) => {
    const left = Math.round(Math.random() * 100);
    const delay = (Math.random() * 8).toFixed(2);
    const duration = (8 + Math.random() * 7).toFixed(2);
    const size = Math.round(5 + Math.random() * 16);
    return `<span style="--left:${left}%;--delay:${delay}s;--duration:${duration}s;--size:${size}px;--drift:${index % 2 ? 1 : -1};"></span>`;
  }).join("");
}

function renderVehicles(data) {
  const grid = document.querySelector("#vehicleGrid");
  const heroTitle = document.querySelector("#shopTitle");
  const heroTagline = document.querySelector("#shopTagline");
  const featuredPrice = document.querySelector("#featuredPrice");

  heroTitle.textContent = data.shop.name;
  heroTagline.textContent = data.shop.tagline;
  featuredPrice.textContent = formatter.format(Math.max(...data.vehicles.map((vehicle) => vehicle.price)));

  grid.innerHTML = data.vehicles.map((vehicle) => `
    <article class="vehicle-card reveal" data-tilt-card>
      <div class="vehicle-media">
        <img src="${vehicle.image}" alt="${vehicle.name}" loading="lazy">
        <span class="vehicle-badge">${vehicle.badge}</span>
      </div>
      <div class="vehicle-content">
        <p class="eyebrow">${vehicle.category}</p>
        <h3>${vehicle.name}</h3>
        <p>${vehicle.shortDescription}</p>
        <ul>
          ${vehicle.specs.map((spec) => `<li>${spec}</li>`).join("")}
        </ul>
        <div class="vehicle-footer">
          <strong class="price">${formatter.format(vehicle.price)}</strong>
          <button type="button">Anfragen</button>
        </div>
      </div>
    </article>
  `).join("");
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  items.forEach((item) => observer.observe(item));
}

function setupTilt() {
  document.querySelectorAll("[data-tilt-card]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;
      card.style.setProperty("--tilt-x", `${y.toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${x.toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  });
}

loadProducts().then((data) => {
  document.documentElement.style.setProperty("--spotlight", data.effects.spotlightColor);
  createParticles(data.effects.heroParticles);
  renderVehicles(data);
  setupReveal();
  if (data.effects.cardTilt) setupTilt();
});
