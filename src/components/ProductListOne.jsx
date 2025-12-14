import React, { useEffect, useState } from "react";
import { getProducts } from "../api/api";
import ProductCard from "./Card/ProductCard";

const ProductListOne = () => {
  const [Products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      // ✅ تأكد إنك بتطبع لترى شكل البيانات
      //   console.log("Products:", res);

      // بعض الـ APIs بترجع المنتجات داخل res.data.data
      const productsArray = res.data || res.data?.data || [];
      setProducts(productsArray);
    } catch (error) {
      console.log("Error fetching products:", error);
    }
  };

  return (
    <div className="product mt-24">
      <div className="container container-lg">
        <div className="row gy-4 g-12">
          {/* ✅ عرض أول 5 منتجات فقط */}
          {Products.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductListOne;
