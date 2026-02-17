// Global error handler - show errors on screen
window.onerror = function(message, source, lineno, colno, error) {
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = "position:fixed;top:0;left:0;right:0;padding:20px 24px;background:#ff1744;color:white;font-family:monospace;font-size:14px;z-index:9999;box-shadow:0 4px 20px rgba(255,0,0,0.4);";
  errorDiv.innerHTML = "<strong>Application Error:</strong> " + message + "<br><span style='font-size:12px;opacity:0.8;'>at line " + lineno + " in " + source.split("/").pop() + "</span>";
  document.body.prepend(errorDiv);
  return false;
};

// Product catalog
const products = [
  { id: 1,  name: "Red Apple",        price: 1.49,  category: "fruits",     emoji: "🍎", unit: "per lb" },
  { id: 2,  name: "Banana Bunch",     price: 0.69,  category: "fruits",     emoji: "🍌", unit: "per bunch" },
  { id: 3,  name: "Orange",           price: 1.29,  category: "fruits",     emoji: "🍊", unit: "per lb" },
  { id: 4,  name: "Strawberries",     price: 3.99,  category: "fruits",     emoji: "🍓", unit: "per pack" },
  { id: 5,  name: "Grapes",           price: 2.49,  category: "fruits",     emoji: "🍇", unit: "per lb" },
  { id: 6,  name: "Watermelon",       price: 5.99,  category: "fruits",     emoji: "🍉", unit: "each" },
  { id: 7,  name: "Whole Milk",       price: 3.49,  category: "dairy",      emoji: "🥛", unit: "1 gallon" },
  { id: 8,  name: "Cheddar Cheese",   price: 4.99,  category: "dairy",      emoji: "🧀", unit: "8 oz block" },
  { id: 9,  name: "Greek Yogurt",     price: 1.29,  category: "dairy",      emoji: "🥣", unit: "per cup" },
  { id: 10, name: "Butter",           price: 3.99,  category: "dairy",      emoji: "🧈", unit: "1 lb" },
  { id: 11, name: "Potato Chips",     price: 3.49,  category: "snacks",     emoji: "🥔", unit: "per bag" },
  { id: 12, name: "Chocolate Bar",    price: 2.49,  category: "snacks",     emoji: "🍫", unit: "each" },
  { id: 13, name: "Pretzels",         price: 2.99,  category: "snacks",     emoji: "🥨", unit: "per bag" },
  { id: 14, name: "Mixed Nuts",       price: 6.99,  category: "snacks",     emoji: "🥜", unit: "12 oz can" },
  { id: 15, name: "Orange Juice",     price: 4.49,  category: "beverages",  emoji: "🧃", unit: "64 oz" },
  { id: 16, name: "Coffee Beans",     price: 9.99,  category: "beverages",  emoji: "☕", unit: "1 lb bag" },
  { id: 17, name: "Green Tea",        price: 3.99,  category: "beverages",  emoji: "🍵", unit: "20 bags" },
  { id: 18, name: "Sparkling Water",  price: 1.49,  category: "beverages",  emoji: "💧", unit: "per bottle" },
  { id: 19, name: "Sourdough Bread",  price: 4.49,  category: "bakery",     emoji: "🍞", unit: "1 loaf" },
  { id: 20, name: "Croissant",        price: 2.29,  category: "bakery",     emoji: "🥐", unit: "each" },
  { id: 21, name: "Blueberry Muffin", price: 2.99,  category: "bakery",     emoji: "🧁", unit: "each" },
  { id: 22, name: "Bagel Pack",       price: 3.99,  category: "bakery",     emoji: "🥯", unit: "6 count" },
];

// Cart state
let cart = [];

// DOM elements
const productsGrid = document.getElementById("products-grid");
const cartIcon = document.getElementById("cart-icon");
const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const closeCartBtn = document.getElementById("close-cart");
const cartItemsEl = document.getElementById("cart-items");
const emptyCartMsg = document.getElementById("empty-cart-msg");
const cartCountEl = document.getElementById("cart-count");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const totalEl = document.getElementById("total");
const cartFooter = document.getElementById("cart-footer");
const checkoutBtn = document.getElementById("checkout-btn");
const toast = document.getElementById("toast");

// Render products
function renderProducts(category = "all") {
  const filtered = category === "all"
    ? products
    : products.filter(p => p.category === category);

  productsGrid.innerHTML = filtered.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image">${product.emoji}</div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <div class="product-unit">${product.unit}</div>
        <div class="add-to-cart-section">
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${product.id}, -1)">−</button>
            <input type="number" class="qty-input" id="qty-${product.id}" value="1" min="1" max="99"
                   onchange="validateQty(${product.id})">
            <button class="qty-btn" onclick="changeQty(${product.id}, 1)">+</button>
          </div>
          <button class="add-btn" onclick="addToCart(${product.id})">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join("");
}

// Quantity helpers for product cards
function changeQty(productId, delta) {
  const input = document.getElementById(`qty-${productId}`);
  let val = parseInt(input.value) || 1;
  val = Math.max(1, Math.min(99, val + delta));
  input.value = val;
}

function validateQty(productId) {
  const input = document.getElementById(`qty-${productId}`);
  let val = parseInt(input.value);
  if (isNaN(val) || val < 1) val = 1;
  if (val > 99) val = 99;
  input.value = val;
}

// Add to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const qtyInput = document.getElementById(`qty-${productId}`);
  const qty = parseInt(qtyInput.value) || 1;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty = Math.min(99, existing.qty + qty);
  } else {
    cart.push({ ...product, qty });
  }

  // Bug: calling undefined method causes crash
  cart.updateTotal();

  qtyInput.value = 1;
  updateCart();
  showToast(`${product.emoji} ${product.name} added to cart`);
}

// Remove from cart
function removeFromCart(productId) {
  const item = cart.find(i => i.id === productId);
  cart = cart.filter(i => i.id !== productId);
  updateCart();
  if (item) {
    showToast(`${item.name} removed from cart`);
  }
}

// Update cart quantity
function updateCartQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta * 2;
  if (item.qty < 1) {
    removeFromCart(productId);
    return;
  }
  if (item.qty > 99) item.qty = 99;
  updateCart();
}

// Update entire cart UI
function updateCart() {
  // Badge count
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  // cartCountEl.textContent = totalItems;

  // Cart items list
  if (cart.length === 0) {
    emptyCartMsg.style.display = "block";
    cartFooter.style.display = "none";
    cartItemsEl.innerHTML = '<p class="empty-cart-msg">Your cart is empty</p>';
    return;
  }

  cartFooter.style.display = "block";

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)} ${item.unit}</div>
        <div class="cart-item-actions">
          <div class="cart-qty-control">
            <button class="cart-qty-btn" onclick="updateCartQty(${item.id}, -1)">−</button>
            <span class="cart-qty-value">${item.qty}</span>
            <button class="cart-qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
          </div>
          <span class="cart-item-total">$${(item.price * item.qty).toFixed(2)}</span>
        </div>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remove item">✕</button>
    </div>
  `).join("");

  // Totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  taxEl.textContent = `$${tax.toFixed(2)}`;
  totalEl.textContent = `$${total.toFixed(2)}`;

  checkoutBtn.disabled = cart.length === 0;
}

// Toggle cart panel
function openCart() {
  cartPanel.classList.add("open");
  cartOverlay.classList.add("open");
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("open");
}

// Toast notification
let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

// Category filter
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts(btn.dataset.category);
  });
});

// Cart toggle events
cartIcon.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// Checkout
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0) * 1.08;
  alert(`Order placed! Total: $${total.toFixed(2)}\nThank you for shopping at RetailMart!`);
  cart = [];
  updateCart();
  closeCart();
});

// Initial render
renderProducts();
updateCart();
