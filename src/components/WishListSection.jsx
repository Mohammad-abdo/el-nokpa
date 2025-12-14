import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  addToCart,
  addToWishlist,
  getWishlistItems,
  publicApi,
  getLocalWishlistItems,
  setLocalWishlistItems,
} from "../api/api";
import Cookies from "universal-cookie";

const WishListSection = () => {
  const [wishlist, setWishlist] = useState([]);
  const cookies = new Cookies();
  const token = cookies.get("token");
  const userId = cookies.get("userId");

  const getWishlistData = useCallback(async () => {
    try {
      if (!token) {
        const guestItems = getLocalWishlistItems();
        if (!guestItems.length) {
          setWishlist([]);
          return;
        }
        const resolved = await Promise.all(
          guestItems.map(async (entry) => {
            try {
              const res = await publicApi.get(`shop/products/${entry.id}`);
              return res.data?.data || null;
            } catch (error) {
              console.error("Error fetching guest wishlist product:", error);
              return null;
            }
          })
        );
        const products = resolved.filter(Boolean);
        setWishlist(products);
        setLocalWishlistItems(products.map((item) => ({ id: item?.id })));
        return;
      }

      const res = await getWishlistItems();
      setWishlist(res.data || res || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      if (!token) {
        setLocalWishlistItems([]);
      }
    }
  }, [token]);

  useEffect(() => {
    getWishlistData();
  }, [userId, getWishlistData]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      if (!cookies.get("token")) {
        getWishlistData();
      }
    };
    window.addEventListener("local-wishlist-changed", handler);
    return () => {
      window.removeEventListener("local-wishlist-changed", handler);
    };
  }, [token, getWishlistData]);

  const toNonNegative = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    if (num < 0) return 0;
    return num;
  };

  const getProductAvailability = (productData) => {
    if (!productData) {
      return { isOutOfStock: true };
    }
    const primaryPack =
      Array.isArray(productData.pack_sizes) && productData.pack_sizes.length
        ? productData.pack_sizes[0]
        : null;
    const packStock = toNonNegative(
      primaryPack?.stock ??
        primaryPack?.quantity ??
        primaryPack?.available_quantity ??
        primaryPack?.available_stock
    );
    const aggregateStock = toNonNegative(
      productData.total_stock ??
        productData.stock ??
        productData.available_quantity ??
        productData.quantity
    );
    const maxOrderLimit = toNonNegative(
      productData.max_order_quantity ?? productData.max_qty
    );

    let effectiveAvailable = null;
    if (maxOrderLimit !== null && aggregateStock !== null) {
      effectiveAvailable = Math.min(maxOrderLimit, aggregateStock);
    } else if (maxOrderLimit !== null) {
      effectiveAvailable = maxOrderLimit;
    } else if (aggregateStock !== null) {
      effectiveAvailable = aggregateStock;
    }
    if (packStock !== null) {
      effectiveAvailable =
        effectiveAvailable !== null
          ? Math.min(effectiveAvailable, packStock)
          : packStock;
    }

    const isOutOfStock =
      (maxOrderLimit !== null && maxOrderLimit <= 0) ||
      (effectiveAvailable !== null && effectiveAvailable <= 0);

    return { isOutOfStock };
  };

  const handleWishlistToggle = async (id) => {
    try {
      const result = await addToWishlist(id);
      if (result?.status === "removed") {
        setWishlist((prev) =>
          prev.filter((item) => (item.id ?? item.product?.id) !== id)
        );
        return;
      }
      await getWishlistData();
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };
  const handelAddToCartClick = async (productData) => {
    const { isOutOfStock } = getProductAvailability(productData);
    if (isOutOfStock) return;
    try {
      await addToCart(productData.id);
    } catch (error) {}
  };
  return (
    <section className="cart py-80">
      <div className="container container-lg">
        <div className="row gy-4">
          <div className="col-lg-11">
            <div className="cart-table border border-gray-100 rounded-8">
              <div className="overflow-x-auto scroll-sm scroll-sm-horizontal">
                <table className="table rounded-8 overflow-hidden">
                  <thead>
                    <tr className="border-bottom border-neutral-100">
                      <th className="h6 mb-0 text-lg fw-bold px-40 py-32 border-end border-neutral-100">
                        Delete
                      </th>
                      <th className="h6 mb-0 text-lg fw-bold px-40 py-32 border-end border-neutral-100">
                        Product Name
                      </th>
                      <th className="h6 mb-0 text-lg fw-bold px-40 py-32 border-end border-neutral-100">
                        Unit Price
                      </th>
                      <th className="h6 mb-0 text-lg fw-bold px-40 py-32 border-end border-neutral-100">
                        Stock Status
                      </th>
                      <th className="h6 mb-0 text-lg fw-bold px-40 py-32">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {wishlist.length > 0 ? (
                      wishlist.map((product) => {
                        const {
                          id,
                          name,
                          thumb_image,
                          discount,
                          discount_type,
                          pack_sizes,
                          is_favorite,
                        } = product;

                        const basePrice = parseFloat(
                          pack_sizes?.[0]?.price || 100
                        );
                        const finalPrice =
                          discount_type === "percentage"
                            ? basePrice - (basePrice * discount) / 100
                            : basePrice - parseFloat(discount || 0);
                        const { isOutOfStock } =
                          getProductAvailability(product);
                        const addToCartClass = `btn btn-main-two rounded-8 px-64 ${
                          isOutOfStock ? "opacity-60 cursor-not-allowed" : ""
                        }`;

                        return (
                          <tr key={id}>
                            <td className="px-40 py-32 border-end border-neutral-100">
                              <button
                                type="button"
                                className="remove-tr-btn flex-align gap-12 hover-text-danger-600"
                                onClick={() => handleWishlistToggle(id)}
                              >
                                <i className="ph ph-x-circle text-2xl d-flex" />
                                Remove
                              </button>
                            </td>

                            <td className="px-40 py-32 border-end border-neutral-100">
                              <div className="table-product d-flex align-items-center gap-24">
                                <Link
                                  to={`/product-details/${id}`}
                                  className="table-product__thumb border border-gray-100 rounded-8 flex-center "
                                >
                                  <img
                                    src={thumb_image}
                                    alt={name}
                                    width={80}
                                    height={80}
                                    className="rounded-8 object-cover"
                                  />
                                </Link>
                                <div className="table-product__content text-start">
                                  <h6 className="title text-lg fw-semibold mb-8">
                                    <Link
                                      to={`/product-details/${id}`}
                                      className="link text-line-2"
                                    >
                                      {name}
                                    </Link>
                                  </h6>
                                </div>
                              </div>
                            </td>

                            <td className="px-40 py-32 border-end border-neutral-100">
                              <span className="text-lg h6 mb-0 fw-semibold">
                                ${finalPrice.toFixed(2)}
                              </span>
                            </td>

                            <td className="px-40 py-32 border-end border-neutral-100">
                              <span
                                className={`text-lg h6 mb-0 fw-semibold ${
                                  isOutOfStock ? "text-danger" : "text-success"
                                }`}
                              >
                                {isOutOfStock ? "Out of Stock" : "In Stock"}
                              </span>
                            </td>

                            <td className="px-40 py-32">
                              <button
                                className={addToCartClass}
                                onClick={() => handelAddToCartClick(product)}
                                disabled={isOutOfStock}
                              >
                                {isOutOfStock ? (
                                  "Out of Stock"
                                ) : (
                                  <>
                                    Add To Cart <i className="ph ph-shopping-cart" />
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-40">
                          No items in your wishlist.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WishListSection;
