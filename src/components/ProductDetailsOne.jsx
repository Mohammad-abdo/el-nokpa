import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Slider from "react-slick";
import Cookies from "universal-cookie";
import {
  addToCart,
  addToWishlist,
  getProductById,
  getProductReviews,
  addProductReview,
  updateQuantity,
} from "../api/api";
import { getCountdown } from "../helper/Countdown";
import ProductReviews from "./Reviews/ProductReviews";
import NewArrivalTwo from "./NewArrivalTwo";

const ProductDetailsOne = () => {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [isFavorite, setIsFavorite] = useState();
  const [productData, setProductData] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(getCountdown());
  const handleWishlistToggle = async () => {
    try {
      await addToWishlist(productData.id);
      setIsFavorite((prev) => !prev);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    }
  };
  const handelAddToCartClick = async (productId) => {
    try {
      await addToCart(productData.id);
    } catch (error) {}
  };
  useEffect(() => {
    getProduct();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getCountdown()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getProduct = async () => {
    try {
      const response = await getProductById(id);
      const data = response.data;
      console.log("✅ Product Data:", data);

      // ✅ تعيين أول حجم متاح
      setSelectedPack(data.pack_sizes?.[0]);

      // ✅ تعيين البيانات الكاملة للمنتج
      setProductData(data);
      setProducts(data.related_products);

      // ✅ تعيين الصورة الرئيسية
      setMainImage(data.thumb_image);

      // ✅ تعيين حالة المفضلة
      setIsFavorite(data.is_favorite || false);
    } catch (err) {
      console.error("❌ Error fetching product:", err);
      setError("حدث خطأ أثناء تحميل المنتج");
    } finally {
      setLoading(false);
    }
  };

  const incrementQuantity = async () => {
    try {
      const res = await updateQuantity();
      setQuantity(res.quantity);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const decrementQuantity = () =>
    setQuantity(quantity > 1 ? quantity - 1 : quantity);

  const settingsThumbs = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    focusOnSelect: true,
  };

  if (loading) return <p className="text-center py-5">جاري تحميل المنتج...</p>;
  if (error) return <p className="text-center text-danger py-5">{error}</p>;
  if (!productData) return null;

  // 🧮 حساب السعر بعد الخصم (لو موجود)
  // const selectedPack = productData.pack_sizes?.[0];
  const originalPrice = selectedPack ? parseFloat(selectedPack.price) : 0;
  const discount =
    productData.discount_type === "percentage"
      ? (originalPrice * productData.discount) / 100
      : parseFloat(productData.discount);
  const finalPrice = originalPrice - (discount || 0);

  const handleOptionChange = (attributeId, optionId, optionValue) => {
    setProductData((prev) => ({
      ...prev,
      attributes: prev.attributes.map((attr) =>
        attr.id === attributeId
          ? { ...attr, selected_option: { id: optionId, value: optionValue } }
          : attr
      ),
    }));

    // ✅ لو حبيت تحدث الـ API مباشرة بعد التغيير
    // try {
    //   await updateProductOptionAPI(productData.id, attributeId, optionId);
    // } catch (err) {
    //   console.error("Error updating option:", err);
    // }
  };

  return (
    <>
      <section className="product-details py-80">
        <div className="container container-lg">
          <div className="row gy-4">
            <div className="col-lg-9">
              <div className="row gy-4">
                <div className="col-xl-6">
                  <div className="product-details__left">
                    {/* ✅ الصورة الرئيسية للمنتج */}
                    <div className="product-details__thumb-slider border border-gray-100 rounded-16">
                      <div className="product-details__thumb flex-center h-100">
                        <img
                          src={mainImage || productData.thumb_image}
                          alt="Main Product"
                          className="img-fluid rounded-16"
                        />
                      </div>
                    </div>

                    {/* ✅ الصور المصغّرة */}
                    <div className="mt-24">
                      <div className="product-details__images-slider">
                        <Slider {...settingsThumbs}>
                          {productData.images?.length ? (
                            productData.images.map((image, index) => (
                              <div
                                key={index}
                                className="center max-w-120 max-h-120 h-100 flex-center border border-gray-100 rounded-16 p-8 cursor-pointer"
                                onClick={() => setMainImage(image.path)}
                              >
                                <img
                                  className="thum img-fluid rounded-8"
                                  src={image.path}
                                  alt={`Thumbnail ${index}`}
                                />
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-500">
                              لا توجد صور متاحة
                            </p>
                          )}
                        </Slider>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-6">
                  <div className="product-details__content">
                    <h5 className="mb-12">{productData.name}</h5>
                    <div className="flex-align flex-wrap gap-12">
                      <div className="flex-align gap-12 flex-wrap">
                        <div className="flex-align gap-8">
                          {productData.average_rating &&
                          !isNaN(productData.average_rating) ? (
                            <>
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className="text-15 fw-medium d-flex"
                                >
                                  <i
                                    className={`ph-fill ph-star ${
                                      i <
                                      Math.round(
                                        Number(
                                          productData.average_rating || 0
                                        ).toFixed(1)
                                      )
                                        ? "text-warning-600"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </span>
                              ))}
                              <span className="text-xs fw-bold text-gray-600 ms-2">
                                (
                                {Number(
                                  productData.average_rating || 0
                                ).toFixed(1)}
                                )
                              </span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">
                              لا توجد تقييمات بعد
                            </span>
                          )}
                        </div>
                        <span className="text-sm fw-medium text-neutral-600">
                          {productData.average_rating &&
                          !isNaN(productData.average_rating)
                            ? `تقييم ${Number(productData.average_rating).toFixed(
                                1
                              )} نجوم`
                            : "لا توجد تقييمات بعد"}
                        </span>
                        <span className="text-sm fw-medium text-neutral-600">
                          {productData.average_rating &&
                          !isNaN(productData.average_rating)
                            ? `تقييم ${Number(productData.average_rating).toFixed(
                                1
                              )} نجوم`
                            : "لا توجد تقييمات بعد"}
                        </span>

                        {productData.reviews_count && (
                          <span className="text-sm fw-medium text-gray-500">
                            ({productData.reviews_count})
                          </span>
                        )}
                      </div>

                      <span className="text-sm fw-medium text-gray-500">|</span>
                      <span className="text-gray-900">
                        {" "}
                        <span className="text-gray-400">SKU:</span>{" "}
                        {productData.sku}
                      </span>
                    </div>
                    <span className="mt-32 pt-32 text-gray-700 border-top border-gray-100 d-block" />

                    <p
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: productData.description,
                      }}
                    ></p>
                    <div className="mt-32 flex-align flex-wrap gap-32">
                      <div className="flex-align gap-8">
                        <h4 className="mb-0">${finalPrice.toFixed(2)}</h4>
                        {discount > 0 && (
                          <span className="text-md text-gray-500 line-through">
                            ${originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="mt-32 pt-32 text-gray-700 border-top border-gray-100 d-block" />
                    <div className="flex-align flex-wrap gap-16 bg-color-one rounded-8 py-16 px-24">
                      <span className="text-main-600 text-sm">
                        عرض خاص:
                      </span>
                      <ul className="countdown-list flex-align flex-wrap">
                        <li className="countdown-list__item">
                          {timeLeft.days}d
                        </li>
                        <li className="countdown-list__item">
                          {timeLeft.hours}h
                        </li>
                        <li className="countdown-list__item">
                          {timeLeft.minutes}m
                        </li>
                        <li className="countdown-list__item">
                          {timeLeft.seconds}s
                        </li>
                      </ul>
                    </div>
                    <div className="mb-24">
                      {/* ✅ العروض (Pack Sizes) */}
                      {productData.pack_sizes?.length > 0 && (
                        <div className="mt-32 w-100">
                          <h6 className="mb-16 text-gray-900 ">
                            الأحجام المتاحة:
                          </h6>
                          <div className="d-flex flex-wrap gap-12">
                            {productData.pack_sizes.map((pack) => (
                              <div
                                key={pack.id}
                                onClick={() => setSelectedPack(pack)}
                                className={`border rounded-16 p-12 text-center cursor-pointer transition-all ${
                                  selectedPack?.id === pack.id
                                    ? "border-main-600 bg-main-50"
                                    : "border-gray-200 bg-white"
                                }`}
                                style={{
                                  width: "120px",
                                  boxShadow:
                                    selectedPack?.id === pack.id
                                      ? "0 0 10px rgba(0,0,0,0.1)"
                                      : "0 0 4px rgba(0,0,0,0.05)",
                                }}
                              >
                                <h6 className="mb-4 text-gray-900">
                                  {pack.name}
                                </h6>
                                <p className="mb-4 text-main-600 fw-medium">
                                  ${pack.price}
                                </p>
                                <small className="text-gray-500 d-block">
                                  {pack.stock > 0
                                    ? `${pack.stock} متوفر`
                                    : "غير متوفر"}
                                </small>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mb-24">
                      {/* ✅ العروض (Pack Sizes) */}
                      {/* ✅ خصائص المنتج (مثل Type, Size, Color ...) */}
                      {/* ✅ خيارات المنتج (مثل Size أو Type) */}
                      {productData.attributes?.length > 0 && (
                        <div className="mt-32">
                          <div className="d-flex flex-column gap-16">
                            {productData.attributes.map((attr) => (
                              <div
                                key={attr.id}
                                className="d-flex align-items-center flex-wrap gap-12"
                              >
                                {/* 🏷️ اسم الخيار */}
                                <h6
                                  className="text-gray-800 mb-0"
                                  style={{ minWidth: "70px" }}
                                >
                                  {attr.name}:
                                </h6>

                                {/* ✅ لو فيها options نعرضها كأزرار */}
                                {attr.options?.length > 0 ? (
                                  <div className="d-flex flex-wrap gap-8">
                                    {attr.options.map((option) => (
                                      <div
                                        key={option.id}
                                        onClick={() =>
                                          handleOptionChange(
                                            attr.id,
                                            option.id,
                                            option.value
                                          )
                                        }
                                        className={`border rounded-16 px-16 py-6 cursor-pointer transition-all ${
                                          attr.selected_option?.id === option.id
                                            ? "border-main-600 bg-main-50"
                                            : "border-gray-200 bg-white"
                                        }`}
                                        style={{
                                          boxShadow:
                                            attr.selected_option?.id ===
                                            option.id
                                              ? "0 0 10px rgba(0,0,0,0.1)"
                                              : "0 0 4px rgba(0,0,0,0.05)",
                                        }}
                                      >
                                        <span className="fw-medium text-gray-900">
                                          {option.value}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  // ✅ لو الخيار مفيهوش options (قيمة ثابتة)
                                  <p className="text-gray-700 bg-gray-50 px-16 py-6 rounded-8 border border-gray-100 mb-0">
                                    {attr.value}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* <div className="mb-24">
                    <div className="mt-32 flex-align gap-12 mb-16">
                      <span className="w-32 h-32 bg-white flex-center rounded-circle text-main-600 box-shadow-xl">
                        <i className="ph-fill ph-lightning" />
                      </span>
                      <h6 className="text-md mb-0 fw-bold text-gray-900">
                        Products are almost sold out
                      </h6>
                    </div>
                    <div
                      className="progress w-100 bg-gray-100 rounded-pill h-8"
                      role="progressbar"
                      aria-label="Basic example"
                      aria-valuenow={32}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="progress-bar bg-main-two-600 rounded-pill"
                        style={{ width: "32%" }}
                      />
                    </div>
                    <span className="text-sm text-gray-700 mt-8">
                      Available only:45
                    </span>
                  </div> */}
                    <span className="text-gray-900 d-block mb-8">
                      الكمية:
                    </span>
                    <div className="flex-between gap-16 flex-wrap">
                      <div className="flex-align flex-wrap gap-16">
                        <div className="border border-gray-100 rounded-pill py-9 px-16 flex-align">
                          <button
                            onClick={decrementQuantity}
                            type="button"
                            className="quantity__minus p-4 text-gray-700 hover-text-main-600 flex-center"
                          >
                            <i className="ph ph-minus" />
                          </button>
                          <input
                            type="number"
                            className="quantity__input border-0 text-center w-32"
                            value={quantity}
                            readOnly
                          />
                          <button
                            onClick={incrementQuantity}
                            type="button"
                            className="quantity__plus p-4 text-gray-700 hover-text-main-600 flex-center"
                          >
                            <i className="ph ph-plus" />
                          </button>
                        </div>
                        <button
                          to="#"
                          onClick={() => handelAddToCartClick()}
                          className="btn btn-main rounded-pill flex-align d-inline-flex gap-8 px-48"
                        >
                          {" "}
                          <i className="ph ph-shopping-cart" /> إضافة إلى السلة
                        </button>
                      </div>
                      <div className="flex-align gap-12">
                        <button
                          to="#"
                          onClick={() => handleWishlistToggle()}
                          className="w-52 h-52 bg-main-50 text-main-600 text-xl hover-bg-main-600 hover-text-white flex-center rounded-circle"
                        >
                          <i className="ph ph-heart" />
                        </button>
                        <Link
                          to="#"
                          className="w-52 h-52 bg-main-50 text-main-600 text-xl hover-bg-main-600 hover-text-white flex-center rounded-circle"
                        >
                          <i className="ph ph-shuffle" />
                        </Link>
                        <Link
                          to="#"
                          className="w-52 h-52 bg-main-50 text-main-600 text-xl hover-bg-main-600 hover-text-white flex-center rounded-circle"
                        >
                          <i className="ph ph-share-network" />
                        </Link>
                      </div>
                    </div>
                    <span className="mt-32 pt-32 text-gray-700 border-top border-gray-100 d-block" />
                    <div className="flex-between gap-16 p-12 border border-main-two-600 border-dashed rounded-8 mb-16">
                      <div className="flex-align gap-12">
                        <button
                          type="button"
                          className="w-18 h-18 flex-center border border-gray-900 text-xs rounded-circle hover-bg-gray-100"
                        >
                          <i className="ph ph-plus" />
                        </button>
                        <span className="text-gray-900 fw-medium text-xs">
                          كوبون الشركة المصنعة. خصم 3.00 دولار على 5
                        </span>
                      </div>
                      <Link
                        to="/cart"
                        className="text-xs fw-semibold text-main-two-600 text-decoration-underline hover-text-main-two-700"
                      >
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* sidebar */}
            <div className="col-lg-3">
              <div className="product-details__sidebar border border-gray-100 rounded-16 overflow-hidden">
                <div className="p-24">
                  <div className="flex-between bg-main-600 rounded-pill p-8">
                    <div className="flex-align gap-8">
                      <span className="w-44 h-44 bg-white rounded-circle flex-center text-2xl">
                        <i className="ph ph-storefront" />
                      </span>
                      <span className="text-white">من النخبة</span>
                    </div>
                    <Link
                      to="/shop"
                      className="btn btn-white rounded-pill text-uppercase"
                    >
                      عرض المتجر
                    </Link>
                  </div>
                </div>
                <div className="p-24 bg-color-one d-flex align-items-start gap-24 border-bottom border-gray-100">
                  <span className="w-44 h-44 bg-white text-main-600 rounded-circle flex-center text-2xl flex-shrink-0">
                    <i className="ph-fill ph-truck" />
                  </span>
                  <div className="">
                    <h6 className="text-sm mb-8">توصيل سريع</h6>
                    <p className="text-gray-700">
                      شحن سريع كالبرق، مضمون.
                    </p>
                  </div>
                </div>
                <div className="p-24 bg-color-one d-flex align-items-start gap-24 border-bottom border-gray-100">
                  <span className="w-44 h-44 bg-white text-main-600 rounded-circle flex-center text-2xl flex-shrink-0">
                    <i className="ph-fill ph-arrow-u-up-left" />
                  </span>
                  <div className="">
                    <h6 className="text-sm mb-8">إرجاع مجاني لمدة 90 يومًا</h6>
                    <p className="text-gray-700">
                      تسوق بدون مخاطر مع إرجاع سهل.
                    </p>
                  </div>
                </div>
                <div className="p-24 bg-color-one d-flex align-items-start gap-24 border-bottom border-gray-100">
                  <span className="w-44 h-44 bg-white text-main-600 rounded-circle flex-center text-2xl flex-shrink-0">
                    <i className="ph-fill ph-check-circle" />
                  </span>
                  <div className="">
                    <h6 className="text-sm mb-8">
                      الاستلام متاح في موقع المتجر
                    </h6>
                    <p className="text-gray-700">عادة جاهز خلال 24 ساعة</p>
                  </div>
                </div>
                <div className="p-24 bg-color-one d-flex align-items-start gap-24 border-bottom border-gray-100">
                  <span className="w-44 h-44 bg-white text-main-600 rounded-circle flex-center text-2xl flex-shrink-0">
                    <i className="ph-fill ph-credit-card" />
                  </span>
                  <div className="">
                    <h6 className="text-sm mb-8">الدفع</h6>
                    <p className="text-gray-700">
                      الدفع عند الاستلام، الدفع بالبطاقة في المتجر، Google Pay، بطاقة أونلاين.
                    </p>
                  </div>
                </div>
                <div className="p-24 bg-color-one d-flex align-items-start gap-24 border-bottom border-gray-100">
                  <span className="w-44 h-44 bg-white text-main-600 rounded-circle flex-center text-2xl flex-shrink-0">
                    <i className="ph-fill ph-check-circle" />
                  </span>
                  <div className="">
                    <h6 className="text-sm mb-8">الضمان</h6>
                    <p className="text-gray-700">
                      قانون حماية المستهلك لا ينص على إرجاع هذا المنتج ذي الجودة المناسبة.
                    </p>
                  </div>
                </div>
                <div className="p-24 bg-color-one d-flex align-items-start gap-24 border-bottom border-gray-100">
                  <span className="w-44 h-44 bg-white text-main-600 rounded-circle flex-center text-2xl flex-shrink-0">
                    <i className="ph-fill ph-package" />
                  </span>
                  <div className="">
                    <h6 className="text-sm mb-8">التغليف</h6>
                    <p className="text-gray-700">
                      تغليف آمن ومحكم لحماية المنتج أثناء الشحن.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-80"></div>
          <div className="pt-80">
            <div className="product-dContent border rounded-24">
              <div className="product-dContent__header border-bottom border-gray-100 flex-between flex-wrap gap-16">
                <ul
                  className="nav common-tab nav-pills mb-3"
                  id="pills-tab"
                  role="tablist"
                >
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="pills-description-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-description"
                      type="button"
                      role="tab"
                      aria-controls="pills-description"
                      aria-selected="true"
                    >
                      الوصف
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="pills-reviews-tab"
                      data-bs-toggle="pill"
                      data-bs-target="#pills-reviews"
                      type="button"
                      role="tab"
                      aria-controls="pills-reviews"
                      aria-selected="false"
                    >
                      التقييمات
                    </button>
                  </li>
                </ul>
                <Link
                  to="#"
                  className="btn bg-color-one rounded-16 flex-align gap-8 text-main-600 hover-bg-main-600 hover-text-white"
                >
                  <img src="assets/images/icon/satisfaction-icon.png" alt="" />
                  ضمان الرضا 100%
                </Link>
              </div>
              <div className="product-dContent__box ">
                <div className="tab-content" id="pills-tabContent">
                  <div
                    className="tab-pane fade show active"
                    id="pills-description"
                    role="tabpanel"
                    aria-labelledby="pills-description-tab"
                    tabIndex={0}
                  >
                    {/* ✅ الوصف الرئيسي */}
                    <div className="mb-40 ">
                      <h6 className="mb-24">وصف المنتج</h6>
                      <p
                        dangerouslySetInnerHTML={{
                          __html:
                            productData.description ||
                            "لا يوجد وصف متاح",
                        }}
                      ></p>

                      {/* ✅ الوصف القصير */}
                      {productData.short_description && (
                        <p className="mt-16 text-gray-700">
                          <strong>ملخص:</strong>{" "}
                          {productData.short_description}
                        </p>
                      )}

                      {/* ✅ معلومات أساسية */}
                      <div className="mt-32">
                        <p>
                          <span className="text-gray-600 fw-medium">SKU:</span>{" "}
                          <span className="text-gray-700">
                            {productData.sku}
                          </span>
                        </p>
                        {productData.is_featured && (
                          <p>
                            <span className="badge bg-success">
                              ⭐ منتج مميز
                            </span>
                          </p>
                        )}
                        {productData.is_new && (
                          <p>
                            <span className="badge bg-info">
                              🆕 وصول جديد
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    {/* ✅ الخصائص الديناميكية */}
                    {productData.attributes?.length > 0 && (
                      <div className="mb-40">
                        <h6 className="mb-24">خصائص المنتج</h6>
                        <ul className="list-unstyled">
                          {productData.attributes.map((attr) => (
                            <li
                              key={attr.id}
                              className="text-gray-400 mb-14 flex-align gap-14"
                            >
                              <span className="w-20 h-20 bg-main-50 text-main-600 text-xs flex-center rounded-circle">
                                <i className="ph ph-check" />
                              </span>
                              <span className="text-heading fw-medium">
                                {attr.name}:
                                <span className="text-gray-500">
                                  {" "}
                                  {attr.selected_option?.value ||
                                    attr.value ||
                                    "N/A"}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* ✅ أحجام التعبئة */}
                    {productData.pack_sizes?.length > 0 && (
                      <div className="mb-40">
                        <h6 className="mb-24">الأحجام المتاحة والمخزون</h6>
                        <ul className="list-unstyled">
                          {productData.pack_sizes.map((pack) => (
                            <li
                              key={pack.id}
                              className="text-gray-400 mb-14 flex-align gap-14"
                            >
                              <span className="w-20 h-20 bg-main-50 text-main-600 text-xs flex-center rounded-circle">
                                <i className="ph ph-check" />
                              </span>
                              <span className="text-heading fw-medium">
                                {pack.name}:
                                <span className="text-gray-500">
                                  {" "}
                                  ${pack.price} ({pack.stock} متوفر)
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div
                    className="tab-pane fade"
                    id="pills-reviews"
                    role="tabpanel"
                    aria-labelledby="pills-reviews-tab"
                    tabIndex={0}
                  >
                    <div className="row g-4">
                      <div className="col-lg-6">
                        <ProductReviews
                          productId={productData.id}
                          reviews={productData.reviews}
                        />
                      </div>
                      <div className="col-lg-6">
                        <div className="ms-xxl-5">
                          <h6 className="mb-24">آراء العملاء</h6>
                          <div className="d-flex flex-wrap gap-44">
                            <div className="border border-gray-100 rounded-8 px-40 py-52 flex-center flex-column flex-shrink-0 text-center">
                              <h2 className="mb-6 text-main-600">4.8</h2>
                              <div className="flex-center gap-8">
                                <span className="text-15 fw-medium text-warning-600 d-flex">
                                  <i className="ph-fill ph-star" />
                                </span>
                                <span className="text-15 fw-medium text-warning-600 d-flex">
                                  <i className="ph-fill ph-star" />
                                </span>
                                <span className="text-15 fw-medium text-warning-600 d-flex">
                                  <i className="ph-fill ph-star" />
                                </span>
                                <span className="text-15 fw-medium text-warning-600 d-flex">
                                  <i className="ph-fill ph-star" />
                                </span>
                                <span className="text-15 fw-medium text-warning-600 d-flex">
                                  <i className="ph-fill ph-star" />
                                </span>
                              </div>
                              <span className="mt-16 text-gray-500">
                                متوسط تقييم المنتج
                              </span>
                            </div>
                            <div className="border border-gray-100 rounded-8 px-24 py-40 flex-grow-1">
                              <div className="flex-align gap-8 mb-20">
                                <span className="text-gray-900 flex-shrink-0">
                                  5
                                </span>
                                <div
                                  className="progress w-100 bg-gray-100 rounded-pill h-8"
                                  role="progressbar"
                                  aria-label="Basic example"
                                  aria-valuenow={70}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                >
                                  <div
                                    className="progress-bar bg-main-600 rounded-pill"
                                    style={{ width: "70%" }}
                                  />
                                </div>
                                <div className="flex-align gap-4">
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                </div>
                                <span className="text-gray-900 flex-shrink-0">
                                  124
                                </span>
                              </div>
                              <div className="flex-align gap-8 mb-20">
                                <span className="text-gray-900 flex-shrink-0">
                                  4
                                </span>
                                <div
                                  className="progress w-100 bg-gray-100 rounded-pill h-8"
                                  role="progressbar"
                                  aria-label="Basic example"
                                  aria-valuenow={50}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                >
                                  <div
                                    className="progress-bar bg-main-600 rounded-pill"
                                    style={{ width: "50%" }}
                                  />
                                </div>
                                <div className="flex-align gap-4">
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                </div>
                                <span className="text-gray-900 flex-shrink-0">
                                  52
                                </span>
                              </div>
                              <div className="flex-align gap-8 mb-20">
                                <span className="text-gray-900 flex-shrink-0">
                                  3
                                </span>
                                <div
                                  className="progress w-100 bg-gray-100 rounded-pill h-8"
                                  role="progressbar"
                                  aria-label="Basic example"
                                  aria-valuenow={35}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                >
                                  <div
                                    className="progress-bar bg-main-600 rounded-pill"
                                    style={{ width: "35%" }}
                                  />
                                </div>
                                <div className="flex-align gap-4">
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                </div>
                                <span className="text-gray-900 flex-shrink-0">
                                  12
                                </span>
                              </div>
                              <div className="flex-align gap-8 mb-20">
                                <span className="text-gray-900 flex-shrink-0">
                                  2
                                </span>
                                <div
                                  className="progress w-100 bg-gray-100 rounded-pill h-8"
                                  role="progressbar"
                                  aria-label="Basic example"
                                  aria-valuenow={20}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                >
                                  <div
                                    className="progress-bar bg-main-600 rounded-pill"
                                    style={{ width: "20%" }}
                                  />
                                </div>
                                <div className="flex-align gap-4">
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                </div>
                                <span className="text-gray-900 flex-shrink-0">
                                  5
                                </span>
                              </div>
                              <div className="flex-align gap-8 mb-0">
                                <span className="text-gray-900 flex-shrink-0">
                                  1
                                </span>
                                <div
                                  className="progress w-100 bg-gray-100 rounded-pill h-8"
                                  role="progressbar"
                                  aria-label="Basic example"
                                  aria-valuenow={5}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                >
                                  <div
                                    className="progress-bar bg-main-600 rounded-pill"
                                    style={{ width: "5%" }}
                                  />
                                </div>
                                <div className="flex-align gap-4">
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                  <span className="text-xs fw-medium text-warning-600 d-flex">
                                    <i className="ph-fill ph-star" />
                                  </span>
                                </div>
                                <span className="text-gray-900 flex-shrink-0">
                                  2
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <NewArrivalTwo products={products} />
    </>
  );
};

export default ProductDetailsOne;
