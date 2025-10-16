(function () {
  const api = "/api/v1";

  async function getJSON(url, opts) {
    const res = await fetch(url, opts);
    return res.json();
  }

  // small toast notification (non-blocking)
  function showToast(message, timeout = 2000) {
    let t = document.getElementById("toast-notification");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast-notification";
      t.style.position = "fixed";
      t.style.right = "20px";
      t.style.bottom = "20px";
      t.style.background = "rgba(0,0,0,0.8)";
      t.style.color = "white";
      t.style.padding = "10px 14px";
      t.style.borderRadius = "6px";
      t.style.zIndex = 9999;
      t.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.style.opacity = "1";
    setTimeout(() => {
      t.style.transition = "opacity 0.4s ease";
      t.style.opacity = "0";
    }, timeout);
  }

  // add-to-cart forms
  document.addEventListener("submit", async function (e) {
    const form = e.target;
    if (
      form.classList.contains("add-to-cart-form") ||
      form.id === "add-to-cart"
    ) {
      e.preventDefault();
      const prodId = form.dataset.productId;
      const qty = parseInt(form.qty.value) || 1;
      await fetch(api + "/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: prodId, qty }),
      });
      refreshCartCount();
      showToast("Added to cart");
      return false;
    }
    if (form.id === "login-form") {
      e.preventDefault();
      const fd = new FormData(form);
      const email = fd.get("email");
      const password = fd.get("password");
      const res = await fetch(api + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.data.token);
        // immediate redirect on success
        window.location.href = "/";
      } else showToast("Login failed");
      return false;
    }
    if (form.id === "checkout-form") {
      e.preventDefault();
      const token = localStorage.getItem("token");
      const res = await fetch(api + "/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? "Bearer " + token : "",
        },
        body: JSON.stringify({ shippingAddress: {} }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Order created");
        window.location.href = "/";
      } else
        showToast("Checkout failed: " + (data.error && data.error.message));
      return false;
    }
  });

  // search
  document.getElementById("search-btn")?.addEventListener("click", function () {
    const q = document.getElementById("search-input").value;
    window.location.href = "/?q=" + encodeURIComponent(q);
  });

  // signup
  document.addEventListener("submit", async function (e) {
    const form = e.target;
    if (form.id === "signup-form") {
      e.preventDefault();
      const fd = new FormData(form);
      const name = fd.get("name");
      const email = fd.get("email");
      const password = fd.get("password");
      const res = await fetch(api + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.data.token);
        window.location.href = "/";
      } else showToast("Signup failed");
      return false;
    }
    if (form.id === "admin-add-form") {
      e.preventDefault();
      const fd = new FormData(form);
      const body = Object.fromEntries(fd.entries());
      const token = localStorage.getItem("token");
      const res = await fetch(api + "/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? "Bearer " + token : "",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/";
      } else showToast("Failed to create product");
      return false;
    }
  });

  // back to top
  const back = document.querySelector(".foot-panel1");
  if (back)
    back.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );

  // cart count
  async function refreshCartCount() {
    const token = localStorage.getItem("token");
    const res = await fetch(api + "/cart", {
      headers: { Authorization: token ? "Bearer " + token : "" },
    });
    const data = await res.json();
    const count =
      data && data.data && data.data.items
        ? data.data.items.reduce((s, i) => s + (i.qty || 0), 0)
        : 0;
    document.getElementById("cart-count") &&
      (document.getElementById("cart-count").textContent = count);
  }
  refreshCartCount();
  // render cart if on cart page
  if (window.location.pathname === "/cart") {
    (async function () {
      const token = localStorage.getItem("token");
      const res = await fetch(api + "/cart", {
        headers: { Authorization: token ? "Bearer " + token : "" },
      });
      const data = await res.json();
      const container = document.getElementById("cart-items");
      if (!container) return;
      const cart = data.data || { items: [] };
      if (!cart.items || !cart.items.length) {
        container.innerHTML = "<p>Your cart is empty</p>";
        return;
      }
      const ul = document.createElement("ul");
      cart.items.forEach((i) => {
        const li = document.createElement("li");
        li.textContent = `${i.title} - qty: ${i.qty} - price: ${(
          i.price / 100
        ).toFixed(2)}`;
        ul.appendChild(li);
      });
      container.innerHTML = "";
      container.appendChild(ul);
      const form = document.createElement("form");
      form.id = "checkout-form";
      form.innerHTML = '<button type="submit">Checkout</button>';
      container.appendChild(form);
    })();
  }
})();
