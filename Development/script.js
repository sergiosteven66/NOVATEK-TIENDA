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

