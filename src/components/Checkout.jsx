import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Cookies from "universal-cookie";
import {
  getUserAddresses,
  getAllCart,
  getCartSummary,
  getAvailableCouponCodes,
  applyCouponToCart,
  removeCouponFromCart,
  getShippingCost,
  estimateDelivery,
  checkout,
  getPaymentMethods,
} from "../api/api";

const extractArray = (source) => {
  if (!source) return [];
  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.data?.data)) return source.data.data;
  if (Array.isArray(source?.data)) return source.data;
  if (Array.isArray(source?.items)) return source.items;
  if (Array.isArray(source?.results)) return source.results;
  return [];
};

const resolveNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "object") {
    const keys = [
      "amount",
      "total",
      "sub_total",
      "subtotal",
      "value",
      "cost",
      "shipping",
      "price",
    ];
    for (const key of keys) {
      if (value[key] !== undefined) {
        const result = resolveNumber(value[key]);
        if (result) return result;
      }
    }
  }
  return 0;
};

const toCurrency = (value) => `$${resolveNumber(value).toFixed(2)}`;

const formatAddress = (address) => {
  const parts = [
    address?.name,
    address?.address,
    address?.city,
    address?.state,
    address?.country,
    address?.postal_code,
  ].filter((part) => part && String(part).trim());
  return parts.join(", ");
};

const normalizeCouponCode = (coupon) => {
  if (!coupon) return "";
  if (typeof coupon === "string") return coupon;
  if (Array.isArray(coupon)) {
    for (const item of coupon) {
      const normalized = normalizeCouponCode(item);
      if (normalized) return normalized;
    }
    return "";
  }
  if (typeof coupon === "object") {
    if (typeof coupon.code === "string") return coupon.code;
    if (typeof coupon.coupon_code === "string") return coupon.coupon_code;
    if (typeof coupon?.attributes?.code === "string")
      return coupon.attributes.code;
    if (typeof coupon?.data?.code === "string") return coupon.data.code;
    if (typeof coupon.value === "string") return coupon.value;
  }
  return "";
};

const extractCouponCode = (source) => {
  if (!source) return "";
  const target = source?.data ?? source;
  if (typeof target === "string") return target;
  if (typeof target?.coupon_code === "string") return target.coupon_code;
  if (typeof target?.code === "string") return target.code;
  const directApplied = normalizeCouponCode(target?.applied_coupon);
  if (directApplied) return directApplied;
  const directCoupon = normalizeCouponCode(target?.coupon);
  if (directCoupon) return directCoupon;
  if (typeof target?.applied_coupon === "string") return target.applied_coupon;
  const nestedTotals = target?.totals ?? target?.summary ?? target?.cart;
  if (nestedTotals) {
    const nestedCode =
      normalizeCouponCode(nestedTotals?.applied_coupon) ||
      normalizeCouponCode(nestedTotals?.coupon);
    if (nestedCode) return nestedCode;
  }
  if (typeof target?.value === "string") return target.value;
  return "";
};

const parseDeliveryEstimate = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(" ");
  if (typeof value === "object") {
    if (value.estimate) return value.estimate;
    if (value.message) return value.message;
    if (value.text) return value.text;
    if (value.min_days || value.max_days) {
      const min = value.min_days ?? value.min ?? "";
      const max = value.max_days ?? value.max ?? "";
      return [min, max].filter(Boolean).join(" - ");
    }
  }
  return "";
};

const extractTotalsData = (source) => {
  if (!source) return null;
  const candidates = [
    source,
    source?.data,
    source?.data?.data,
    source?.totals,
    source?.summary,
    source?.cart,
    source?.cart_summary,
    source?.order,
  ];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const totalsCandidate = candidate?.totals ?? candidate;
    if (!totalsCandidate || typeof totalsCandidate !== "object") continue;
    const keys = [
      "subtotal",
      "sub_total",
      "total",
      "discount",
      "discount_total",
      "discount_amount",
      "coupon_discount",
      "tax",
      "shipping",
    ];
    const hasKey = keys.some((key) => totalsCandidate[key] !== undefined);
    if (hasKey) return totalsCandidate;
  }
  return null;
};

const computeCartItemPricing = (item) => {
  const quantity = resolveNumber(item?.quantity ?? item?.qty ?? 1) || 1;
  const product = item?.product ?? {};
  const packSizesSource = Array.isArray(product?.pack_sizes)
    ? product.pack_sizes
    : Array.isArray(item?.pack_sizes)
    ? item.pack_sizes
    : [];
  const packSizes = Array.isArray(packSizesSource) ? packSizesSource : [];
  const targetPackId =
    item?.pack_size_id ??
    item?.packSizeId ??
    item?.selected_pack_size_id ??
    item?.pack_size?.id ??
    null;
  let selectedPack = null;
  if (packSizes.length) {
    selectedPack =
      packSizes.find((pack) => {
        const packId =
          pack?.id ??
          pack?.pack_size_id ??
          pack?.value ??
          pack?.packSizeId ??
          pack?.packsize_id ??
          null;
        if (packId === undefined || packId === null) return false;
        if (targetPackId === undefined || targetPackId === null) return false;
        return String(packId) === String(targetPackId);
      }) ?? packSizes[0];
  }
  const baseCandidates = [
    selectedPack?.price,
    selectedPack?.regular_price,
    selectedPack?.base_price,
    product?.regular_price,
    product?.base_price,
    product?.original_price,
    item?.original_price,
    item?.price,
    product?.price,
  ];
  let baseUnitPrice = 0;
  for (const candidate of baseCandidates) {
    const value = resolveNumber(candidate);
    if (value > 0) {
      baseUnitPrice = value;
      break;
    }
  }
  const finalCandidates = [
    selectedPack?.sale_price,
    selectedPack?.discount_price,
    selectedPack?.offer_price,
    item?.unit_price,
    item?.price,
    product?.discount_price,
    product?.sale_price,
    product?.offer_price,
    product?.price,
  ];
  let finalUnitPrice = 0;
  for (const candidate of finalCandidates) {
    const value = resolveNumber(candidate);
    if (value > 0) {
      finalUnitPrice = value;
      break;
    }
  }
  if (!baseUnitPrice) {
    baseUnitPrice = finalUnitPrice;
  }
  if (!finalUnitPrice) {
    finalUnitPrice = baseUnitPrice;
  }
  const discountValue = resolveNumber(
    item?.discount ??
      selectedPack?.discount ??
      product?.discount ??
      product?.discount_value ??
      0
  );
  const discountType = String(
    item?.discount_type ??
      selectedPack?.discount_type ??
      product?.discount_type ??
      product?.discount_type_value ??
      ""
  ).toLowerCase();
  if (
    discountValue > 0 &&
    baseUnitPrice > 0 &&
    Math.abs(baseUnitPrice - finalUnitPrice) < 0.01
  ) {
    if (discountType.includes("percentage")) {
      finalUnitPrice = baseUnitPrice - (baseUnitPrice * discountValue) / 100;
    } else {
      finalUnitPrice = baseUnitPrice - discountValue;
    }
  }
  finalUnitPrice = Math.max(0, finalUnitPrice);
  const unitDiscount = Math.max(0, baseUnitPrice - finalUnitPrice);
  return {
    quantity,
    baseUnitPrice,
    finalUnitPrice,
    unitDiscount,
    lineBaseTotal: baseUnitPrice * quantity,
    lineFinalTotal: finalUnitPrice * quantity,
    lineDiscountTotal: unitDiscount * quantity,
  };
};

const Checkout = () => {
  const navigate = useNavigate();
  const cookies = useMemo(() => new Cookies(), []);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [shippingAddressId, setShippingAddressId] = useState("");
  const [billingAddressId, setBillingAddressId] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState(null);
  const [deliveryEstimate, setDeliveryEstimate] = useState("");

  const refreshSummary = async () => {
    try {
      const [cartRes, summaryRes] = await Promise.all([
        getAllCart().catch(() => []),
        getCartSummary().catch(() => null),
      ]);
      setCartItems(extractArray(cartRes));
      const summaryData = summaryRes?.data ?? summaryRes ?? null;
      setCartSummary(summaryData);
      const code = extractCouponCode(summaryData);
      setAppliedCoupon(code);
    } catch (error) {
      console.error("Error refreshing cart summary:", error);
    }
  };
  console.log("cart items from checkout page  =|>? ", cartItems);

  useEffect(() => {
    const token = cookies.get("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setIsAuthenticated(true);
  }, [cookies, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      setLoading(true);
      try {
        const [addressesRes, cartRes, summaryRes, couponsRes, paymentRes] =
          await Promise.all([
            getUserAddresses().catch(() => []),
            getAllCart().catch(() => []),
            getCartSummary().catch(() => null),
            getAvailableCouponCodes().catch(() => []),
            getPaymentMethods().catch(() => []),
          ]);
        const addressList = extractArray(addressesRes);
        setAddresses(addressList);
        const firstAddressId = addressList.length
          ? String(addressList[0]?.id ?? addressList[0]?.address_id ?? "")
          : "";
        if (firstAddressId) {
          setShippingAddressId(firstAddressId);
          setBillingAddressId(firstAddressId);
        } else {
          setShippingAddressId("");
          setBillingAddressId("");
        }
        setCartItems(extractArray(cartRes));
        const summaryData = summaryRes?.data ?? summaryRes ?? null;
        setCartSummary(summaryData);
        const summaryCoupon = extractCouponCode(summaryData);
        setAppliedCoupon(summaryCoupon || "");
        const couponList = extractArray(couponsRes)
          .map((coupon) => normalizeCouponCode(coupon))
          .filter(Boolean);
        setAvailableCoupons([...new Set(couponList)]);
        const paymentList = extractArray(paymentRes);
        setPaymentMethods(paymentList);
        if (paymentList.length) {
          const firstPayment =
            paymentList[0]?.id ??
            paymentList[0]?.code ??
            paymentList[0]?.slug ??
            paymentList[0];
          setSelectedPayment(String(firstPayment));
        } else {
          setSelectedPayment("");
        }
      } catch (error) {
        console.error("Error loading checkout data:", error);
        Swal.fire({
          icon: "error",
          title: "تعذر تحميل بيانات الطلب",
          text: error.response?.data?.message || "يرجى إعادة المحاولة لاحقاً",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!shippingAddressId) {
      setShippingCost(null);
      setDeliveryEstimate("");
      return;
    }
    let cancelled = false;
    const fetchShipping = async () => {
      setShippingLoading(true);
      try {
        const [costResponse, estimateResponse] = await Promise.all([
          getShippingCost(shippingAddressId).catch(() => null),
          estimateDelivery(shippingAddressId).catch(() => null),
        ]);
        if (cancelled) return;
        const costValue = resolveNumber(costResponse?.data ?? costResponse);
        setShippingCost(costValue);
        const estimateValue = parseDeliveryEstimate(
          estimateResponse?.data ?? estimateResponse
        );
        setDeliveryEstimate(estimateValue);
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching shipping info:", error);
          setShippingCost(null);
          setDeliveryEstimate("");
        }
      } finally {
        if (!cancelled) setShippingLoading(false);
      }
    };
    fetchShipping();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, shippingAddressId]);

  const normalizedAddresses = useMemo(
    () =>
      addresses
        .map((address, index) => {
          const idValue =
            address?.id ??
            address?.address_id ??
            address?.value ??
            address?.addressId ??
            index;
          if (idValue === undefined || idValue === null) return null;
          return {
            id: String(idValue),
            label: formatAddress(address) || `Address ${index + 1}`,
          };
        })
        .filter(Boolean),
    [addresses]
  );

  const normalizedPaymentMethods = useMemo(
    () =>
      paymentMethods.map((method, index) => {
        if (typeof method === "string") {
          return {
            id: method,
            label: method,
            description: "سيتم استخدام هذه الطريقة للدفع.",
          };
        }
        const idValue =
          method?.id ?? method?.code ?? method?.slug ?? method?.value ?? index;
        const labelValue =
          method?.name ??
          method?.label ??
          method?.title ??
          `Payment ${index + 1}`;
        const descriptionValue =
          method?.description ??
          method?.details ??
          method?.text ??
          "سيتم استخدام هذه الطريقة للدفع.";
        return {
          id: String(idValue),
          label: labelValue,
          description: descriptionValue,
        };
      }),
    [paymentMethods]
  );

  const totals = useMemo(() => {
    const derived = cartItems.reduce(
      (acc, item) => {
        const pricing = computeCartItemPricing(item);
        acc.subtotal += pricing.lineBaseTotal;
        acc.discount += pricing.lineDiscountTotal;
        acc.afterDiscount += pricing.lineFinalTotal;
        return acc;
      },
      { subtotal: 0, discount: 0, afterDiscount: 0 }
    );
    const summarySource = cartSummary?.totals ?? cartSummary ?? {};
    const summarySubtotal = resolveNumber(
      summarySource.subtotal ??
        summarySource.sub_total ??
        summarySource.total_before_discount ??
        summarySource.total_before_tax
    );
    const subtotal = summarySubtotal > 0 ? summarySubtotal : derived.subtotal;
    const summaryDiscount = resolveNumber(
      summarySource.discount ??
        summarySource.discount_total ??
        summarySource.discount_amount ??
        summarySource.coupon_discount ??
        summarySource.coupon_discount_total ??
        summarySource.total_discount ??
        summarySource.applied_discount ??
        summarySource?.applied_coupon?.discount ??
        summarySource?.applied_coupon?.discount_value ??
        summarySource?.coupon?.discount ??
        summarySource?.coupon?.discount_value
    );
    const discount =
      summaryDiscount > 0 ? summaryDiscount : derived.discount;
    const tax = resolveNumber(
      summarySource.tax ??
        summarySource.tax_total ??
        summarySource.total_tax ??
        summarySource.vat ??
        summarySource.vat_total
    );
    const shippingValue =
      shippingCost !== null && shippingCost !== undefined
        ? shippingCost
        : resolveNumber(
            summarySource.shipping ??
              summarySource.shipping_total ??
              summarySource.shipping_cost ??
              summarySource.delivery_fee
          );
    const normalizedShipping = Number.isFinite(shippingValue)
      ? shippingValue
      : 0;
    const summaryTotal = resolveNumber(
      summarySource.total ??
        summarySource.grand_total ??
        summarySource.order_total ??
        summarySource.total_with_discount ??
        summarySource.final_total
    );
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);
    const baseAfterDiscount =
      derived.afterDiscount > 0 ? derived.afterDiscount : subtotalAfterDiscount;
    const computedTotal = Math.max(
      0,
      baseAfterDiscount + tax + normalizedShipping
    );
    let total = computedTotal;
    if (summaryTotal > 0) {
      total =
        discount > 0 && summaryTotal > computedTotal
          ? computedTotal
          : summaryTotal;
    }
    return { subtotal, discount, tax, shipping: normalizedShipping, total };
  }, [cartItems, cartSummary, shippingCost]);

  const isPlaceOrderDisabled =
    !isAuthenticated ||
    isSubmitting ||
    !cartItems.length ||
    !shippingAddressId ||
    !billingAddressId ||
    !selectedPayment;

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    try {
      const res = await applyCouponToCart(code);
      const responseCoupon =
        extractCouponCode(res) ||
        extractCouponCode(res?.data) ||
        normalizeCouponCode(res?.coupon.value) ||
        normalizeCouponCode(res?.data?.coupon) ||
        code;
      setAppliedCoupon(responseCoupon);
      const updatedTotals =
        extractTotalsData(res) || extractTotalsData(res?.data) || null;
      if (updatedTotals) {
        setCartSummary((prev) => {
          const base = prev && typeof prev === "object" ? prev : {};
          const existingTotals =
            base.totals && typeof base.totals === "object" ? base.totals : {};
          const nextTotals =
            (updatedTotals?.totals && typeof updatedTotals.totals === "object"
              ? updatedTotals.totals
              : updatedTotals) ?? {};
          return {
            ...base,
            totals: {
              ...existingTotals,
              ...nextTotals,
            },
          };
        });
      }
      setCouponInput("");
      await refreshSummary();
      Swal.fire({
        icon: "success",
        title: "تم تطبيق الكوبون",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error applying coupon:", error);
      Swal.fire({
        icon: "error",
        title: "تعذر تطبيق الكوبون",
        text:
          error.response?.data?.message ||
          "يرجى التحقق من الكود والمحاولة مرة أخرى",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponLoading(true);
    try {
      await removeCouponFromCart();
      setAppliedCoupon("");
      setCouponInput("");
      setCartSummary((prev) => {
        if (!prev || typeof prev !== "object") return prev;
        const nextTotals = { ...(prev.totals ?? {}) };
        const discountKeys = [
          "discount",
          "discount_total",
          "discount_amount",
          "coupon_discount",
          "coupon_discount_total",
          "total_discount",
          "applied_discount",
        ];
        let shouldUpdateTotals = false;
        for (const key of discountKeys) {
          if (key in nextTotals) {
            nextTotals[key] = 0;
            shouldUpdateTotals = true;
          }
        }
        const nextSummary = {
          ...prev,
          totals: shouldUpdateTotals ? nextTotals : prev.totals,
        };
        if (nextSummary.applied_coupon) delete nextSummary.applied_coupon;
        if (nextSummary.coupon) delete nextSummary.coupon;
        return nextSummary;
      });
      await refreshSummary();
      Swal.fire({
        icon: "success",
        title: "تم إلغاء الكوبون",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error removing coupon:", error);
      Swal.fire({
        icon: "error",
        title: "تعذر إلغاء الكوبون",
        text: error.response?.data?.message || "يرجى المحاولة مرة أخرى",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    const token = cookies.get("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "يرجى تسجيل الدخول",
      });
      navigate("/login", { replace: true });
      return;
    }
    if (
      !shippingAddressId ||
      !billingAddressId ||
      !selectedPayment ||
      !cartItems.length
    ) {
      Swal.fire({
        icon: "warning",
        title: "يرجى استكمال بيانات الطلب",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("shipping_address_id", shippingAddressId);
      formData.append("billing_address_id", billingAddressId);
      formData.append("payment_method", selectedPayment);
      if (appliedCoupon) formData.append("coupon_code", appliedCoupon);
      if (orderNotes.trim()) formData.append("notes", orderNotes.trim());
      await checkout(formData);
      Swal.fire({
        icon: "success",
        title: "تم إرسال الطلب بنجاح",
        timer: 2000,
        showConfirmButton: false,
      });
      await refreshSummary();
    } catch (error) {
      console.error("Error placing order:", error);
      Swal.fire({
        icon: "error",
        title: "تعذر تنفيذ الطلب",
        text: error.response?.data?.message || "يرجى إعادة المحاولة لاحقاً",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="checkout py-80">
        <div className="container container-lg text-center">
          <span className="text-gray-900 fw-semibold">Loading...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout py-80">
      <div className="container container-lg">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-16 mb-32">
          <div>
            <h2 className="text-gray-900 fw-bold mb-8">Complete purchase</h2>
            <p className="text-gray-500 mb-0">
              Review your details and complete the payment process with ease.
            </p>
          </div>
          <div className="bg-main-50 border border-gray-100 rounded-8 px-24 py-16 text-end shadow-sm">
            <span className="d-block text-sm text-gray-600 mb-4">
              Total due
            </span>
            <span className="text-gray-900 fw-bold text-xl">
              {toCurrency(totals.total)}
            </span>
          </div>
        </div>
        <div className="bg-main-50 border border-gray-100 rounded-8 px-24 py-16 mb-40 shadow-sm">
          <div className="d-flex flex-wrap align-items-center gap-12">
            <span className="badge bg-main text-primary px-12 py-8 text-sm">
              Advice
            </span>
            <span className="text-gray-900">
              Enter your discount code in the field below to apply it to your
              order.
            </span>
          </div>
        </div>
        <form className="row" onSubmit={handlePlaceOrder}>
          <div className="col-xl-9 col-lg-8">
            <div className="pe-xl-5">
              <div className="d-flex flex-column gap-24">
                <div className="bg-white border border-gray-100 rounded-8 shadow-sm p-24">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-12 mb-16">
                    <span className="text-gray-900 fw-semibold text-lg">
                      Delivery addresses
                    </span>
                    {normalizedAddresses.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {normalizedAddresses.length} Available address
                      </span>
                    )}
                  </div>
                  <label className="text-gray-900 fw-semibold mb-12 d-block">
                    Shipping Address
                  </label>
                  <select
                    className="common-input border-gray-100"
                    value={shippingAddressId}
                    onChange={(event) =>
                      setShippingAddressId(event.target.value)
                    }
                    disabled={!normalizedAddresses.length}
                  >
                    <option value=""> Select shipping address</option>
                    {normalizedAddresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.label}
                      </option>
                    ))}
                  </select>
                  {!normalizedAddresses.length && (
                    <div className="text-sm text-gray-500 mt-8">
                      There are currently no addresses registered.
                    </div>
                  )}
                  <div className="border-top border-gray-100 my-20" />
                  <label className="text-gray-900 fw-semibold mb-12 d-block">
                    Invoice address
                  </label>
                  <select
                    className="common-input border-gray-100"
                    value={billingAddressId}
                    onChange={(event) =>
                      setBillingAddressId(event.target.value)
                    }
                    disabled={!normalizedAddresses.length}
                  >
                    <option value="">Select the invoice title</option>
                    {normalizedAddresses.map((address) => (
                      <option key={address.id} value={address.id}>
                        {address.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-white border border-gray-100 rounded-8 shadow-sm p-24">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-12 mb-16">
                    <span className="text-gray-900 fw-semibold text-lg">
                      Order Notes
                    </span>
                    {orderNotes && (
                      <span className="text-sm text-gray-500">
                        Your feedback will be sent to the support team.
                      </span>
                    )}
                  </div>
                  <textarea
                    className="common-input border-gray-100"
                    placeholder="أدخل أي ملاحظات إضافية"
                    value={orderNotes}
                    onChange={(event) => setOrderNotes(event.target.value)}
                    rows={4}
                  />
                </div>
                <div className="bg-white border border-gray-100 rounded-8 shadow-sm p-24">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-12 mb-16">
                    <span className="text-gray-900 fw-semibold text-lg">
                      Discount code
                    </span>
                    {appliedCoupon && (
                      <span className="badge bg-main text-white px-12 py-8 text-sm">
                        {appliedCoupon}
                      </span>
                    )}
                  </div>
                  <div className="d-flex flex-wrap gap-12">
                    <input
                      type="text"
                      className="common-input border-gray-100 flex-grow-1"
                      placeholder="Enter the code"
                      value={couponInput}
                      onChange={(event) => setCouponInput(event.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-main px-24"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                    >
                      {couponLoading ? "..." : "Aplly"}
                    </button>
                    {appliedCoupon && (
                      <button
                        type="button"
                        className="btn btn-outline-danger px-24"
                        onClick={handleRemoveCoupon}
                        disabled={couponLoading}
                      >
                        Cancellation
                      </button>
                    )}
                  </div>
                  {availableCoupons.length > 0 && (
                    <div className="d-flex flex-wrap gap-12 mt-16">
                      {availableCoupons.map((code) => (
                        <button
                          key={code}
                          type="button"
                          className="border border-gray-100 rounded-8 px-16 py-8 text-sm text-gray-800 bg-transparent"
                          onClick={() => setCouponInput(code)}
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="mt-16 text-sm text-main-600 fw-semibold">
                      The coupon has been successfully applied.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4">
            <div className="checkout-sidebar">
              <div className="bg-color-three rounded-8 p-24 text-center">
                <span className="text-gray-900 text-xl fw-semibold">
                  Your Request
                </span>
              </div>
              <div className="border border-gray-100 rounded-8 px-24 py-40 mt-24 bg-white shadow-sm">
                <div className="mb-32 pb-32 border-bottom border-gray-100 flex-between gap-8">
                  <span className="text-gray-900 fw-medium text-xl font-heading-two">
                    Product
                  </span>
                  <span className="text-gray-900 fw-medium text-xl font-heading-two">
                    Total
                  </span>
                </div>
                {cartItems.length ? (
                  cartItems.map((item, index) => {
                    const productId = item?.product?.id ?? item?.product_id;
                    const productName =
                      item?.product?.name ?? item?.name ?? "Product";
                    const quantity = item?.quantity ?? item?.qty ?? 1;
                    const lineTotal =
                      resolveNumber(item?.total ?? item?.line_total) ||
                      resolveNumber(item?.product?.price ?? item?.price) *
                        (quantity || 1);
                    return (
                      <div
                        className="flex-between gap-24 mb-32"
                        key={`${item?.id ?? productId ?? index}`}
                      >
                        <div className="flex-align gap-12">
                          <span className="text-gray-900 fw-normal text-md font-heading-two w-144 text-line-2">
                            {productId ? (
                              <Link
                                to={`/product/${productId}`}
                                className="text-gray-900"
                              >
                                {productName}
                              </Link>
                            ) : (
                              productName
                            )}
                          </span>
                          <span className="text-gray-900 fw-semibold text-md font-heading-two">
                            × {quantity}
                          </span>
                        </div>
                        <span className="text-gray-900 fw-bold text-md font-heading-two">
                          {toCurrency(lineTotal)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500">
                    The basket is currently empty.
                  </div>
                )}
                <div className="border-top border-gray-100 pt-30 mt-30">
                  <div className="mb-16 flex-between gap-8">
                    <span className="text-gray-900 font-heading-two text-xl fw-semibold">
                      Subtotal
                    </span>
                    <span className="text-gray-900 font-heading-two text-md fw-bold">
                      {toCurrency(totals.subtotal)}
                    </span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="mb-16 flex-between gap-8">
                      <span className="text-gray-900 font-heading-two text-xl fw-semibold">
                        Discount
                      </span>
                      <span className="text-gray-900 font-heading-two text-md fw-bold">
                        -{toCurrency(totals.discount)}
                      </span>
                    </div>
                  )}
                  <div className="mb-16 flex-between gap-8">
                    <span className="text-gray-900 font-heading-two text-xl fw-semibold">
                      Tax
                    </span>
                    <span className="text-gray-900 font-heading-two text-md fw-bold">
                      {toCurrency(totals.tax)}
                    </span>
                  </div>
                  <div className="mb-16 flex-between gap-8">
                    <span className="text-gray-900 font-heading-two text-xl fw-semibold">
                      Shipping
                    </span>
                    <span className="text-gray-900 font-heading-two text-md fw-bold">
                      {shippingLoading ? "..." : toCurrency(totals.shipping)}
                    </span>
                  </div>
                  {deliveryEstimate && (
                    <div className="text-sm text-gray-500 mb-16">
                      Expected delivery time: {deliveryEstimate}
                    </div>
                  )}
                  <div className="mb-0 flex-between gap-8">
                    <span className="text-gray-900 font-heading-two text-xl fw-semibold">
                      Total
                    </span>
                    <span className="text-gray-900 font-heading-two text-md fw-bold">
                      {toCurrency(totals.total)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-32">
                {normalizedPaymentMethods.length ? (
                  <div className="d-flex flex-column gap-16">
                    {normalizedPaymentMethods.map((method) => (
                      <div
                        className="payment-item bg-white border border-gray-100 rounded-8 shadow-sm px-20 py-12"
                        key={method.id}
                      >
                        <div className="form-check common-check common-radio py-12 mb-0">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="payment"
                            id={`payment-${method.id}`}
                            value={method.id}
                            checked={selectedPayment === method.id}
                            onChange={(event) =>
                              setSelectedPayment(event.target.value)
                            }
                          />
                          <label
                            className="form-check-label fw-semibold text-neutral-600"
                            htmlFor={`payment-${method.id}`}
                          >
                            {method.label}
                          </label>
                        </div>
                        {selectedPayment === method.id && (
                          <div className="payment-item__content px-16 py-24 rounded-8 bg-main-50 position-relative d-block mt-16">
                            <p className="text-gray-800 mb-0">
                              {method.description}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // ❌ لو مفيش وسائل دفع راجعة من الـ API
                  <div className="payment-item bg-white border border-gray-100 rounded-8 shadow-sm px-20 py-12">
                    <div className="form-check common-check common-radio py-12 mb-0">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="payment"
                        id="payment-cash"
                        value="cash"
                        checked={selectedPayment === "cash"}
                        onChange={(event) =>
                          setSelectedPayment(event.target.value)
                        }
                      />
                      <label
                        className="form-check-label fw-semibold text-neutral-600"
                        htmlFor="payment-cash"
                      >
                        Payment upon delivery (cash)
                      </label>
                    </div>

                    {selectedPayment === "cash" && (
                      <div className="payment-item__content px-16 py-24 rounded-8 bg-main-50 position-relative d-block mt-16">
                        <p className="text-gray-800 mb-0">
                          You can pay in cash upon delivery.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-32 pt-32 border-top border-gray-100">
                <p className="text-gray-500">
                  Your personal data will be used to process your request and
                  improve your experience on the platform in accordance with our
                  privacy policy.
                </p>
              </div>
              <button
                type="submit"
                className="btn btn-main mt-40 py-18 w-100 rounded-8"
                disabled={isPlaceOrderDisabled}
              >
                {isSubmitting ? "..." : "Complete order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Checkout;
