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
