import axios from "axios";
import Cookies from "universal-cookie";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const cookies = new Cookies();

const LOCAL_CART_KEY = "localCart";
const LOCAL_WISHLIST_KEY = "localWichlist";

const readLocalArray = (key) => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const writeLocalArray = (key, value) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const removeLocalKey = (key) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
};

const normalizeQuantity = (quantity) => {
  const parsed = Number(quantity);
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return Math.floor(parsed);
};

export const getLocalCartItems = () =>
  readLocalArray(LOCAL_CART_KEY).map((item) => ({
    id: item.id,
    pack_size_id: item.pack_size_id ?? item.packSizeId ?? 2,
    quantity: normalizeQuantity(item.quantity ?? item.qty ?? 1),
  }));

export const setLocalCartItems = (items) => {
  const normalized = items.map((item) => ({
    id: item.id,
    pack_size_id: item.pack_size_id ?? item.packSizeId ?? 2,
    quantity: normalizeQuantity(item.quantity ?? item.qty ?? 1),
  }));
  writeLocalArray(LOCAL_CART_KEY, normalized);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("local-cart-changed"));
  }
};

export const clearLocalCartStorage = () => {
  removeLocalKey(LOCAL_CART_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("local-cart-changed"));
  }
};

export const updateLocalCartItemQuantity = (productId, quantity, packSizeId) => {
  const items = getLocalCartItems();
  const targetId = String(productId);
  const targetPack = packSizeId ? String(packSizeId) : null;
  const nextQuantity = normalizeQuantity(quantity);
  const updated = items.map((item) => {
    const sameId = String(item.id) === targetId;
    const samePack = targetPack === null || String(item.pack_size_id) === targetPack;
    if (sameId && samePack) {
      return {
        ...item,
        pack_size_id: item.pack_size_id ?? packSizeId ?? 2,
        quantity: nextQuantity,
      };
    }
    return item;
  });
  setLocalCartItems(updated);
  return updated;
};

export const upsertLocalCartItem = (productId, packSizeId, quantity = 1) => {
  const items = getLocalCartItems();
  const targetId = String(productId);
  const targetPack = packSizeId ? String(packSizeId) : null;
  const baseQuantity = normalizeQuantity(quantity);
  const existingIndex = items.findIndex((item) => {
    if (String(item.id) !== targetId) return false;
    if (targetPack === null) return true;
    return String(item.pack_size_id) === targetPack;
  });
  if (existingIndex >= 0) {
    const current = items[existingIndex];
    const nextQuantity = normalizeQuantity((current.quantity ?? 1) + baseQuantity);
    items[existingIndex] = {
      ...current,
      pack_size_id: current.pack_size_id ?? packSizeId ?? 2,
      quantity: nextQuantity,
    };
  } else {
    items.push({ id: productId, pack_size_id: packSizeId ?? 2, quantity: baseQuantity });
  }
  setLocalCartItems(items);
  return items;
};

export const removeLocalCartItem = (productId, packSizeId) => {
  const targetId = String(productId);
  const targetPack = packSizeId ? String(packSizeId) : null;
  const items = getLocalCartItems().filter((item) => {
    if (String(item.id) !== targetId) return true;
    if (targetPack === null) return false;
    return String(item.pack_size_id) !== targetPack;
  });
  setLocalCartItems(items);
  return items;
};

export const getLocalWishlistItems = () =>
  readLocalArray(LOCAL_WISHLIST_KEY).map((item) => ({ id: item.id }));

export const setLocalWishlistItems = (items) => {
  const normalized = items.map((item) => ({ id: item.id }));
  writeLocalArray(LOCAL_WISHLIST_KEY, normalized);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("local-wishlist-changed"));
  }
};

export const clearLocalWishlistStorage = () => {
  removeLocalKey(LOCAL_WISHLIST_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("local-wishlist-changed"));
  }
};

export const toggleLocalWishlistItem = (productId) => {
  const items = getLocalWishlistItems();
  const targetId = String(productId);
  const index = items.findIndex((item) => String(item.id) === targetId);
  let status = "added";
  if (index >= 0) {
    items.splice(index, 1);
    status = "removed";
  } else {
    items.push({ id: productId });
  }
  setLocalWishlistItems(items);
  return { status, items };
};

export const api = axios.create({
  baseURL: "https://polivar.teamqeematech.site/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const publicApi = axios.create({
  baseURL: "https://polivar.teamqeematech.site/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach token automatically to all requests
api.interceptors.request.use(
  (config) => {
    const token = cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Login function
export const authLogin = async (data) => {
  const res = await api.post("/auth/login", data);

  console.log("Login Response:", res.data.message);

  //   const token = res.data?.data?.token; // ✅ correct key
  //   if (token) {
  //     cookies.set("token", token, {
  //       path: "/",
  //       maxAge: 60 * 60 * 24, // 1 day
  //       secure: true,
  //       sameSite: "strict",
  //     });
  //     console.log("Token Saved:", token);
  //   }

  return res.data;
};

export const getProfile = async () => {
  const res = await api.get("auth/profile");
  return res.data;
};

export const updateProfile = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  const res = await api.post("auth/edit-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const changePassword = async (payload) => {
  const res = await api.post("auth/change-password", payload);
  return res.data;
};

// 🔹 Get all products (simple, no filters)
export const getProducts = async () => {
  try {
    const res = await publicApi.get("shop/products");
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    throw error;
  }
};

// 🔹 Filter products with advanced filters
export const filterProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.category_id) params.append("category_id", filters.category_id);
    if (filters.featured) params.append("featured", filters.featured);
    if (filters.new) params.append("new", filters.new);
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.page) params.append("page", filters.page);

    const url = `products${params.toString() ? "?" + params.toString() : ""}`;
    console.log("🔗 Filter URL:", url);
    const res = await publicApi.get(url);
    console.log("📦 Filter Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error filtering products:", error);
    throw error;
  }
};
export const getAllCategories = async () => {
  const res = await publicApi.get("shop/categories");
  return res.data;
};
export const getRelatedProductsByCategoryId = async (id) => {
  try {
    const res = await publicApi.get(`shop/categories/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching category details:", error);
    throw error;
  }
};

export const searchProducts = async (query, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append("query", query);

    if (filters.category_id) params.append("category_id", filters.category_id);
    if (filters.price_min !== undefined)
      params.append("price_min", filters.price_min);
    if (filters.price_max !== undefined)
      params.append("price_max", filters.price_max);
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.page) params.append("page", filters.page);

    const url = `products/search?${params.toString()}`;
    console.log("🔍 Search URL:", url);
    const res = await publicApi.get(url);
    console.log("🔍 Search Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error searching products:", error);
    throw error;
  }
};

export const getProductById = async (id) => {
  const res = await publicApi.get(`shop/products/${id}`);
  return res.data;
};

export const getAllCart = async () => {
  try {
    const res = await api.get("cart");

    if (res.status === 200) {
      return res.data; // ✅ نجاح الطلب
    } else {
      return []; // ترجع مصفوفة فاضية لتفادي الكراش
    }
  } catch (error) {
    console.error(
      "Error fetching cart:",
      error.response?.data || error.message
    );

    return []; // ترجع مصفوفة فاضية في حال الخطأ
  }
};
export const getCartCount = async () => {
  const token = cookies.get("token");
  if (!token) {
    const items = getLocalCartItems();
    return items.reduce((total, item) => total + (item.quantity ?? 1), 0);
  }
  try {
    const data = await getAllCart();
    const cartItems = Array.isArray(data?.data) ? data.data : data;
    const count = cartItems.length;
    return count;
  } catch (error) {
    console.error("Error counting cart items:", error);
    return 0;
  }
};
export const clearCart = async () => {
  const res = await api.delete("cart");
  return res.data;
};
export const addToCart2 = async (productId) => {
  const res = await api.post(`/cart/${productId}`);
  return res.data;
};
export const addToCart = async (productId, pack_size_id = 2, quantity = 1) => {
  const token = cookies.get("token");
  const packId = pack_size_id ?? 2;
  const requestedQuantity = normalizeQuantity(quantity);

  try {
    if (!token) {
      upsertLocalCartItem(productId, packId, requestedQuantity);
      Swal.fire({
        icon: "info",
        title: "The product has been temporarily saved.",
        text: "It will be added to your basket when you log in.",
        timer: 1500,
        showConfirmButton: false,
      });
      return { status: "stored" };
    }

    await api.post(`/cart/${productId}`, {
      product_id: productId,
      pack_size_id: packId,
    });
    if (requestedQuantity > 1) {
      await api.put(
        `/cart/${productId}?quantity=${requestedQuantity}&pack_size_id=${packId}`
      );
    }

    await syncLocalCartWithServer();

    Swal.fire({
      icon: "success",
      title: "Added to basket",
      text: "The product has been successfully added!",
      timer: 1500,
      showConfirmButton: false,
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("local-cart-changed"));
    }
    return { status: "added" };
  } catch (error) {
    console.error("❌ Add to cart error:", error);
    Swal.fire({
      icon: "error",
      title: "An error has occurred.",
      text: "Unable to add product.",
    });
    throw error;
  }
};

export const syncLocalCartWithServer = async () => {
  const token = cookies.get("token");
  if (!token) return;
  const localCart = getLocalCartItems();
  if (!localCart.length) return;
  for (const item of localCart) {
    try {
      const syncPack = item.pack_size_id ?? 2;
      await api.post(`/cart/${item.id}`, {
        product_id: item.id,
        pack_size_id: syncPack,
      });
      const itemQuantity = normalizeQuantity(item.quantity ?? 1);
      if (itemQuantity > 1) {
        await api.put(
          `/cart/${item.id}?quantity=${itemQuantity}&pack_size_id=${syncPack}`
        );
      }
    } catch (error) {
      console.warn(`Failed to sync cart item ${item.id}`, error);
    }
  }
  clearLocalCartStorage();
};

// export const addToCart = async (productId) => {
//   const token = cookies.get("token");
//   if (!token) {
//     Swal.fire({
//       icon: "warning",
//       title: "تسجيل الدخول مطلوب",
//       text: "قم بتسجيل الدخول لإضافة المنتج إلى السلة.",
//       confirmButtonText: "حسنًا",
//     });
//     return;
//   }

//   try {
//     const payload = { product_id: productId, pack_size_id: 2 };
//     const res = await api.post(`/cart/${productId}`, payload);
//     Swal.fire({
//       icon: "success",
//       title: "تمت الإضافة إلى السلة",
//       text: "تم إضافة المنتج بنجاح!",
//       timer: 1500,
//       showConfirmButton: false,
//     });
//     return res.data;
//   } catch (error) {
//     console.error("Add to cart error:", error);
//     Swal.fire({
//       icon: "error",
//       title: "حدث خطأ",
//       text: "تعذر إضافة المنتج.",
//     });
//     throw error;
//   }
// };

export const removeFromCart = async (productId, size) => {
  try {
    const res = await api.delete(`/cart/${productId}?pack_size_id=${size}`);
    Swal.fire({
      icon: "success",
      title: "تم الحذف بنجاح 🗑️",
      text: "تمت إزالة المنتج من السلة.",
      showConfirmButton: false,
      timer: 1500,
    });
    return res.data;
  } catch (error) {
    console.error(
      "Remove from cart error:",
      error.response?.data || error.message
    );
    Swal.fire({
      icon: "error",
      title: "حدث خطأ",
      text: error.response?.data?.message || "تعذر حذف المنتج من السلة.",
      confirmButtonText: "حسناً",
    });
    throw error;
  }
};

export const updateQuantity = async (productId, quantity, packSizeId = 1) => {
  try {
    const res = await api.put(
      `/cart/${productId}?quantity=${quantity}&pack_size_id=${packSizeId}`
    );
    return res.data;
  } catch (error) {
    console.error(
      "❌ Update quantity error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const checkout = async (orderData) => {
  try {
    const config =
      orderData instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : undefined;
    const response = await api.post("orders", orderData, config);
    return response.data;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
};

export const getWishlistItems = async () => {
  const response = await api.get("favorite-list");
  return response.data;
};

export const syncLocalWishlistWithServer = async () => {
  const token = cookies.get("token");
  if (!token) return;
  const localItems = getLocalWishlistItems();
  if (!localItems.length) return;
  let serverIds = new Set();
  try {
    const remote = await getWishlistItems();
    const remoteItems = remote?.data || remote || [];
    remoteItems.forEach((item) => {
      const value =
        item?.id ??
        item?.product_id ??
        item?.product?.id ??
        item?.pivot?.product_id;
      if (value !== undefined && value !== null) {
        serverIds.add(String(value));
      }
    });
  } catch (error) {
    console.warn("Failed to fetch remote wishlist before sync", error);
  }
  for (const item of localItems) {
    const targetId = String(item.id);
    if (serverIds.has(targetId)) {
      continue;
    }
    try {
      await api.post(`/products/${item.id}/toggle-favorite`, {});
    } catch (error) {
      console.warn(`Failed to sync wishlist item ${item.id}`, error);
    }
  }
  clearLocalWishlistStorage();
};

export const getWishlistCount = async () => {
  const token = cookies.get("token");
  if (!token) {
    const items = getLocalWishlistItems();
    return items.length;
  }
  try {
    const response = await api.get("favorite-list");
    const items = response.data?.data || response.data || [];
    return items.length;
  } catch (error) {
    console.error(
      "Wishlist count error:",
      error.response?.data || error.message
    );
    return 0;
  }
};

export const addToWishlist = async (productId) => {
  const token = cookies.get("token");
  try {
    if (!token) {
      const { status } = toggleLocalWishlistItem(productId);
      if (status === "added") {
        Swal.fire({
          icon: "info",
          title: "The product add To Wishlist.",
          text: "It will be added to your Wishlist when you log in.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "info",
          title: "Removed from wishlist",
          text: "It will no longer appear once you log in.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      return { status };
    }

    const response = await api.post(
      `/products/${productId}/toggle-favorite`,
      {}
    );
    const data = response.data;
    const localWishlist = getLocalWishlistItems();
    if (localWishlist.length > 0) {
      await syncLocalWishlistWithServer();
    }
    if (data?.message === "Added to favorites") {
      Swal.fire({
        icon: "success",
        title: "product added to wishlist ❤️",
        text: "product added to wishlist successfully",
        showConfirmButton: false,
        timer: 2000,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("local-wishlist-changed"));
      }
      return { status: "added", data };
    }
    Swal.fire({
      icon: "info",
      title: "product removed from wishlist 💔",
      text: "peoduct removed from wishlist successfully",
      showConfirmButton: false,
      timer: 2000,
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("local-wishlist-changed"));
    }
    return { status: "removed", data };
  } catch (error) {
    console.error("Wishlist error:", error.response?.data || error.message);

    Swal.fire({
      icon: "error",
      title: "حدث خطأ",
      text:
        error.response?.data?.message || "حدث خطأ أثناء تعديل قائمة المفضلة",
      confirmButtonText: "حسناً",
    });

    throw error;
  }
};

export const getAllOffers = async () => {
  const response = await publicApi.get("offers");
  return response.data;
};
export const getAllSliders = async () => {
  const response = await publicApi.get("sliders");
  return response.data;
};

export const getallBranches = async () => {
  const response = await publicApi.get("branches");
  console.log(response);

  return response.data;
};

/////////////////////////

export const addProductReview = async (productId, comment, rating) => {
  try {
    const formData = new FormData();
    formData.append("comment", comment);
    formData.append("rating", rating);

    const response = await api.post(`/products/${productId}/review`, formData);

    // ✅ عرض تنبيه نجاح بعد الإضافة
    Swal.fire({
      title: "تم إضافة التقييم بنجاح ✅",
      text: "شكرًا لمشاركتك رأيك!",
      icon: "success",
      confirmButtonText: "حسنًا",
      confirmButtonColor: "#3085d6",
    });

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error adding review:",
      error.response?.data || error.message
    );

    // ❌ عرض تنبيه خطأ
    Swal.fire({
      title: "حدث خطأ!",
      text:
        error.response?.data?.message ||
        "لم يتم حفظ التقييم. حاول مرة أخرى لاحقًا.",
      icon: "error",
      confirmButtonText: "موافق",
      confirmButtonColor: "#d33",
    });

    throw error;
  }
};
//publicApi
export const getProductReviews = async (productId) => {
  try {
    const response = await api.get(`shop/products/${productId}/review`);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error fetching reviews:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getUserOrders = async () => {
  try {
    const response = await api.get("orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

export const getUserAddresses = async () => {
  try {
    const response = await api.get("addresses");
    return response.data;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
};

export const addAddress = async (addressData) => {
  try {
    const response = await api.post("addresses", addressData);
    return response.data;
  } catch (error) {
    console.error("Error adding address:", error);
    throw error;
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const response = await api.delete(`addresses/${addressId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting address:", error);
    throw error;
  }
};

export const getUserTickets = async () => {
  try {
    const response = await api.get("tickets");
    return response.data;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }
};

export const getPaymentMethods = async () => {
  try {
    const response = await api.get("payment-methods");
    return response.data;
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    throw error;
  }
};

export const processPayment = async (paymentData) => {
  try {
    const response = await api.post("payments", paymentData);
    return response.data;
  } catch (error) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const response = await api.get(`orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await api.post(`orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Error canceling order:", error);
    throw error;
  }
};

export const trackOrder = async (orderId) => {
  try {
    const response = await api.get(`orders/${orderId}/track`);
    return response.data;
  } catch (error) {
    console.error("Error tracking order:", error);
    throw error;
  }
};

export const getProductComments = async (productId) => {
  try {
    const response = await publicApi.get(`shop/products/${productId}/comments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product comments:", error);
    throw error;
  }
};

export const addProductComment = async (productId, commentData) => {
  try {
    const response = await api.post(
      `products/${productId}/comments`,
      commentData
    );
    return response.data;
  } catch (error) {
    console.error("Error adding product comment:", error);
    throw error;
  }
};

export const deleteProductComment = async (productId, commentId) => {
  try {
    const response = await api.delete(
      `products/${productId}/comments/${commentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting product comment:", error);
    throw error;
  }
};

export const replyToComment = async (productId, commentId, replyData) => {
  try {
    const response = await api.post(
      `products/${productId}/comments/${commentId}/reply`,
      replyData
    );
    return response.data;
  } catch (error) {
    console.error("Error replying to comment:", error);
    throw error;
  }
};

export const getProductVariants = async (productId) => {
  try {
    const response = await api.get(`products/${productId}/variants`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product variants:", error);
    throw error;
  }
};

export const requestReturn = async (orderId, returnData) => {
  try {
    const response = await api.post(`orders/${orderId}/return`, returnData);
    return response.data;
  } catch (error) {
    console.error("Error requesting return:", error);
    throw error;
  }
};

export const getReturnRequests = async () => {
  try {
    const response = await api.get("returns");
    return response.data;
  } catch (error) {
    console.error("Error fetching return requests:", error);
    throw error;
  }
};

export const applyCouponToCart = async (code) => {
  try {
    const response = await api.post("cart/apply-coupon", { code });
    return response.data;
  } catch (error) {
    console.error("Error applying coupon:", error);
    throw error;
  }
};

export const getTransactions = async () => {
  try {
    const response = await api.get("transactions");
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

export const getTransactionDetails = async (transactionId) => {
  try {
    const response = await api.get(`transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    throw error;
  }
};

export const payTransaction = async (transactionId) => {
  try {
    const response = await api.post(`transactions/${transactionId}/pay`);
    return response.data;
  } catch (error) {
    console.error("Error paying transaction:", error);
    throw error;
  }
};

export const getTickets = async () => {
  try {
    const response = await api.get("tickets");
    return response.data;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }
};

export const getTicketDetails = async (ticketId) => {
  try {
    const response = await api.get(`tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ticket details:", error);
    throw error;
  }
};

export const createTicket = async (ticketData) => {
  try {
    const formData = new FormData();
    Object.entries(ticketData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v, index) => {
          if (v !== undefined && v !== null) {
            formData.append(`${key}[${index}]`, v);
          }
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const response = await api.post("tickets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
};

export const updateTicket = async (ticketId, ticketData) => {
  try {
    const response = await api.put(`tickets/${ticketId}`, ticketData);
    return response.data;
  } catch (error) {
    console.error("Error updating ticket:", error);
    throw error;
  }
};

export const deleteTicket = async (ticketId) => {
  try {
    const response = await api.delete(`tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting ticket:", error);
    throw error;
  }
};

export const replyTicket = async (ticketId, message) => {
  try {
    const formData = new FormData();
    formData.append("message", message);
    const response = await api.post(`tickets/${ticketId}/reply`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error replying to ticket:", error);
    throw error;
  }
};

export const getAttributes = async () => {
  try {
    const response = await api.get("attributes");
    return response.data;
  } catch (error) {
    console.error("Error fetching attributes:", error);
    throw error;
  }
};

export const authRegister = async (userData) => {
  try {
    const formData = new FormData();
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, value);
      }
    });
    const response = await api.post("auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    await syncLocalCartWithServer();
    await syncLocalWishlistWithServer();
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const verifyPhone = async (email, code) => {
  try {
    const response = await api.post("auth/verify", { email, code });
    return response.data;
  } catch (error) {
    console.error("Error verifying phone:", error);
    throw error;
  }
};

export const authLogout = async () => {
  try {
    const response = await api.post("auth/logout");

    // Remove cookies after successful logout
    cookies.remove("token");
    cookies.remove("userId");

    Swal.fire({
      icon: "success",
      title: "Logged Out Successfully",
      text: "You have been logged out. See you again soon!",
      showConfirmButton: false,
      timer: 1500,
    });

    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);

    Swal.fire({
      icon: "error",
      title: "Logout Failed",
      text: "Something went wrong while logging out. Please try again.",
      confirmButtonText: "OK",
    });

    throw error;
  }
};
export const deleteAccount = async () => {
  try {
    const response = await api.delete("auth/delete-account");
    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

export const sendOTP = async (email) => {
  try {
    const response = await api.post("auth/reset-password/send-otp", { email });
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

export const verifyOTP = async (email, code) => {
  try {
    const response = await api.post("auth/reset-password/verify-otp", {
      email,
      code,
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

export const setNewPassword = async (
  resetToken,
  password,
  passwordConfirmation
) => {
  try {
    const response = await api.post("auth/reset-password/set-new-password", {
      reset_token: resetToken,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  } catch (error) {
    console.error("Error setting new password:", error);
    throw error;
  }
};

export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await api.put(`addresses/${addressId}`, addressData);
    return response.data;
  } catch (error) {
    console.error("Error updating address:", error);
    throw error;
  }
};

export const setDefaultAddress = async (addressId) => {
  try {
    const response = await api.post(`addresses/${addressId}/set-default`);
    return response.data;
  } catch (error) {
    console.error("Error setting default address:", error);
    throw error;
  }
};

export const updateAddressDefault = async (addressId) => {
  try {
    const response = await api.post(`addresses/${addressId}/default`);
    return response.data;
  } catch (error) {
    console.error("Error updating default address:", error);
    throw error;
  }
};

export const getNotifications = async () => {
  try {
    const response = await api.get("notifications");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const getWarehouseStock = async (productId) => {
  try {
    const response = await api.get(`products/${productId}/stock`);
    return response.data;
  } catch (error) {
    console.error("Error fetching warehouse stock:", error);
    throw error;
  }
};

export const getProductPackSizes = async (productId) => {
  try {
    const response = await publicApi.get(
      `shop/products/${productId}/pack-sizes`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching product pack sizes:", error);
    throw error;
  }
};

export const getCartSummary = async () => {
  try {
    const response = await api.get("cart/summary");
    return response.data;
  } catch (error) {
    console.error("Error fetching cart summary:", error);
    throw error;
  }
};

export const validateCouponCode = async (code) => {
  try {
    const response = await api.post("coupons/validate", { code });
    return response.data;
  } catch (error) {
    console.error("Error validating coupon:", error);
    throw error;
  }
};

export const removeCouponFromCart = async () => {
  try {
    const response = await api.post("cart/remove-coupon");
    return response.data;
  } catch (error) {
    console.error("Error removing coupon from cart:", error);
    throw error;
  }
};

export const getOrderStats = async () => {
  try {
    const response = await api.get("orders/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching order stats:", error);
    throw error;
  }
};

export const getUserReviews = async () => {
  try {
    const response = await api.get("reviews");
    return response.data;
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    throw error;
  }
};

export const deleteUserReview = async (reviewId) => {
  try {
    const response = await api.delete(`reviews/${reviewId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};

export const getReferralCode = async () => {
  try {
    const response = await api.get("referral/code");
    return response.data;
  } catch (error) {
    console.error("Error fetching referral code:", error);
    throw error;
  }
};

export const getReferralStats = async () => {
  try {
    const response = await api.get("referral/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    throw error;
  }
};

export const applyReferralCode = async (code) => {
  try {
    const response = await api.post("referral/apply", { code });
    return response.data;
  } catch (error) {
    console.error("Error applying referral code:", error);
    throw error;
  }
};

export const getProductForum = async (productId) => {
  try {
    const response = await api.get(`products/${productId}/forum`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product forum:", error);
    throw error;
  }
};

export const addForumComment = async (productId, comment) => {
  try {
    const response = await api.post(`products/${productId}/forum`, { comment });
    return response.data;
  } catch (error) {
    console.error("Error adding forum comment:", error);
    throw error;
  }
};

export const deleteForumComment = async (productId, commentId) => {
  try {
    const response = await api.delete(
      `products/${productId}/forum/${commentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting forum comment:", error);
    throw error;
  }
};

export const likeForumComment = async (productId, commentId) => {
  try {
    const response = await api.post(
      `products/${productId}/forum/${commentId}/like`
    );
    return response.data;
  } catch (error) {
    console.error("Error liking forum comment:", error);
    throw error;
  }
};

export const getCategoryProducts = async (categoryId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append("category_id", categoryId);

    if (filters.page) params.append("page", filters.page);
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.price_min !== undefined)
      params.append("price_min", filters.price_min);
    if (filters.price_max !== undefined)
      params.append("price_max", filters.price_max);

    const url = `products${params.toString() ? "?" + params.toString() : ""}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching category products:", error);
    throw error;
  }
};

export const getProductAvailability = async (productId) => {
  try {
    const response = await api.get(`products/${productId}/availability`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product availability:", error);
    throw error;
  }
};

export const checkProductInStock = async (productId, quantity = 1) => {
  try {
    const response = await publicApi.post(
      `shop/products/${productId}/check-stock`,
      {
        quantity,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking product stock:", error);
    throw error;
  }
};

export const getShippingCost = async (addressId) => {
  try {
    const response = await api.get(`shipping/cost`, {
      params: { address_id: addressId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching shipping cost:", error);
    throw error;
  }
};

export const estimateDelivery = async (addressId) => {
  try {
    const response = await api.get(`shipping/estimate`, {
      params: { address_id: addressId },
    });
    return response.data;
  } catch (error) {
    console.error("Error estimating delivery:", error);
    throw error;
  }
};

export const getAvailableCouponCodes = async () => {
  try {
    const response = await api.get("coupons/available");
    return response.data;
  } catch (error) {
    console.error("Error fetching available coupons:", error);
    throw error;
  }
};

export const getUserLoyaltyPoints = async () => {
  try {
    const response = await api.get("loyalty/points");
    return response.data;
  } catch (error) {
    console.error("Error fetching loyalty points:", error);
    throw error;
  }
};

export const redeemLoyaltyPoints = async (points) => {
  try {
    const response = await api.post("loyalty/redeem", { points });
    return response.data;
  } catch (error) {
    console.error("Error redeeming loyalty points:", error);
    throw error;
  }
};

export const getProductSize = async (productId) => {
  try {
    const response = await api.get(`products/${productId}/sizes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product sizes:", error);
    throw error;
  }
};

export const getProductColor = async (productId) => {
  try {
    const response = await api.get(`products/${productId}/colors`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product colors:", error);
    throw error;
  }
};

export const trackOrderShipment = async (orderId) => {
  try {
    const response = await api.get(`orders/${orderId}/shipment-track`);
    return response.data;
  } catch (error) {
    console.error("Error tracking shipment:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const downloadOrderInvoice = async (orderId) => {
  try {
    const response = await api.get(`orders/${orderId}/invoice/download`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading invoice:", error);
    throw error;
  }
};
