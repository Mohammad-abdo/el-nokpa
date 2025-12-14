import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QuantityControl from "../helper/QuantityControl";
import Cookies from "universal-cookie";
import {
  api,
  clearCart,
  publicApi,
  removeFromCart,
  updateQuantity,
  getLocalCartItems,
  updateLocalCartItemQuantity,
  removeLocalCartItem,
  clearLocalCartStorage,
  setLocalCartItems,
} from "../api/api";
import Swal from "sweetalert2";

const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const toNonNegative = (value) => {
  const numberValue = toNumber(value);
  if (numberValue === null) return null;
  if (numberValue < 0) return 0;
  return numberValue;
};

const selectProduct = (item) =>
  item && typeof item === "object" ? item.product ?? item : null;

const selectPack = (item) => {
  const product = selectProduct(item);
  const packSource = Array.isArray(item?.pack_sizes)
    ? item.pack_sizes
    : Array.isArray(product?.pack_sizes)
    ? product.pack_sizes
    : [];
  if (!packSource.length) return null;
  const targetPackId =
    item?.pack_size_id ??
    item?.packSizeId ??
    item?.selected_pack_size_id ??
    item?.pack_size?.id ??
    product?.pack_size_id ??
    null;
  if (targetPackId === null || targetPackId === undefined) {
    return packSource[0];
  }
  const normalizedTarget = String(targetPackId);
  return (
    packSource.find((pack) => {
      const packId =
        pack?.id ??
        pack?.pack_size_id ??
        pack?.value ??
        pack?.packSizeId ??
        pack?.packsize_id;
      if (packId === null || packId === undefined) return false;
      return String(packId) === normalizedTarget;
    }) ?? packSource[0]
  );
};

const getMaxQuantityForItem = (item) => {
  const product = selectProduct(item);
  if (!product) return null;
  const pack = selectPack(item);
  const candidates = [];
  const pushCandidate = (value) => {
    const numericValue = toNumber(value);
    if (numericValue === null) return;
    if (numericValue <= 0) {
      candidates.push(0);
      return;
    }
    candidates.push(Math.floor(numericValue));
  };
  [
    product.max_order_quantity,
    product.maximum_order_quantity,
    product.max_order_qty,
    product.max_qty,
    product.purchase_limit,
    product.order_limit,
    product.limit_per_customer,
    item?.max_order_quantity,
    item?.max_qty,
    item?.limit,
  ].forEach(pushCandidate);
  if (pack) {
    [
      pack.max_order_quantity,
      pack.max_qty,
      pack.limit,
      pack.stock,
      pack.quantity,
      pack.available_quantity,
      pack.available_stock,
    ].forEach(pushCandidate);
  }
  [
    item?.available_quantity,
    item?.stock,
    product.available_quantity,
    product.available_stock,
    product.total_stock,
    product.stock,
    product.quantity,
  ].forEach(pushCandidate);
  if (!candidates.length) return null;
  return Math.min(...candidates);
};

const getAvailableStockForItem = (item) => {
  const product = selectProduct(item);
  if (!product) return null;
  const pack = selectPack(item);
  const prioritized = [
    pack?.stock,
    pack?.quantity,
    pack?.available_quantity,
    pack?.available_stock,
    item?.available_quantity,
    item?.stock,
    product.available_quantity,
    product.available_stock,
    product.total_stock,
    product.stock,
    product.quantity,
  ];
  let fallbackZero = null;
  for (const value of prioritized) {
    const parsed = toNonNegative(value);
    if (parsed === null) continue;
    if (parsed === 0) {
      if (fallbackZero === null) fallbackZero = 0;
      continue;
    }
    return parsed;
  }
  return fallbackZero;
};

const CartSection = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, total: 0 });
  const [loadingItem, setLoadingItem] = useState(null);

  const cookies = new Cookies();
  const token = cookies.get("token");
  const userId = cookies.get("userId");

  const notifyQuantityLimit = (limit) => {
    Swal.fire({
      icon: "info",
      title: "تم بلوغ الحد المتاح",
      text: `يمكنك طلب ${limit} كحد أقصى من هذا المنتج`,
      timer: 1800,
      showConfirmButton: false,
    });
  };

  const applyMaxQuantity = (items) => {
    if (!Array.isArray(items)) return [];
    return items.map((entry) => {
      const maxQuantity = getMaxQuantityForItem(entry);
      if (!maxQuantity) {
        if (entry?.quantity === undefined) {
          return { ...entry, quantity: entry?.quantity ?? 1 };
        }
        return entry;
      }
      const currentQuantity =
        entry?.quantity ?? entry?.qty ?? entry?.amount ?? 1;
      if (currentQuantity <= maxQuantity) {
        if (entry?.quantity === undefined) {
          return { ...entry, quantity: currentQuantity };
        }
        return entry;
      }
      return { ...entry, quantity: maxQuantity };
    });
  };

  // 🟢 جلب بيانات السلة

  const fetchCart = useCallback(async () => {
    if (!token) {
      const guestItems = getLocalCartItems();
      if (guestItems.length === 0) {
        setCartItems([]);
        updateTotals([]);
        return;
      }

      try {
        const resolved = await Promise.all(
          guestItems.map(async (entry) => {
            try {
              const res = await publicApi.get(`shop/products/${entry.id}`);
              const productData = res.data?.data;
              if (!productData) {
                return null;
              }
              return {
                product: productData,
                quantity: entry.quantity ?? 1,
                pack_size_id: entry.pack_size_id ?? 2,
                id: entry.id,
              };
            } catch (error) {
              console.error("Error fetching guest cart product:", error);
              return null;
            }
          })
        );

        const hydrated = resolved.filter(Boolean);
        if (!hydrated.length) {
          setCartItems([]);
          updateTotals([]);
          setLocalCartItems([]);
          return;
        }

        const normalizedProducts = applyMaxQuantity(hydrated);
        const storageReady = normalizedProducts.map((item) => ({
          id: item.product?.id ?? item.id,
          pack_size_id: item.pack_size_id ?? 2,
          quantity: item.quantity ?? 1,
        }));
        setLocalCartItems(storageReady);
        setCartItems(normalizedProducts);
        updateTotals(normalizedProducts);
      } catch (error) {
        console.error("Error fetching local products:", error);
        setCartItems([]);
        updateTotals([]);
      }

      return;
    }

    try {
      const res = await api.get(`/cart`);
      const cartData = res.data?.data || [];
      const normalizedCart = applyMaxQuantity(cartData);
      setCartItems(normalizedCart);
      updateTotals(normalizedCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setCartItems([]);
      updateTotals([]);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [userId, fetchCart]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      if (!cookies.get("token")) {
        fetchCart();
      }
    };
    window.addEventListener("local-cart-changed", handler);
    return () => {
      window.removeEventListener("local-cart-changed", handler);
    };
  }, [token, fetchCart]);

  // 🟢 حذف منتج من السلة
  const handleRemove = async (id, size) => {
    try {
      if (!token) {
        removeLocalCartItem(id, size);
        const updatedCart = cartItems.filter(
          (item) => (item.product?.id ?? item?.id) !== id
        );
        setCartItems(updatedCart);
        updateTotals(updatedCart);
        return;
      }
      await removeFromCart(id, size);
      const updatedCart = cartItems.filter(
        (item) => (item.product?.id ?? item?.id) !== id
      );
      setCartItems(updatedCart);
      updateTotals(updatedCart);
      fetchCart();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("local-cart-changed"));
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // 🟢 تحديث الكمية في السيرفر
  const handleQuantityChange = async (
    productId,
    attemptedQuantity,
    packSizeId,
    maxQuantity
  ) => {
    try {
      setLoadingItem(productId);
      const limit =
        maxQuantity && maxQuantity > 0 ? Math.floor(maxQuantity) : null;
      let safeQuantity = Math.max(1, attemptedQuantity);
      if (limit !== null && safeQuantity > limit) {
        safeQuantity = limit;
        notifyQuantityLimit(limit);
      }

      const updatedCart = cartItems.map((item) => {
        const itemProductId = item.product?.id ?? item?.id;
        if (itemProductId !== productId) return item;
        return { ...item, quantity: safeQuantity };
      });
      setCartItems(updatedCart);
      updateTotals(updatedCart);

      const currentItem = cartItems.find(
        (item) => (item.product?.id ?? item?.id) === productId
      );
      const currentQuantity =
        currentItem?.quantity ?? currentItem?.qty ?? currentItem?.amount ?? 1;
      if (safeQuantity === currentQuantity) {
        setLoadingItem(null);
        return;
      }

      if (!token) {
        updateLocalCartItemQuantity(productId, safeQuantity, packSizeId);
        setLoadingItem(null);
        return;
      }

      await updateQuantity(productId, safeQuantity, packSizeId);
      await fetchCart();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("local-cart-changed"));
      }
    } catch (error) {
      console.error("❌ Error updating quantity:", error);
    } finally {
      setLoadingItem(null);
    }
  };

  // 🧮 تحديث الإجماليات
  const updateTotals = (data) => {
    const subtotal = data.reduce(
      (acc, item) =>
        acc + parseFloat(item.product?.price || 0) * (item.quantity || 1),
      0
    );
    const tax = subtotal * 0.05;
    setTotals({ subtotal, tax, total: subtotal + tax });
  };

  const removeCart = async () => {
    try {
      if (!token) {
        clearLocalCartStorage();
        setCartItems([]);
        updateTotals([]);
        Swal.fire({
          icon: "success",
          title: "Cart cleared successfully  🗑️",
          text: "تمت إزالة المنتج من السلة.",
          showConfirmButton: false,
          timer: 1500,
        });
        return;
      }
      await clearCart();
      Swal.fire({
        icon: "success",
        title: "Cart cleared successfully  🗑️",
        text: "تمت إزالة المنتج من السلة.",
        showConfirmButton: false,
        timer: 1500,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("local-cart-changed"));
      }
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="cart py-80">
      <div className="container container-lg">
        <div className="row gy-4">
          <div className="col-xl-12 col-lg-12">
            <div className="section-title">
              <button
                onClick={removeCart}
                className="text-main-600 fw-semibold btn  flex-align gap-12 border-bottom border-main-600"
              >
                Clear Cart Items
              </button>
            </div>
          </div>

          {/* 🛒 جدول السلة */}
          <div className="col-xl-9 col-lg-8">
            <div className="cart-table border border-gray-100 rounded-8 px-30 py-30">
              <div className="overflow-x-auto scroll-sm scroll-sm-horizontal">
                <table className="table style-three">
                  <thead>
                    <tr>
                      <th>Delete</th>
                      <th>Product Name</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.length > 0 ? (
                      cartItems.map((item) => {
                        const productRef = item.product ?? item;
                        const maxQuantity = getMaxQuantityForItem(item);
                        const availableStock = getAvailableStockForItem(item);
                        const isOutOfStock =
                          (availableStock !== null && availableStock <= 0) ||
                          (maxQuantity !== null && maxQuantity <= 0);
                        const currentQuantity = item.quantity ?? item.qty ?? 1;
                        const initialQuantity =
                          maxQuantity && maxQuantity > 0
                            ? Math.min(currentQuantity, maxQuantity)
                            : currentQuantity;
                        const linePrice = Number(productRef?.price) || 0;
                        const quantityForTotal = item.quantity ?? initialQuantity;
                        const lineTotal = (linePrice * quantityForTotal).toFixed(2);

                        return (
                          <tr key={item.id}>
                            {/* حذف */}
                            <td>
                              <button
                                onClick={() =>
                                  handleRemove(
                                    productRef?.id ?? item.id,
                                    item.pack_size_id
                                  )
                                }
                                className="remove-tr-btn flex-align gap-12 hover-text-danger-600"
                              >
                                <i className="ph ph-x-circle text-2xl d-flex" />
                                Remove
                              </button>
                            </td>

                            {/* معلومات المنتج */}
                            <td>
                              <div className="table-product d-flex align-items-center gap-24">
                                <Link
                                  to={`/product-details/${productRef?.id}`}
                                  className="table-product__thumb border border-gray-100 rounded-8 flex-center"
                                >
                                  <img
                                    src={
                                      productRef?.thumb_image ||
                                      "assets/images/thumbs/product-two-img1.png"
                                    }
                                    alt={productRef?.name || "Product"}
                                    className="img-fluid"
                                    height={100}
                                  />
                                </Link>
                                <div className="table-product__content text-start">
                                  <h6 className="title text-lg fw-semibold mb-8">
                                    <Link
                                      to={`/product/${productRef?.id}`}
                                      className="link text-line-2"
                                    >
                                      {productRef?.name}
                                    </Link>
                                  </h6>
                                  <div className="text-sm text-gray-500">
                                    {item.category_name || "Category"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* السعر */}
                            <td>
                              <span className="text-lg fw-semibold">
                                ${linePrice.toFixed(2)}
                              </span>
                            </td>

                            {/* الكمية */}
                            <td>
                              <QuantityControl
                                initialQuantity={initialQuantity}
                                maxQuantity={maxQuantity}
                                disabled={isOutOfStock}
                                onLimit={notifyQuantityLimit}
                                onChange={(newQuantity) =>
                                  handleQuantityChange(
                                    productRef?.id ?? item.id,
                                    newQuantity,
                                    item.pack_size_id,
                                    maxQuantity
                                  )
                                }
                              />
                            </td>

                            {/* الإجمالي الفرعي */}
                            <td>
                              <span className="text-lg fw-semibold">
                                ${lineTotal}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-gray-500">
                          Cart is empty
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 🧾 المجموع الكلي */}
          <div className="col-xl-3 col-lg-4">
            <div className="cart-sidebar border border-gray-100 rounded-8 px-24 py-40">
              <h6 className="text-xl mb-32">Cart Totals</h6>
              <div className="bg-color-three rounded-8 p-24">
                <div className="mb-32 flex-between">
                  <span className="text-gray-900">Subtotal</span>
                  <span className="text-gray-900 fw-semibold">
                    ${totals.subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="mb-32 flex-between">
                  <span className="text-gray-900">Tax</span>
                  <span className="text-gray-900 fw-semibold">
                    ${totals.tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex-between">
                  <span className="text-gray-900 text-xl fw-semibold">
                    Total
                  </span>
                  <span className="text-gray-900 text-xl fw-semibold">
                    ${totals.total.toFixed(2)}
                  </span>
                </div>
              </div>
              {token ? (
                cartItems.length > 0 ? (
                  <Link
                    to="/checkout"
                    className="btn btn-main mt-40 py-18 w-100 rounded-8"
                  >
                    Proceed to checkout
                  </Link>
                ) : (
                  <button
                    className="btn btn-main mt-40 py-18 w-100 rounded-8"
                    onClick={() => {
                      Swal.fire({
                        icon: "warning",
                        title: "Cart is empty",
                        text: "Please add products to your cart first.",
                        confirmButtonText: "Go to Shop",
                      }).then(() => {
                        window.location.href = "/shop"; // توجيه المستخدم للمتجر
                      });
                    }}
                  >
                    Proceed to checkout
                  </button>
                )
              ) : (
                <button
                  className="btn btn-main mt-40 py-18 w-100 rounded-8 opacity-70 cursor-not-allowed"
                  onClick={() =>
                    Swal.fire({
                      icon: "warning",
                      title: "Login required",
                      text: "Please log in to proceed to payment",
                      confirmButtonText: "OK",
                    })
                  }
                >
                  Proceed to checkout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartSection;
