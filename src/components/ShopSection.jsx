import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ReactSlider from "react-slider";
import {
  getAllCategories,
  getProducts,
  filterProducts,
  searchProducts,
  getRelatedProductsByCategoryId,
} from "../api/api";
import ProductShopCard from "./Card/productShopCard";

const ShopSection = () => {
  const location = useLocation();
  // ========== STATE MANAGEMENT ==========
  const [Products, setProducts] = useState([]);
  const [Categories, setCategory] = useState([]);
  const [SubCategories, setSubCategories] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [grid, setGrid] = useState(false);
  const [active, setActive] = useState(false);

  // ========== FILTER STATES ==========
  const [filters, setFilters] = useState({
    category_id: null,
    price_min: 0,
    price_max: 5000,
    sort: "newest",
    page: 1,
    colors: [],
    rating: null,
    brand: null,
    in_stock: null,
    discount: null,
  });
  const [allProducts, setAllProducts] = useState([]);
  
  // Available colors for filter
  const availableColors = [
    { name: "Red", value: "red", hex: "#EF4444" },
    { name: "Blue", value: "blue", hex: "#3B82F6" },
    { name: "Green", value: "green", hex: "#10B981" },
    { name: "Yellow", value: "yellow", hex: "#F59E0B" },
    { name: "Purple", value: "purple", hex: "#8B5CF6" },
    { name: "Pink", value: "pink", hex: "#EC4899" },
    { name: "Orange", value: "orange", hex: "#F97316" },
    { name: "Black", value: "black", hex: "#1F2937" },
    { name: "White", value: "white", hex: "#F9FAFB" },
    { name: "Gray", value: "gray", hex: "#6B7280" },
    { name: "Brown", value: "brown", hex: "#92400E" },
    { name: "Cyan", value: "cyan", hex: "#06B6D4" },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    per_page: 12,
    last_page: 1,
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search") || "";
    const categoryParam = params.get("category");
    const pageParam = params.get("page");
    const parsedCategory = categoryParam ? Number(categoryParam) : null;
    const normalizedCategory = Number.isNaN(parsedCategory)
      ? null
      : parsedCategory;
    const parsedPage = pageParam ? Number(pageParam) : 1;
    const normalizedPage =
      Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    setSearchQuery((prev) => (prev === searchParam ? prev : searchParam));

    setFilters((prev) => {
      const shouldUpdate =
        prev.category_id !== normalizedCategory || prev.page !== normalizedPage;
      if (!shouldUpdate) {
        return prev;
      }
      return {
        ...prev,
        category_id: normalizedCategory,
        page: normalizedPage,
      };
    });

    if (normalizedCategory) {
      fetchSubCategories(normalizedCategory);
    } else {
      setSubCategories([]);
    }
  }, [location.search]);

  // ========== FETCH CATEGORIES ON MOUNT ==========
  useEffect(() => {
    fetchCategories();
  }, []);

  // ========== FETCH PRODUCTS WHEN FILTERS CHANGE ==========
  useEffect(() => {
    if (searchQuery.trim()) {
      fetchSearchProducts();
    } else {
      fetchProducts();
    }
  }, [filters, searchQuery]);

  // ========== FETCH FUNCTIONS ==========
  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      console.log("✅ Full Categories Response:", response);

      // ✅ Handle different response formats
      let cats = [];

      if (Array.isArray(response)) {
        cats = response;
      } else if (response.data && Array.isArray(response.data)) {
        cats = response.data;
      }

      console.log("📁 Categories Array:", cats);
      setCategory(cats);
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let res;

      if (filters.category_id) {
        console.log("📤 Fetching category products:", filters.category_id);
        res = await getRelatedProductsByCategoryId(filters.category_id);
      } else {
        console.log("📤 Fetching all products");
        res = await getProducts();
      }

      console.log("✅ Full Response:", res);

      // ✅ Handle different response formats
      let productsArray = [];
      let paginationData = null;

      if (res.data && Array.isArray(res.data)) {
        productsArray = res.data;
        paginationData = res.meta;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        productsArray = res.data.data;
        paginationData = res.data.meta;
      } else if (
        res.data &&
        res.data.products &&
        Array.isArray(res.data.products)
      ) {
        productsArray = res.data.products;
      } else if (res.data && Array.isArray(res.data)) {
        productsArray = res.data;
      } else if (Array.isArray(res)) {
        productsArray = res;
      }

      console.log("🎯 Products Array Before Filter:", productsArray);

      setAllProducts(productsArray || []);

      // ✅ Apply frontend filters
      let filteredProducts = productsArray || [];
      filteredProducts = filteredProducts.filter((product) => {
        // Price filter
        const productPrice = parseFloat(product.price || 0);
        const priceMatch = productPrice >= filters.price_min && productPrice <= filters.price_max;
        if (!priceMatch) return false;

        // Color filter
        if (filters.colors.length > 0) {
          const productColor = product.color?.toLowerCase() || product.colour?.toLowerCase() || "";
          const colorMatch = filters.colors.some(color => 
            productColor.includes(color.toLowerCase())
          );
          if (!colorMatch) return false;
        }

        // Rating filter
        if (filters.rating) {
          const productRating = parseFloat(product.average_rating || product.rating || 0);
          if (productRating < filters.rating) return false;
        }

        // Stock filter
        if (filters.in_stock !== null) {
          const isInStock = (product.stock || product.quantity || 0) > 0;
          if (filters.in_stock && !isInStock) return false;
          if (!filters.in_stock && isInStock) return false;
        }

        // Discount filter
        if (filters.discount !== null) {
          const hasDiscount = product.discount && parseFloat(product.discount) > 0;
          if (filters.discount && !hasDiscount) return false;
          if (!filters.discount && hasDiscount) return false;
        }

        return true;
      });

      console.log("🎯 Products After Price Filter:", filteredProducts);
      setProducts(filteredProducts);

      if (paginationData) {
        setPagination({
          total: paginationData.total || 0,
          current_page: paginationData.current_page || 1,
          per_page: paginationData.per_page || 8,
          last_page: paginationData.last_page || 1,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchProducts = async () => {
    setLoading(true);
    try {
      const res = await searchProducts(searchQuery, filters);
      console.log("✅ Search Response:", res);

      // ✅ Handle different response formats
      let productsArray = [];
      let paginationData = null;

      if (res.data && Array.isArray(res.data)) {
        // Format: { data: [...], meta: {...} }
        productsArray = res.data;
        paginationData = res.meta;
      } else if (res.data && res.data.data) {
        // Format: { data: { data: [...], meta: {...} } }
        productsArray = res.data.data;
        paginationData = res.data.meta;
      } else if (Array.isArray(res)) {
        // Format: [...]
        productsArray = res;
      }

      console.log("🎯 Search Products:", productsArray);
      setProducts(productsArray || []);

      if (paginationData) {
        setPagination({
          total: paginationData.total || 0,
          current_page: paginationData.current_page || 1,
          per_page: paginationData.per_page || 8,
          last_page: paginationData.last_page || 1,
        });
      }
    } catch (error) {
      console.error("❌ Error searching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const res = await getRelatedProductsByCategoryId(categoryId);
      console.log("✅ SubCategories fetched:", res);

      const subCats = res.data?.children || res.children || [];
      setSubCategories(subCats);
    } catch (error) {
      console.error("❌ Error fetching subcategories:", error);
      setSubCategories([]);
    }
  };

  // ========== FILTER HANDLERS ==========
  const handlePriceFilter = (values) => {
    setFilters({
      ...filters,
      price_min: values[0],
      price_max: values[1],
      page: 1,
    });
  };

  const handleCategoryFilter = (categoryId) => {
    console.log("🔍 Category selected:", categoryId, typeof categoryId);
    setFilters({
      ...filters,
      category_id: categoryId,
      page: 1,
    });
    fetchSubCategories(categoryId);
  };

  const handleSortChange = (e) => {
    setFilters({
      ...filters,
      sort: e.target.value,
      page: 1,
    });
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFilters({ ...filters, page: 1 });
  };

  const handlePageChange = (pageNum) => {
    setFilters({
      ...filters,
      page: pageNum,
    });
  };

  const handleColorFilter = (color) => {
    setFilters((prev) => {
      const colors = prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color];
      return {
        ...prev,
        colors,
        page: 1,
      };
    });
  };

  const handleRatingFilter = (rating) => {
    setFilters({
      ...filters,
      rating: filters.rating === rating ? null : rating,
      page: 1,
    });
  };

  const handleStockFilter = (inStock) => {
    setFilters({
      ...filters,
      in_stock: filters.in_stock === inStock ? null : inStock,
      page: 1,
    });
  };

  const handleDiscountFilter = (hasDiscount) => {
    setFilters({
      ...filters,
      discount: filters.discount === hasDiscount ? null : hasDiscount,
      page: 1,
    });
  };

  const clearFilters = () => {
    setFilters({
      category_id: null,
      price_min: 0,
      price_max: 5000,
      sort: "newest",
      page: 1,
      colors: [],
      rating: null,
      brand: null,
      in_stock: null,
      discount: null,
    });
    setSearchQuery("");
    setSubCategories([]);
  };

  const sidebarController = () => {
    setActive(!active);
  };

  // ========== PAGINATION RENDER ==========
  const renderPagination = () => {
    const pages = [];
    const { last_page, current_page } = pagination;

    const startPage = Math.max(1, current_page - 2);
    const endPage = Math.min(last_page, current_page + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li className="page-item" key={i}>
          <button
            onClick={() => handlePageChange(i)}
            className={`page-link h-64 w-64 flex-center text-md rounded-10 fw-medium border transition-all ${
              current_page === i
                ? "active bg-gray-500 text-white border-gray-500"
                : "text-gray-600 border-gray-300 hover:bg-gray-100 hover:border-gray-400"
            }`}
          >
            {i}
          </button>
        </li>
      );
    }

    return pages;
  };

  return (
    <section className="shop py-80" style={{ position: "relative" }}>
      <style>{`
        .shop-sidebar {
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .shop-sidebar__box {
          transition: all 0.3s ease;
        }
        .shop-sidebar__box:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
        }
        .color-filter-btn:hover {
          transform: scale(1.15) !important;
        }
        .rating-filter-btn, .stock-filter-btn, .discount-filter-btn {
          transition: all 0.2s ease;
        }
        .rating-filter-btn:hover, .stock-filter-btn:hover, .discount-filter-btn:hover {
          transform: translateX(4px);
        }
        @media (max-width: 991px) {
          .shop-sidebar {
            position: fixed !important;
            top: 0;
            left: -100%;
            width: 320px;
            max-width: 85vw;
            height: 100vh;
            background: white;
            z-index: 1050;
            padding: 20px;
            overflow-y: auto;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            transition: left 0.3s ease;
          }
          .shop-sidebar.active {
            left: 0;
          }
          .side-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1049;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
          }
          .side-overlay.show {
            opacity: 1;
            visibility: visible;
          }
        }
        @media (min-width: 992px) {
          .shop-sidebar {
            position: sticky;
            top: 20px;
            align-self: flex-start;
          }
        }
        .custom--range .horizontal-slider {
          height: 8px;
          width: 100%;
          margin: 20px 0;
        }
        .custom--range .example-track {
          top: 0;
          height: 6px;
          background: #D1D5DB;
          border-radius: 3px;
        }
        .custom--range .example-track.example-track-0 {
          background: #9CA3AF;
        }
        .custom--range .example-track.example-track-1 {
          background: #D1D5DB;
        }
        .custom--range .example-track.example-track-2 {
          background: #D1D5DB;
        }
        .custom--range .price-thumb {
          width: 20px;
          height: 20px;
          background: #9CA3AF;
          border-radius: 50%;
          border: 3px solid white;
          cursor: grab;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
          outline: none;
        }
        .custom--range .price-thumb:hover {
          transform: scale(1.15);
          background: #6B7280;
          box-shadow: 0 3px 8px rgba(0,0,0,0.2);
        }
        .custom--range .price-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }
        .custom--range .horizontal-slider {
          margin: 24px 0;
        }
      `}</style>
      <div className={`side-overlay ${active && "show"}`} onClick={sidebarController}></div>
      <div className="container container-lg">
        {/* SEARCH BAR START */}
        <div className="row mb-32">
          <div className="col-12">
            <div className="position-relative">
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={searchQuery}
                onChange={handleSearch}
                className="form-control common-input px-24 py-18 text-lg rounded-12 w-100 border-2 border-gray-300 focus:border-gray-400 transition-all"
                style={{ backgroundColor: "#FAFAFA" }}
                style={{
                  fontSize: "16px",
                  paddingLeft: "50px",
                }}
              />
              <span
                className="position-absolute start-0 top-50 translate-middle-y ms-20 text-gray-400"
                style={{ fontSize: "20px" }}
              >
                🔍
              </span>
            </div>
          </div>
        </div>
        {/* SEARCH BAR END */}

        <div className="row">
          {/* ========== SIDEBAR START ========== */}
          <div className="col-lg-3">
            <div className={`shop-sidebar ${active && "active"}`} style={{
              position: "sticky",
              top: "20px",
              maxHeight: "calc(100vh - 40px)",
              overflowY: "auto",
            }}>
              <button
                onClick={sidebarController}
                type="button"
                className="shop-sidebar__close d-lg-none d-flex w-40 h-40 flex-center border border-gray-300 rounded-circle position-absolute end-0 me-10 mt-8 transition-all"
                style={{
                  backgroundColor: "white",
                  color: "#6B7280",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#9CA3AF";
                  e.currentTarget.style.borderColor = "#6B7280";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#D1D5DB";
                  e.currentTarget.style.color = "#6B7280";
                }}
                style={{ zIndex: 10 }}
              >
                <i className="ph ph-x text-lg" />
              </button>

              {/* ========== CATEGORIES FILTER ========== */}
              <div className="shop-sidebar__box border border-gray-200 rounded-16 p-32 mb-32" style={{ backgroundColor: "#FAFAFA" }}>
                <h6 className="text-lg fw-semibold border-bottom border-gray-300 pb-16 mb-24 d-flex align-items-center gap-8" style={{ color: "#6B7280" }}>
                  <span style={{ fontSize: "18px" }}>📁</span> Product Category
                </h6>
                <ul className="max-h-540 overflow-y-auto scroll-sm">
                  {Categories.map((category) => (
                    <li key={category.id} className="mb-16">
                      <button
                        onClick={() => handleCategoryFilter(category.id)}
                        className={`text-start w-100 p-8 rounded-8 transition-all ${
                          filters.category_id === category.id
                            ? "fw-semibold bg-gray-100"
                            : "hover:bg-gray-50"
                        }`}
                        style={{
                          color: filters.category_id === category.id ? "#374151" : "#6B7280",
                        }}
                      >
                        {category.name}{" "}
                        <span className="text-gray-500">
                          ({category.products_count || 0})
                        </span>
                      </button>

                      {/* ========== SUBCATEGORIES ========== */}
                      {filters.category_id === category.id &&
                        SubCategories.length > 0 && (
                          <ul className="ms-16 mt-8">
                            {SubCategories.map((sub) => (
                              <li key={sub.id} className="mb-8">
                                <button
                                  onClick={() => handleCategoryFilter(sub.id)}
                                  className={`text-start w-100 p-8 rounded-8 transition-all ${
                                    filters.category_id === sub.id
                                      ? "fw-semibold bg-gray-100"
                                      : "hover:bg-gray-50"
                                  }`}
                                  style={{
                                    color: filters.category_id === sub.id ? "#374151" : "#6B7280",
                                  }}
                                >
                                  └─ {sub.name} ({sub.products_count || 0})
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ========== PRICE FILTER ========== */}
              <div className="shop-sidebar__box border border-gray-200 rounded-16 p-32 mb-32" style={{ backgroundColor: "#FAFAFA" }}>
                <h6 className="text-lg fw-semibold border-bottom border-gray-300 pb-16 mb-24 d-flex align-items-center gap-8" style={{ color: "#6B7280" }}>
                  <span style={{ fontSize: "18px" }}>💰</span> Filter by Price
                </h6>
                
                {/* Price Input Fields */}
                <div className="d-flex gap-12 mb-24">
                  <div className="flex-grow-1">
                    <label className="text-xs text-gray-500 mb-6 d-block fw-medium">Min Price</label>
                    <div className="position-relative">
                      <span className="position-absolute start-0 top-50 translate-middle-y ms-12 text-gray-400">$</span>
                      <input
                        type="number"
                        min="0"
                        max="5000"
                        value={filters.price_min}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(5000, parseInt(e.target.value) || 0));
                          handlePriceFilter([val, filters.price_max]);
                        }}
                        className="form-control px-24 py-12 rounded-10 border border-gray-300 focus:border-gray-400 focus:shadow-sm"
                        style={{
                          paddingLeft: "28px",
                          backgroundColor: "white",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <label className="text-xs text-gray-500 mb-6 d-block fw-medium">Max Price</label>
                    <div className="position-relative">
                      <span className="position-absolute start-0 top-50 translate-middle-y ms-12 text-gray-400">$</span>
                      <input
                        type="number"
                        min="0"
                        max="5000"
                        value={filters.price_max}
                        onChange={(e) => {
                          const val = Math.max(filters.price_min, Math.min(5000, parseInt(e.target.value) || 5000));
                          handlePriceFilter([filters.price_min, val]);
                        }}
                        className="form-control px-24 py-12 rounded-10 border border-gray-300 focus:border-gray-400 focus:shadow-sm"
                        style={{
                          paddingLeft: "28px",
                          backgroundColor: "white",
                          fontSize: "14px",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Price Range Slider */}
                <div className="custom--range">
                  <ReactSlider
                    className="horizontal-slider"
                    thumbClassName="example-thumb"
                    trackClassName="example-track"
                    value={[filters.price_min, filters.price_max]}
                    onChange={handlePriceFilter}
                    min={0}
                    max={5000}
                    step={10}
                    renderThumb={(props, state) => {
                      const { key, ...restProps } = props;
                      return (
                        <div
                          {...restProps}
                          key={state.index}
                          className="price-thumb"
                        >
                        </div>
                      );
                    }}
                    pearling
                    minDistance={50}
                  />
                </div>

                {/* Price Display */}
                <div className="mt-20 p-16 bg-white rounded-10 border border-gray-200">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-sm text-gray-600">
                      Range: <strong className="text-gray-700">${filters.price_min}</strong> - <strong className="text-gray-700">${filters.price_max}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* ========== COLOR FILTER ========== */}
              <div className="shop-sidebar__box border border-gray-200 rounded-16 p-32 mb-32" style={{ backgroundColor: "#FAFAFA" }}>
                <h6 className="text-lg fw-semibold border-bottom border-gray-300 pb-16 mb-24 d-flex align-items-center gap-8" style={{ color: "#6B7280" }}>
                  <span style={{ fontSize: "18px" }}>🎨</span> Filter by Color
                </h6>
                <div className="d-flex flex-wrap gap-12">
                  {availableColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => handleColorFilter(color.value)}
                      className={`color-filter-btn position-relative ${
                        filters.colors.includes(color.value) ? "active" : ""
                      }`}
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        backgroundColor: color.hex,
                        border: filters.colors.includes(color.value)
                          ? "3px solid #9CA3AF"
                          : "2px solid #D1D5DB",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: filters.colors.includes(color.value)
                          ? "0 0 0 3px rgba(156, 163, 175, 0.2)"
                          : "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                      title={color.name}
                      onMouseEnter={(e) => {
                        if (!filters.colors.includes(color.value)) {
                          e.currentTarget.style.transform = "scale(1.1)";
                          e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!filters.colors.includes(color.value)) {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                        }
                      }}
                    >
                      {filters.colors.includes(color.value) && (
                        <span
                          className="position-absolute"
                          style={{
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            color: color.value === "white" || color.value === "yellow" ? "#000" : "#fff",
                            fontSize: "14px",
                            fontWeight: "bold",
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {filters.colors.length > 0 && (
                  <div className="mt-16">
                    <span className="text-sm" style={{ color: "#6B7280" }}>
                      Selected: {filters.colors.length} color(s)
                    </span>
                  </div>
                )}
              </div>

              {/* ========== RATING FILTER ========== */}
              <div className="shop-sidebar__box border border-gray-200 rounded-16 p-32 mb-32" style={{ backgroundColor: "#FAFAFA" }}>
                <h6 className="text-lg fw-semibold border-bottom border-gray-300 pb-16 mb-24 d-flex align-items-center gap-8" style={{ color: "#6B7280" }}>
                  <span style={{ fontSize: "18px" }}>⭐</span> Filter by Rating
                </h6>
                <div className="d-flex flex-column gap-10">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingFilter(rating)}
                      className={`rating-filter-btn text-start p-12 rounded-10 border transition-all ${
                        filters.rating === rating
                          ? "border-gray-400 bg-gray-100"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      style={{
                        color: filters.rating === rating ? "#374151" : "#6B7280",
                      }}
                    >
                      <div className="d-flex align-items-center gap-8">
                        <div className="d-flex gap-2">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className="text-sm"
                              style={{
                                color: i < rating ? "#D97706" : "#D1D5DB",
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm fw-medium">
                          {rating} {rating === 1 ? "Star" : "Stars"} & Up
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ========== AVAILABILITY FILTER ========== */}
              <div className="shop-sidebar__box border border-gray-200 rounded-16 p-32 mb-32" style={{ backgroundColor: "#FAFAFA" }}>
                <h6 className="text-lg fw-semibold border-bottom border-gray-300 pb-16 mb-24 d-flex align-items-center gap-8" style={{ color: "#6B7280" }}>
                  <span style={{ fontSize: "18px" }}>📦</span> Availability
                </h6>
                <div className="d-flex flex-column gap-10">
                  <button
                    onClick={() => handleStockFilter(true)}
                    className={`stock-filter-btn text-start p-12 rounded-10 border transition-all ${
                      filters.in_stock === true
                        ? "border-gray-400 bg-gray-100"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    style={{
                      color: filters.in_stock === true ? "#374151" : "#6B7280",
                    }}
                  >
                    <div className="d-flex align-items-center gap-8">
                      <span className="w-12 h-12 rounded-circle d-inline-block" style={{ backgroundColor: "#10B981" }}></span>
                      <span className="fw-medium">In Stock</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleStockFilter(false)}
                    className={`stock-filter-btn text-start p-12 rounded-10 border transition-all ${
                      filters.in_stock === false
                        ? "border-gray-400 bg-gray-100"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    style={{
                      color: filters.in_stock === false ? "#374151" : "#6B7280",
                    }}
                  >
                    <div className="d-flex align-items-center gap-8">
                      <span className="w-12 h-12 rounded-circle d-inline-block" style={{ backgroundColor: "#EF4444" }}></span>
                      <span className="fw-medium">Out of Stock</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* ========== DISCOUNT FILTER ========== */}
              <div className="shop-sidebar__box border border-gray-200 rounded-16 p-32 mb-32" style={{ backgroundColor: "#FAFAFA" }}>
                <h6 className="text-lg fw-semibold border-bottom border-gray-300 pb-16 mb-24 d-flex align-items-center gap-8" style={{ color: "#6B7280" }}>
                  <span style={{ fontSize: "18px" }}>🏷️</span> Special Offers
                </h6>
                <button
                  onClick={() => handleDiscountFilter(true)}
                  className={`discount-filter-btn w-100 text-start p-12 rounded-10 border transition-all ${
                    filters.discount === true
                      ? "border-gray-400 bg-gray-100"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                  style={{
                    color: filters.discount === true ? "#374151" : "#6B7280",
                  }}
                >
                  <div className="d-flex align-items-center gap-8">
                    <span style={{ fontSize: "18px" }}>🔥</span>
                    <span className="fw-medium">On Sale / Discounted Items</span>
                  </div>
                </button>
              </div>

              {/* ========== CLEAR FILTERS ========== */}
              <div className="shop-sidebar__box">
                <button
                  onClick={clearFilters}
                  type="button"
                  className="btn w-100 rounded-12 py-16 fw-semibold transition-all"
                  style={{
                    backgroundColor: "#9CA3AF",
                    border: "none",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#6B7280";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#9CA3AF";
                  }}
                >
                  <span className="me-8">✨</span> Clear All Filters
                </button>
              </div>

              {/* ADVERTISEMENT */}
              <div className="shop-sidebar__box rounded-8">
                <img
                  src="assets/images/thumbs/advertise-img1.png"
                  alt="advertisement"
                />
              </div>
            </div>
          </div>
          {/* SIDEBAR END */}

          {/* ========== CONTENT START ========== */}
          <div className="col-lg-9">
            {/* ========== TOP CONTROLS ========== */}
            <div className="flex-between gap-16 flex-wrap mb-40 p-20 rounded-12 border border-gray-300" style={{ backgroundColor: "#F9FAFB" }}>
              <span className="fw-semibold d-flex align-items-center gap-8" style={{ color: "#374151" }}>
                <span style={{ color: "#6B7280" }}>Showing</span>
                <strong style={{ color: "#374151" }}>
                  {pagination.current_page === 1
                    ? 1
                    : (pagination.current_page - 1) * pagination.per_page + 1}
                </strong>
                <span style={{ color: "#9CA3AF" }}>-</span>
                <strong style={{ color: "#374151" }}>
                  {Math.min(
                    pagination.current_page * pagination.per_page,
                    pagination.total
                  )}
                </strong>
                <span style={{ color: "#6B7280" }}>of</span>
                <strong style={{ color: "#374151" }}>{pagination.total}</strong>
                <span style={{ color: "#6B7280" }}>results</span>
              </span>

              <div className="position-relative flex-align gap-16 flex-wrap">
                {/* GRID/LIST TOGGLE */}
                <div className="list-grid-btns flex-align gap-16">
                  <button
                    onClick={() => setGrid(true)}
                    type="button"
                    className={`w-44 h-44 flex-center border rounded-10 text-2xl list-btn transition-all ${
                      grid === true 
                        ? "border-gray-400 text-white bg-gray-500" 
                        : "border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-100"
                    }`}
                    title="List View"
                  >
                    <i className="ph-bold ph-list-dashes" />
                  </button>
                  <button
                    onClick={() => setGrid(false)}
                    type="button"
                    className={`w-44 h-44 flex-center border rounded-10 text-2xl grid-btn transition-all ${
                      grid === false 
                        ? "border-gray-400 text-white bg-gray-500" 
                        : "border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-100"
                    }`}
                    title="Grid View"
                  >
                    <i className="ph ph-squares-four" />
                  </button>
                </div>

                {/* SORT DROPDOWN */}
                <div className="position-relative text-gray-700 flex-align gap-8">
                  <label
                    htmlFor="sorting"
                    className="text-inherit flex-shrink-0 fw-medium"
                  >
                    Sort by:
                  </label>
                  <select
                    value={filters.sort}
                    onChange={handleSortChange}
                    className="form-control common-input px-16 py-12 text-inherit rounded-10 w-auto border-2 border-gray-300 focus:border-gray-400 transition-all"
                    style={{ backgroundColor: "white" }}
                    id="sorting"
                    style={{
                      cursor: "pointer",
                      minWidth: "180px",
                    }}
                  >
                    <option value="newest">🆕 Newest</option>
                    <option value="oldest">🔚 Oldest</option>
                    <option value="cheap">💰 Price: Low to High</option>
                    <option value="expensive">💸 Price: High to Low</option>
                    <option value="a_to_z">🔤 A to Z</option>
                    <option value="z_to_a">🔤 Z to A</option>
                  </select>
                </div>

                {/* MOBILE SIDEBAR TOGGLE */}
                <button
                  onClick={sidebarController}
                  type="button"
                  className="w-44 h-44 d-lg-none d-flex flex-center border border-gray-300 rounded-10 text-2xl sidebar-btn bg-white transition-all"
                  title="Toggle Sidebar"
                  style={{
                    color: "#6B7280",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F3F4F6";
                    e.currentTarget.style.borderColor = "#9CA3AF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.borderColor = "#D1D5DB";
                  }}
                >
                  <i className="ph-bold ph-funnel" />
                </button>
              </div>
            </div>

            {/* ========== LOADING STATE ========== */}
            {Loading && (
              <div className="text-center py-80">
                <div className="spinner-border text-main-600" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {/* ========== PRODUCTS GRID ========== */}
            {!Loading && Products.length > 0 ? (
              <div className={`list-grid-wrapper ${grid && "list-view"}`}>
                {Products.map((product) => (
                  <ProductShopCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              !Loading && (
                <div className="text-center py-80 border border-gray-100 rounded-12">
                  <i className="ph ph-magnifying-glass text-6xl text-gray-300 mb-16" />
                  <p className="text-xl text-gray-600">
                    {searchQuery
                      ? "No products found for your search"
                      : "No products available"}
                  </p>
                </div>
              )
            )}

            {/* ========== PAGINATION START ========== */}
            {!Loading && pagination.last_page > 1 && (
              <ul className="pagination flex-center flex-wrap gap-16 mt-40">
                {pagination.current_page > 1 && (
                  <li className="page-item">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.current_page - 1)
                      }
                      className="page-link h-64 w-64 flex-center text-xxl rounded-10 fw-medium text-gray-600 border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all"
                    >
                      <i className="ph-bold ph-arrow-left" />
                    </button>
                  </li>
                )}

                {renderPagination()}

                {pagination.current_page < pagination.last_page && (
                  <li className="page-item">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.current_page + 1)
                      }
                      className="page-link h-64 w-64 flex-center text-xxl rounded-10 fw-medium text-gray-600 border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all"
                    >
                      <i className="ph-bold ph-arrow-right" />
                    </button>
                  </li>
                )}
              </ul>
            )}
            {/* PAGINATION END */}
          </div>
          {/* CONTENT END */}
        </div>
      </div>
    </section>
  );
};

export default ShopSection;
