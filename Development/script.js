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
