import { useState } from "react";
import { Link } from "react-router-dom";
import { addToCart, addToWishlist } from "../../api/api";
import { Badge, Heart } from "lucide-react";

const ProductCard = ({ product, isSlider = false }) => {
  const {
    id,
    name,
    sku,
    thumb_image,
    discount,
    discount_type,
    pack_sizes,
    average_rating,
    sold_count,
    total_stock,
    max_order_quantity,
    stock,
    is_favorite,
  } = product;

  const [isFavorite, setIsFavorite] = useState(is_favorite || false);
  const basePrice = parseFloat(pack_sizes?.[0]?.price || 0);
  const finalPrice =
    discount_type === "percentage"
      ? basePrice - (basePrice * discount) / 100
      : basePrice - parseFloat(discount || 0);

  const sold = sold_count || 0;
  const total = total_stock || 100;
  const soldPercent = Math.min((sold / Math.max(total, 1)) * 100, 100);

  const toNonNegative = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    if (num < 0) return 0;
    return num;
  };

  const primaryPack =
    Array.isArray(pack_sizes) && pack_sizes.length ? pack_sizes[0] : null;
  const packStockValue = toNonNegative(
    primaryPack?.stock ??
      primaryPack?.quantity ??
      primaryPack?.available_quantity ??
      primaryPack?.available_stock
  );
  const aggregateStockValue = toNonNegative(
    total_stock ?? stock ?? product?.quantity ?? product?.available_quantity
  );
  const maxOrderLimitValue = toNonNegative(max_order_quantity);

  let effectiveAvailable = null;
  if (maxOrderLimitValue !== null && aggregateStockValue !== null) {
    effectiveAvailable = Math.min(maxOrderLimitValue, aggregateStockValue);
  } else if (maxOrderLimitValue !== null) {
    effectiveAvailable = maxOrderLimitValue;
  } else if (aggregateStockValue !== null) {
    effectiveAvailable = aggregateStockValue;
  }
  if (packStockValue !== null) {
    effectiveAvailable =
      effectiveAvailable !== null
        ? Math.min(effectiveAvailable, packStockValue)
        : packStockValue;
  }

  const isOutOfStock =
    (maxOrderLimitValue !== null && maxOrderLimitValue <= 0) ||
    (effectiveAvailable !== null && effectiveAvailable <= 0);
  const addToCartClass = `product-card__cart btn bg-gray-50 text-heading py-11 px-24 rounded-8 flex-center gap-8 fw-medium w-100 ${
    isOutOfStock ? "opacity-60 cursor-not-allowed" : "hover-bg-main-600 hover-text-white"
  }`;

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    try {
      await addToWishlist(id);
      setIsFavorite((prev) => !prev);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };
  const handelAddToCartClick = async (productId) => {
    if (isOutOfStock) return;
    try {
      await addToCart(productId);
    } catch (error) {}
  };
  return (
    <div className={`${!isSlider ? "col-xxl-2 col-lg-3 col-sm-4 col-6" : ""}`}>
      <div className="product-card h-100 p-16 border border-gray-100 hover-border-main-600 rounded-16 position-relative transition-2 group">
        {/* ✅ صورة المنتج */}
        <Link
          to={`/product-details/${id}`}
          className="product-card__thumb flex-center rounded-8 bg-gray-50 position-relative overflow-hidden"
        >
          <img src={thumb_image} alt={name} className="img-fluid" width={150} />
          <Badge className="position-absolute inset-inline-end-0 inset-block-start-0">
            {sku}
          </Badge>

          {/* ❤️ زر المفضلة في المنتصف يمين الصورة */}

          {discount && Number(discount) > 0 ? (
            <span className="product-card__badge bg-primary-600 px-8 py-4 text-sm text-white position-absolute inset-inline-start-0 inset-block-start-0">
              {discount_type === "percentage"
                ? `${discount}% OFF`
                : `-${discount}$`}
            </span>
          ) : null}
        </Link>

        {/* ✅ تفاصيل المنتج */}
        <div className="product-card__content mt-16">
          <h6 className="title text-lg fw-semibold mt-12 mb-8">
            <Link
              to={`/product-details/${id}`}
              className="link text-line-2"
              tabIndex={0}
            >
              {name}
            </Link>
          </h6>

          <div className="flex-align mb-20 mt-16 gap-6">
            <span className="text-xs fw-medium text-gray-500">
              {average_rating}
            </span>
            <span className="text-15 fw-medium text-warning-600 d-flex">
              <i className="ph-fill ph-star" />
            </span>
            <span className="text-xs fw-medium text-gray-500">(17k)</span>
          </div>

          <div className="mt-8">
            <div
              className="progress w-100 bg-color-three rounded-pill h-4"
              role="progressbar"
              aria-valuenow={35}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-bar bg-main-two-600 rounded-pill"
                style={{ width: `${soldPercent}%` }}
              />
            </div>
            <span className="text-gray-900 text-xs fw-medium mt-8">
              Sold: {sold} / {total}
            </span>
          </div>

          <div className="product-card__price my-20 flex-between align-content-between">
            {discount ? (
              <>
                <span className="text-gray-400 text-md fw-semibold text-decoration-line-through">
                  ${basePrice.toFixed(2)}
                </span>
                <span className="text-heading text-md fw-semibold ">
                  ${finalPrice.toFixed(2)}{" "}
                  <span className="text-gray-500 fw-normal">/EGP</span>{" "}
                </span>
              </>
            ) : (
              <span className="text-heading text-md fw-semibold ">
                ${basePrice.toFixed(2)}{" "}
                <span className="text-gray-500 fw-normal">/EGP</span>{" "}
              </span>
            )}
          </div>
          <div className="flex flex-between w-100">
            <button
              onClick={() => handelAddToCartClick(id)}
              className={addToCartClass}
              tabIndex={0}
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
            <button
              onClick={handleWishlistToggle}
              title="Add To Favorites"
              className=" group-hover:opacity-100 transition duration-300 bg-white/90 rounded-full p-2 hover:bg-main-600 hover:text-white"
            >
              {isFavorite ? (
                <Heart
                  size={20}
                  style={{ color: "red" }}
                  className={
                    isFavorite
                      ? "fill-red-500 text-red-500 text-lg"
                      : "text-gray-600"
                  }
                />
              ) : (
                <Heart
                  size={20}
                  className={
                    isFavorite
                      ? "fill-red-500 text-red-500 text-lg"
                      : "text-gray-600"
                  }
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
