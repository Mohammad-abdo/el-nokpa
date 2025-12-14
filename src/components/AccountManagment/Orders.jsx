import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  changePassword,
  getProfile,
  updateProfile,
  getUserOrders,
  getOrderDetails,
  cancelOrder,
  getUserAddresses,
  addAddress,
  deleteAddress,
  getUserTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  replyTicket,
} from "../../api/api";
import Swal from "sweetalert2";
const resolveOrderStatus = (status) => {
  const source =
    typeof status === "object" && status !== null
      ? status.label ?? status.name ?? status.status ?? status.value ?? status
      : status;
  const label = source || "Pending";
  const value = String(label).toLowerCase();
  let badge = "bg-main-100 text-main-600";
  if (value.includes("cancel") || value.includes("reject")) {
    badge = "bg-danger-100 text-danger-600";
  } else if (value.includes("complete") || value.includes("deliver")) {
    badge = "bg-success-100 text-success-600";
  } else if (value.includes("pend") || value.includes("process")) {
    badge = "bg-warning-100 text-warning-600";
  }
  return { label: String(label), value, badge };
};

const isOrderCancelable = (order) => {
  if (!order) return false;
  if (order.is_cancelable !== undefined) return Boolean(order.is_cancelable);
  if (order.can_cancel !== undefined) return Boolean(order.can_cancel);
  const statusInfo = resolveOrderStatus(
    order.status ?? order.status_label ?? order.order_status
  );
  return (
    !statusInfo.value.includes("cancel") &&
    !statusInfo.value.includes("complete") &&
    !statusInfo.value.includes("deliver")
  );
};

const toCurrency = (value) => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") {
    const amount =
      value.amount ??
      value.total ??
      value.value ??
      value.price ??
      value.data ??
      null;
    if (amount !== null && amount !== undefined && amount !== value) {
      return toCurrency(amount);
    }
    return "—";
  }
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return `$${numeric.toFixed(2)}`;
  return String(value);
};

const resolveOrderItems = (order) => {
  if (!order) return [];
  if (Array.isArray(order.items)) return order.items;
  if (Array.isArray(order.order_items)) return order.order_items;
  if (Array.isArray(order.products)) return order.products;
  if (Array.isArray(order.details)) return order.details;
  if (Array.isArray(order.cart_items)) return order.cart_items;
  return [];
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  const [cancelError, setCancelError] = useState("");
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const data = await getUserOrders();
      setOrders(data?.data || []);
    } catch (error) {
      setOrdersError(error?.response?.data?.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);
  const toReadableDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
  };
  const handleViewOrder = async (orderId) => {
    if (!orderId) return;
    setSelectedOrderId(orderId);
    setOrderDetails(null);
    setOrderDetailsError("");
    setOrderDetailsLoading(true);
    try {
      const response = await getOrderDetails(orderId);
      const payload = response?.data || response;
      const details = payload?.data || payload;
      setOrderDetails(details);
    } catch (error) {
      setOrderDetailsError(
        error?.response?.data?.message || "Failed to load order details."
      );
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrderId(null);
    setOrderDetails(null);
    setOrderDetailsError("");
    setCancelError("");
  };

  const handleCancelOrder = (orderId) => {
    if (!orderId) return;
    const order =
      orders.find((item) => {
        const itemId =
          item?.id ??
          item?.order_id ??
          item?.orderId ??
          item?.code ??
          item?.reference ??
          item?.number ??
          null;
        if (!itemId) return false;
        return String(itemId) === String(orderId);
      }) || null;
    if (order && !isOrderCancelable(order)) {
      Swal.fire({
        icon: "info",
        title: "Order cannot be canceled",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }
    Swal.fire({
      title: "Cancel Order?",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel",
      cancelButtonText: "No",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setCancellingOrderId(orderId);
        setCancelError("");
        try {
          await cancelOrder(orderId);
          Swal.fire({
            icon: "success",
            title: "Order canceled successfully",
            showConfirmButton: false,
            timer: 2000,
          });
          await loadOrders();
          if (selectedOrderId === orderId) {
            await handleViewOrder(orderId);
          }
        } catch (error) {
          const message =
            error?.response?.data?.message || "Failed to cancel order.";
          setCancelError(message);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: message,
          });
        } finally {
          setCancellingOrderId(null);
        }
      }
    });
  };
  const selectedOrderSummary = useMemo(() => {
    if (!selectedOrderId) return null;
    const match = orders.find((item) => {
      const itemId =
        item?.id ??
        item?.order_id ??
        item?.orderId ??
        item?.code ??
        item?.reference ??
        item?.number ??
        null;
      if (!itemId) return false;
      return String(itemId) === String(selectedOrderId);
    });
    return match || null;
  }, [orders, selectedOrderId]);
  const renderOrderDetails = () => {
    if (!selectedOrderId) return null;
    const summary = orderDetails || selectedOrderSummary || {};
    const statusInfo = resolveOrderStatus(
      summary.status ??
        summary.status_label ??
        summary.order_status ??
        summary.state ??
        null
    );
    const createdAt =
      summary.created_at ??
      summary.createdAt ??
      summary.created ??
      summary.updated_at ??
      summary.date ??
      null;
    const paymentMethod =
      summary.payment_method ??
      summary.paymentMethod ??
      summary.payment_type ??
      summary.payment?.method ??
      summary.payment?.name ??
      "—";
    const paymentLabel =
      typeof paymentMethod === "object"
        ? paymentMethod?.label ??
          paymentMethod?.name ??
          paymentMethod?.title ??
          paymentMethod?.method ??
          "—"
        : paymentMethod;
    const subtotalValue =
      summary.subtotal ??
      summary.total_before_tax ??
      summary.summary?.subtotal ??
      null;
    const shippingValue =
      summary.shipping_total ??
      summary.shipping_cost ??
      summary.summary?.shipping ??
      null;
    const discountValue =
      summary.discount ??
      summary.discount_total ??
      summary.summary?.discount ??
      null;
    const taxValue =
      summary.tax ?? summary.tax_total ?? summary.summary?.tax ?? null;
    const totalValue =
      summary.total ??
      summary.total_amount ??
      summary.grand_total ??
      summary.summary?.total ??
      summary.amount ??
      null;
    const items = resolveOrderItems(orderDetails || summary);
    const shippingAddress = resolveAddress(orderDetails || summary, "shipping");
    const billingAddress = resolveAddress(orderDetails || summary, "billing");
    const allowCancel =
      Boolean(selectedOrderId) &&
      (orderDetails
        ? isOrderCancelable(orderDetails)
        : isOrderCancelable(selectedOrderSummary));
    const resolveAddress = (order, type) => {
      if (!order) return null;
      const keys =
        type === "shipping"
          ? [
              "shipping_address",
              "shippingAddress",
              "shipping",
              "delivery_address",
              "deliveryAddress",
            ]
          : ["billing_address", "billingAddress", "billing", "payment_address"];
      for (const key of keys) {
        const value = order[key];
        if (value) return value;
      }
      return null;
    };
    return (
      <div className="border border-gray-100 rounded-16 mt-32 p-24 bg-gray-50">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-12 mb-24">
          <div>
            <h6 className="text-lg mb-8">Order Details</h6>
            <div className="d-flex flex-wrap align-items-center gap-12">
              <span className="text-sm text-gray-600">
                Order #{selectedOrderId}
              </span>
              <span className={`badge ${statusInfo.badge}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-12">
            {allowCancel && (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleCancelOrder(selectedOrderId)}
                disabled={cancellingOrderId === selectedOrderId}
              >
                {cancellingOrderId === selectedOrderId
                  ? "Canceling..."
                  : "Cancel Order"}
              </button>
            )}
            <button
              className="btn btn-sm btn-outline-main"
              onClick={handleCloseOrderDetails}
            >
              Close
            </button>
          </div>
        </div>
        {orderDetailsLoading ? (
          <div className="text-gray-500 text-sm text-center py-24">
            Loading order details...
          </div>
        ) : orderDetailsError ? (
          <div className="text-danger-600 text-sm text-center py-24">
            {orderDetailsError}
          </div>
        ) : orderDetails ? (
          <>
            <div className="row gy-3 mb-24">
              <div className="col-md-6">
                <div className="p-16 bg-white rounded-12 border border-gray-100 h-100">
                  <h6 className="text-sm fw-semibold text-neutral-900 mb-12">
                    Summary
                  </h6>
                  <div className="d-flex justify-content-between text-sm text-gray-600 mb-8">
                    <span>Placed</span>
                    <span>{createdAt ? toReadableDate(createdAt) : "N/A"}</span>
                  </div>
                  <div className="d-flex justify-content-between text-sm text-gray-600 mb-8">
                    <span>Payment</span>
                    <span className="text-neutral-900 fw-semibold">
                      {paymentLabel || "—"}
                    </span>
                  </div>
                  {subtotalValue !== null && (
                    <div className="d-flex justify-content-between text-sm text-gray-600 mb-8">
                      <span>Subtotal</span>
                      <span>{toCurrency(subtotalValue)}</span>
                    </div>
                  )}
                  {shippingValue !== null && (
                    <div className="d-flex justify-content-between text-sm text-gray-600 mb-8">
                      <span>Shipping</span>
                      <span>{toCurrency(shippingValue)}</span>
                    </div>
                  )}
                  {discountValue !== null && (
                    <div className="d-flex justify-content-between text-sm text-gray-600 mb-8">
                      <span>Discount</span>
                      <span>{toCurrency(discountValue)}</span>
                    </div>
                  )}
                  {taxValue !== null && (
                    <div className="d-flex justify-content-between text-sm text-gray-600 mb-8">
                      <span>Tax</span>
                      <span>{toCurrency(taxValue)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between text-sm text-neutral-900 fw-semibold">
                    <span>Total</span>
                    <span>{toCurrency(totalValue)}</span>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-16 bg-white rounded-12 border border-gray-100 h-100">
                  <h6 className="text-sm fw-semibold text-neutral-900 mb-12">
                    Addresses
                  </h6>
                  <div className="mb-16">
                    <span className="text-xs text-gray-500 d-block mb-4">
                      Shipping
                    </span>
                    {shippingAddress ? (
                      <div className="text-sm text-gray-600">
                        {shippingAddress?.name && (
                          <div className="text-neutral-900 fw-semibold">
                            {shippingAddress.name}
                          </div>
                        )}
                        {shippingAddress?.street && (
                          <div>{shippingAddress.street}</div>
                        )}
                        <div>
                          {[
                            shippingAddress?.city,
                            shippingAddress?.state,
                            shippingAddress?.postal_code,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                        {shippingAddress?.country && (
                          <div>{shippingAddress.country}</div>
                        )}
                        {shippingAddress?.phone && (
                          <div>{shippingAddress.phone}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No shipping address available
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 d-block mb-4">
                      Billing
                    </span>
                    {billingAddress ? (
                      <div className="text-sm text-gray-600">
                        {billingAddress?.name && (
                          <div className="text-neutral-900 fw-semibold">
                            {billingAddress.name}
                          </div>
                        )}
                        {billingAddress?.street && (
                          <div>{billingAddress.street}</div>
                        )}
                        <div>
                          {[
                            billingAddress?.city,
                            billingAddress?.state,
                            billingAddress?.postal_code,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                        {billingAddress?.country && (
                          <div>{billingAddress.country}</div>
                        )}
                        {billingAddress?.phone && (
                          <div>{billingAddress.phone}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No billing address available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="border border-gray-100 rounded-12 bg-white">
              <div className="px-20 py-16 border-bottom border-gray-100">
                <h6 className="text-sm fw-semibold text-neutral-900 mb-0">
                  Items
                </h6>
              </div>
              {items.length > 0 ? (
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, itemIndex) => {
                        const name =
                          item?.product?.name ??
                          item?.name ??
                          item?.product_name ??
                          item?.title ??
                          `Item ${itemIndex + 1}`;
                        const quantity =
                          item?.quantity ?? item?.qty ?? item?.count ?? 1;
                        const price =
                          item?.price ??
                          item?.unit_price ??
                          item?.price_per_unit ??
                          item?.amount ??
                          0;
                        const total =
                          item?.total ??
                          item?.subtotal ??
                          item?.line_total ??
                          (Number(price) * Number(quantity) || price);
                        return (
                          <tr key={`${name}-${itemIndex}`}>
                            <td>{name}</td>
                            <td>{quantity}</td>
                            <td>{toCurrency(price)}</td>
                            <td>{toCurrency(total)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500 text-sm text-center py-24">
                  No items found for this order
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-gray-500 text-sm text-center py-24">
            Order details unavailable
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (activeTab !== "orders") {
      setSelectedOrderId(null);
      setOrderDetails(null);
      setOrderDetailsError("");
      setCancelError("");
    }
  }, [activeTab]);

  return (
    <>
      <div className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40 bg-white">
        <h6 className="text-xl mb-32">My Orders</h6>
        {ordersError && (
          <div className="text-danger-600 text-sm mb-24 text-center">
            {ordersError}
          </div>
        )}
        {ordersLoading ? (
          <div className="text-gray-500 text-sm text-center py-24">
            Loading orders...
          </div>
        ) : orders.length > 0 ? (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const orderId =
                    order?.id ??
                    order?.order_id ??
                    order?.orderId ??
                    order?.code ??
                    order?.reference ??
                    order?.number ??
                    null;
                  const createdAt =
                    order?.created_at ??
                    order?.createdAt ??
                    order?.created ??
                    order?.updated_at ??
                    order?.date ??
                    null;
                  const totalValue =
                    order?.total ??
                    order?.total_amount ??
                    order?.grand_total ??
                    order?.summary?.total ??
                    order?.amount ??
                    order?.price ??
                    0;
                  const statusInfo = resolveOrderStatus(
                    order?.status ??
                      order?.status_label ??
                      order?.order_status ??
                      order?.state ??
                      order?.statusName ??
                      null
                  );
                  const canCancel =
                    Boolean(orderId) && isOrderCancelable(order);
                  return (
                    <tr key={`${orderId ?? index}-${index}`}>
                      <td>{orderId ? `#${orderId}` : "N/A"}</td>
                      <td>
                        {createdAt
                          ? new Date(createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>{toCurrency(totalValue)}</td>
                      <td>
                        <span className={`badge ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-8">
                          <button
                            className="btn btn-sm btn-outline-main"
                            onClick={() => orderId && handleViewOrder(orderId)}
                            disabled={
                              !orderId ||
                              orderDetailsLoading ||
                              cancellingOrderId === orderId
                            }
                          >
                            View
                          </button>
                          {canCancel && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleCancelOrder(orderId)}
                              disabled={cancellingOrderId === orderId}
                            >
                              {cancellingOrderId === orderId
                                ? "Canceling..."
                                : "Cancel"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500 text-sm text-center py-24">
            No orders found
          </div>
        )}
        {cancelError && (
          <div className="text-danger-600 text-sm text-center mt-24">
            {cancelError}
          </div>
        )}
        {renderOrderDetails()}
      </div>
    </>
  );
};

export default Orders;
