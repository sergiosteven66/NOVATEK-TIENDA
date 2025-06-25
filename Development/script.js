// Clase principal de la aplicación
class FakeStore {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.cart = [];
    this.categories = [];
    this.init();
 }

  async init() {
    this.loadCartFromStorage();
    this.setupEventListeners();
    await this.loadProducts();
    this.updateCartUI();
  }

  // Configurar event listeners
  setupEventListeners() {
    // Búsqueda
    document.getElementById("searchInput").addEventListener("input", (e) => {
      this.filterProducts();
    });

    // Filtros
    document.getElementById("categoryFilter").addEventListener("change", () => {
      this.filterProducts();
    });

    document.getElementById("sortFilter").addEventListener("change", () => {
      this.sortProducts();
    });
        // Carrito
    document.getElementById("cartBtn").addEventListener("click", () => {
      this.toggleCartModal();
    });

    document.getElementById("closeCart").addEventListener("click", () => {
      this.toggleCartModal();
    });

    document.getElementById("modalOverlay").addEventListener("click", () => {
      this.toggleCartModal();
    });

    document.getElementById("clearCart").addEventListener("click", () => {
      this.clearCart();
    });

    document.getElementById("checkoutBtn").addEventListener("click", () => {
      this.checkout();
    });

    // Cerrar modal con ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
      }
    });
    }

     // Cargar productos desde la API
  async loadProducts() {
    try {
      this.showLoading(true);
      const response = await fetch("https://fakestoreapi.com/products");

      if (!response.ok) {
        throw new Error("Error al cargar los productos");
      }

      this.products = await response.json();
      this.filteredProducts = [...this.products];

      this.extractCategories();
      this.renderCategories();
      this.renderProducts();
    } catch (error) {
      console.error("Error:", error);
      this.showToast("Error al cargar los productos", "error");
      this.showNoProducts(true);
    } finally {
      this.showLoading(false);
    }
  }

  // Extraer categorías únicas
  extractCategories() {
    this.categories = [
      ...new Set(this.products.map((product) => product.category)),
    ];
  }

 // Renderizar opciones de categorías
  renderCategories() {
    const categoryFilter = document.getElementById("categoryFilter");

    // Limpiar opciones existentes (excepto "Todas las categorías")
    while (categoryFilter.children.length > 1) {
      categoryFilter.removeChild(categoryFilter.lastChild);
    }

    this.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = this.capitalize(category);
      categoryFilter.appendChild(option);
    });
  }

  // Renderizar productos
  renderProducts() {
    const container = document.getElementById("productsContainer");

    if (this.filteredProducts.length === 0) {
      this.showNoProducts(true);
      container.innerHTML = "";
      return;
    }

    this.showNoProducts(false);

    container.innerHTML = this.filteredProducts
      .map(
        (product) => `
                    <div class="product-card" data-id="${product.id}">
                        <img src="${product.image}" alt="${
          product.title
        }" class="product-image" 
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='">
                        
                        <div class="product-category">${this.capitalize(
                          product.category
                        )}</div>
                        
                        <h3 class="product-title">${product.title}</h3>
                        
                        <p class="product-description">${
                          product.description
                        }</p>
                        
                        <div class="product-rating">
                            <div class="stars">${this.generateStars(
                              product.rating.rate
                            )}</div>
                            <span class="rating-text">(${
                              product.rating.count
                            } reseñas)</span>
                        </div>
                        
                        <div class="product-footer">
                            <div class="product-price">$${product.price.toFixed(
                              2
                            )}</div>
                            <button class="add-to-cart-btn" onclick="fakeStore.addToCart(${
                              product.id
                            })">
                                <i class="fas fa-cart-plus"></i>
                                Agregar
                            </button>
                        </div>
                    </div>
                `
      )
      .join("");
  }