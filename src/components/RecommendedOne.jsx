import React, { useEffect, useState } from "react";
import { getAllCategories, getRelatedProductsByCategoryId } from "../api/api";
import ProductCard from "./Card/ProductCard";

const RecommendedOne = () => {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [activeTab, setActiveTab] = useState("all");

  // ✅ عدد المنتجات اللي هتتعرض في كل قسم
  const limit = 12;

  // ✅ 1. جلب الفئات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        console.log("Categories:", res.data);
        setCategories(res.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // ✅ 2. جلب المنتجات لكل فئة
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        if (categories.length > 0) {
          const allData = {};
          for (const category of categories) {
            const res = await getRelatedProductsByCategoryId(category.id);
            console.log(`Products for ${category.name}:`, res.data);
            allData[category.id] = (res.data.products || []).slice(0, limit); // 👈 هنا limit
          }
          setProductsByCategory(allData);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
      }
    };
    fetchRelatedProducts();
  }, [categories]);

  // ✅ 3. كل المنتجات
  const allProducts = Object.values(productsByCategory).flat().slice(0, limit); // 👈 limit هنا كمان

  return (
    <section className="recommended">
      <div className="container container-lg">
        <div className="section-heading flex-between flex-wrap gap-16">
          <h5 className="mb-0 text-blue-900"> Distinctive glasses for you</h5>

          <ul
            className="nav common-tab nav-pills"
            id="pills-tab"
            role="tablist"
          >
            <li className="nav-item" role="presentation">
              <button
                className={`nav-link ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All
              </button>
            </li>
            {categories.map((category) => (
              <li className="nav-item" role="presentation" key={category.id}>
                <button
                  className={`nav-link ${
                    activeTab === category.id ? "active" : ""
                  }`}
                  onClick={() => setActiveTab(category.id)}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ✅ عرض المنتجات حسب التاب */}
        <div className="tab-content" id="pills-tabContent">
          <div className="row g-12">
            {activeTab === "all" ? (
              allProducts.length > 0 ? (
                allProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p className="text-center py-4 text-gray-500">
                  No products yet
                </p>
              )
            ) : productsByCategory[activeTab]?.length > 0 ? (
              productsByCategory[activeTab].map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">
                There are no products in this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecommendedOne;
