import axios from "axios";

export const publicApi = axios.create({
  baseURL: "https://polivar.teamqeematech.site/api/shop/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
// 🔹 Get all products (simple, no filters)
export const getProducts = async () => {
  try {
    const res = await publicApi.get("products");
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
  const res = await publicApi.get("categories");
  return res.data;
};
export const getRelatedProductsByCategoryId = async (id) => {
  try {
    const res = await publicApi.get(`categories/${id}`);
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
  const res = await publicApi.get(`products/${id}`);
  return res.data;
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
  return response.data;
};

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

export const getProductComments = async (productId) => {
  try {
    const response = await publicApi.get(`shop/products/${productId}/comments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product comments:", error);
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
