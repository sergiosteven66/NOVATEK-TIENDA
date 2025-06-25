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

    // Filtrar productos
  filterProducts() {
    const searchTerm = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const categoryFilter = document.getElementById("categoryFilter").value;

    this.filteredProducts = this.products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm);
      const matchesCategory =
        !categoryFilter || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    this.sortProducts();
  }

  // Ordenar productos
  sortProducts() {
    const sortValue = document.getElementById("sortFilter").value;

    switch (sortValue) {
      case "price-asc":
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        this.filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        this.filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "rating-desc":
        this.filteredProducts.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
      default:
        // Orden por defecto (por ID)
        this.filteredProducts.sort((a, b) => a.id - b.id);
    }

    this.renderProducts();
  }
 // Agregar producto al carrito
  addToCart(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = this.cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        ...product,
        quantity: 1,
      });
    }

    this.saveCartToStorage();
    this.updateCartUI();
    this.showToast(`${product.title} agregado al carrito`, "success");
  }

  // Remover producto del carrito
  removeFromCart(productId) {
    this.cart = this.cart.filter((item) => item.id !== productId);
    this.saveCartToStorage();
    this.updateCartUI();
    this.renderCartItems();
    this.showToast("Producto eliminado del carrito", "success");
  }

    // Actualizar cantidad de producto en el carrito
  updateQuantity(productId, change) {
    const item = this.cart.find((item) => item.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this.saveCartToStorage();
    this.updateCartUI();
    this.renderCartItems();
  }

  // Vaciar carrito
  clearCart() {
    if (this.cart.length === 0) {
      this.showToast("El carrito ya está vacío", "error");
      return;
    }

    if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
      this.cart = [];
      this.saveCartToStorage();
      this.updateCartUI();
      this.renderCartItems();
      this.showToast("Carrito vaciado", "success");
    }
  }

  // Proceder al checkout
  checkout() {
    if (this.cart.length === 0) {
      this.showToast("El carrito está vacío", "error");
      return;
    }

    const total = this.calculateTotal();
    const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);

    if (
      confirm(
        `¿Proceder con la compra?\n\nTotal: ${total.toFixed(
          2
        )}\nProductos: ${itemCount}`
      )
    ) {
      this.showToast("¡Compra realizada con éxito!", "success");
      this.cart = [];
      this.saveCartToStorage();
      this.updateCartUI();
      this.renderCartItems();
      this.toggleCartModal();
    }
  }
  
  // Actualizar interfaz del carrito
  updateCartUI() {
    const cartCount = document.getElementById("cartCount");
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (totalItems > 0) {
      cartCount.style.display = "flex";
    } else {
      cartCount.style.display = "none";
    }
  }

  // Renderizar items del carrito
  renderCartItems() {
    const cartItems = document.getElementById("cartItems");
    const emptyCart = document.getElementById("emptyCart");
    const cartTotal = document.getElementById("cartTotal");

    if (this.cart.length === 0) {
      cartItems.style.display = "none";
      emptyCart.style.display = "block";
      cartTotal.textContent = "0.00";
      return;
    }

    cartItems.style.display = "block";
    emptyCart.style.display = "none";

    cartItems.innerHTML = this.cart
      .map(
        (item) => `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${
          item.title
        }" class="cart-item-image"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OL0E8L3RleHQ+PC9zdmc+'">
                        
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-price">${item.price.toFixed(
                              2
                            )} c/u</div>
                        </div>
                        
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="fakeStore.updateQuantity(${
                                  item.id
                                }, -1)" 
                                        ${item.quantity <= 1 ? "disabled" : ""}>
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity">${item.quantity}</span>
                                <button class="quantity-btn" onclick="fakeStore.updateQuantity(${
                                  item.id
                                }, 1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            
                            <button class="remove-item-btn" onclick="fakeStore.removeFromCart(${
                              item.id
                            })" 
                                    title="Eliminar producto">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `
      )
      .join("");

    cartTotal.textContent = this.calculateTotal().toFixed(2);
  }

  // Calcular total del carrito
  calculateTotal() {
    return this.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  // Toggle modal del carrito
  toggleCartModal() {
    const modal = document.getElementById("cartModal");
    const overlay = document.getElementById("modalOverlay");

    const isActive = modal.classList.contains("active");

    if (isActive) {
      modal.classList.remove("active");
      overlay.classList.remove("active");
    } else {
      this.renderCartItems();
      modal.classList.add("active");
      overlay.classList.add("active");
    }
  }

  // Cerrar modal
  closeModal() {
    const modal = document.getElementById("cartModal");
    const overlay = document.getElementById("modalOverlay");

    modal.classList.remove("active");
    overlay.classList.remove("active");
  }

  // Guardar carrito en localStorage
  saveCartToStorage() {
    try {
      localStorage.setItem("fakestore-cart", JSON.stringify(this.cart));
    } catch (error) {
      console.error("Error al guardar el carrito:", error);
    }
  }
   // Cargar carrito desde localStorage
  loadCartFromStorage() {
    try {
      const savedCart = localStorage.getItem("fakestore-cart");
      if (savedCart) {
        this.cart = JSON.parse(savedCart);
      }
    } catch (error) {
      console.error("Error al cargar el carrito:", error);
      this.cart = [];
    }
  }

  // Mostrar/ocultar loading
  showLoading(show) {
    const loading = document.getElementById("loading");
    loading.style.display = show ? "flex" : "none";
  }

  // Mostrar/ocultar mensaje de no productos
  showNoProducts(show) {
    const noProducts = document.getElementById("noProducts");
    noProducts.style.display = show ? "block" : "none";
  }

  // Mostrar toast notification
  showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMessage = toast.querySelector(".toast-message");
    const toastIcon = toast.querySelector(".toast-icon");

    // Configurar mensaje y tipo
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;

    // Configurar icono según el tipo
    if (type === "success") {
      toastIcon.className = "toast-icon fas fa-check-circle";
    } else if (type === "error") {
      toastIcon.className = "toast-icon fas fa-exclamation-circle";
    }

    // Mostrar toast
    toast.classList.add("show");

    // Ocultar después de 3 segundos
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // Generar estrellas para rating
  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = "";

    // Estrellas llenas
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>';
    }

    // Media estrella
    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    }

    // Estrellas vacías
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>';
    }

    return stars;
  }

  // Capitalizar texto
  capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}

// Inicializar la aplicación cuando el DOM esté listo
let fakeStore;

document.addEventListener("DOMContentLoaded", () => {
  fakeStore = new FakeStore();
});

// Función global para agregar al carrito (llamada desde el HTML)
window.addToCart = (productId) => {
  if (fakeStore) {
    fakeStore.addToCart(productId);
  }
};
