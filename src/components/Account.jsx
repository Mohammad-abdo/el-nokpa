import React, { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
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
} from "../api/api";
import Support from "./AccountManagment/Support";
import Orders from "./AccountManagment/Orders";

const toReadableDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

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

const Account = () => {
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [showPasswordFields, setShowPasswordFields] = useState({
    current_password: false,
    password: false,
    password_confirmation: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelError, setCancelError] = useState("");

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

  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressesError, setAddressesError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    phone: "",
    is_default: false,
  });

  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState("");
  const [ticketFormVisible, setTicketFormVisible] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    attachments: [],
  });
  const [ticketFormError, setTicketFormError] = useState("");
  const [ticketSaving, setTicketSaving] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [replyTicketId, setReplyTicketId] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyError, setReplyError] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError("");
    try {
      const response = await getProfile();
      const payload = response?.data || response;
      const user = payload?.data || payload;
      setProfileForm((prev) => ({
        ...prev,
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        gender: user?.gender || "",
        image: null,
      }));
      if (user?.image_url) {
        setImagePreview(user.image_url);
      } else if (user?.image) {
        setImagePreview(user.image);
      } else {
        setImagePreview("");
      }
    } catch (error) {
      setProfileError(
        error?.response?.data?.message || "Unable to load profile information."
      );
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleProfileChange("image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!profileForm.name || !profileForm.phone) {
      setProfileError("Name and phone are required.");
      return;
    }
    setSavingProfile(true);
    setProfileError("");
    try {
      await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        gender: profileForm.gender,
        image: profileForm.image,
      });
      Swal.fire({
        icon: "success",
        title: "Profile updated successfully",
        showConfirmButton: false,
        timer: 2000,
      });
      setProfileForm((prev) => ({
        ...prev,
        image: null,
      }));
      await loadProfile();
    } catch (error) {
      setProfileError(
        error?.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const togglePasswordField = (field) => {
    setShowPasswordFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (
      !passwordForm.current_password ||
      !passwordForm.password ||
      !passwordForm.password_confirmation
    ) {
      setPasswordError("All fields are required.");
      return;
    }
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordError("Password confirmation does not match.");
      return;
    }
    setSavingPassword(true);
    setPasswordError("");
    try {
      await changePassword(passwordForm);
      Swal.fire({
        icon: "success",
        title: "Password updated successfully",
        showConfirmButton: false,
        timer: 2000,
      });
      setPasswordForm({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
      setShowPasswordFields({
        current_password: false,
        password: false,
        password_confirmation: false,
      });
    } catch (error) {
      setPasswordError(
        error?.response?.data?.message || "Failed to update password."
      );
    } finally {
      setSavingPassword(false);
    }
  };
  // Start HAndel Orders

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

  // Start HAndel Orders

  const loadAddresses = useCallback(async () => {
    setAddressesLoading(true);
    setAddressesError("");
    try {
      const data = await getUserAddresses();
      setAddresses(data?.data || []);
    } catch (error) {
      setAddressesError(
        error?.response?.data?.message || "Failed to load addresses"
      );
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  }, []);
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.country) {
      setAddressesError("Please fill all required fields");
      return;
    }
    try {
      await addAddress(addressForm);
      Swal.fire({
        icon: "success",
        title: "Address added successfully",
        showConfirmButton: false,
        timer: 2000,
      });
      setAddressForm({
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        phone: "",
        is_default: false,
      });
      setShowAddressForm(false);
      await loadAddresses();
    } catch (error) {
      setAddressesError(
        error?.response?.data?.message || "Failed to add address"
      );
    }
  };

  const handleDeleteAddress = async (addressId) => {
    Swal.fire({
      title: "Delete Address?",
      text: "Are you sure you want to delete this address?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteAddress(addressId);
          Swal.fire({
            icon: "success",
            title: "Address deleted successfully",
            showConfirmButton: false,
            timer: 2000,
          });
          await loadAddresses();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error?.response?.data?.message || "Failed to delete address",
          });
        }
      }
    });
  };

  // start  Support reviews
  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    setTicketsError("");
    try {
      const data = await getUserTickets();
      const items = Array.isArray(data?.data)
        ? data.data
        : data?.tickets || data || [];
      setTickets(Array.isArray(items) ? items : []);
    } catch (error) {
      setTicketsError(
        error?.response?.data?.message || "Failed to load tickets"
      );
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  const resetTicketForm = () => {
    setTicketForm({
      subject: "",
      description: "",
      attachments: [],
    });
    setTicketFormError("");
  };

  const openCreateTicket = () => {
    setEditingTicketId(null);
    resetTicketForm();
    setTicketFormVisible(true);
  };

  const openEditTicket = (ticket) => {
    const subject = ticket?.subject ?? ticket?.title ?? "";
    const description =
      ticket?.description ?? ticket?.message ?? ticket?.details ?? "";
    setEditingTicketId(ticket?.id ?? null);
    setTicketForm({
      subject,
      description,
      attachments: [],
    });
    setTicketFormError("");
    setTicketFormVisible(true);
  };

  const closeTicketForm = () => {
    setTicketFormVisible(false);
    setEditingTicketId(null);
    resetTicketForm();
  };

  const handleTicketFormChange = (field, value) => {
    setTicketForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTicketAttachmentChange = (event) => {
    const files = Array.from(event.target.files || []);
    handleTicketFormChange("attachments", files);
    event.target.value = "";
  };

  const handleTicketFormSubmit = async (event) => {
    event.preventDefault();
    const subject = ticketForm.subject.trim();
    const description = ticketForm.description.trim();
    if (!subject || !description) {
      setTicketFormError("Subject and description are required.");
      return;
    }
    setTicketSaving(true);
    setTicketFormError("");
    try {
      if (editingTicketId) {
        await updateTicket(editingTicketId, { subject, description });
        Swal.fire({
          icon: "success",
          title: "Ticket updated successfully",
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        await createTicket({
          subject,
          description,
          attachments: ticketForm.attachments,
        });
        Swal.fire({
          icon: "success",
          title: "Ticket created successfully",
          showConfirmButton: false,
          timer: 2000,
        });
      }
      await loadTickets();
      closeTicketForm();
    } catch (error) {
      setTicketFormError(
        error?.response?.data?.message ||
          (editingTicketId
            ? "Failed to update ticket."
            : "Failed to create ticket.")
      );
    } finally {
      setTicketSaving(false);
    }
  };

  const handleDeleteTicket = (ticketId) => {
    Swal.fire({
      title: "Delete Ticket?",
      text: "Are you sure you want to delete this ticket?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteTicket(ticketId);
          Swal.fire({
            icon: "success",
            title: "Ticket deleted successfully",
            showConfirmButton: false,
            timer: 2000,
          });
          if (editingTicketId === ticketId) {
            closeTicketForm();
          }
          if (replyTicketId === ticketId) {
            setReplyTicketId(null);
            setReplyMessage("");
            setReplyError("");
          }
          await loadTickets();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error?.response?.data?.message || "Failed to delete ticket",
          });
        }
      }
    });
  };

  const handleToggleReply = (ticketId) => {
    if (replyTicketId === ticketId) {
      setReplyTicketId(null);
      setReplyMessage("");
      setReplyError("");
    } else {
      setReplyTicketId(ticketId);
      setReplyMessage("");
      setReplyError("");
    }
  };

  const handleSubmitReply = async (event) => {
    event.preventDefault();
    if (!replyTicketId) {
      return;
    }
    const message = replyMessage.trim();
    if (!message) {
      setReplyError("Reply message is required.");
      return;
    }
    setReplyLoading(true);
    setReplyError("");
    try {
      await replyTicket(replyTicketId, message);
      Swal.fire({
        icon: "success",
        title: "Reply sent successfully",
        showConfirmButton: false,
        timer: 2000,
      });
      setReplyTicketId(null);
      setReplyMessage("");
      await loadTickets();
    } catch (error) {
      setReplyError(error?.response?.data?.message || "Failed to send reply.");
    } finally {
      setReplyLoading(false);
    }
  };

  // End  Support reviews

  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders();
    } else if (activeTab === "addresses") {
      loadAddresses();
    } else if (activeTab === "tickets") {
      loadTickets();
    }
  }, [activeTab, loadOrders, loadAddresses, loadTickets]);

  useEffect(() => {
    if (activeTab !== "orders") {
      setSelectedOrderId(null);
      setOrderDetails(null);
      setOrderDetailsError("");
      setCancelError("");
    }
  }, [activeTab]);

  return (
    <section className="account py-80">
      <div className="container container-lg">
        <div className="mb-40">
          <div className="nav nav-tabs flex-wrap gap-12" role="tablist">
            <button
              className={`btn ${
                activeTab === "profile" ? "btn-main" : "btn-outline-main"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              Account Details
            </button>
            <button
              className={`btn ${
                activeTab === "orders" ? "btn-main" : "btn-outline-main"
              }`}
              onClick={() => setActiveTab("orders")}
            >
              Orders
            </button>
            <button
              className={`btn ${
                activeTab === "addresses" ? "btn-main" : "btn-outline-main"
              }`}
              onClick={() => setActiveTab("addresses")}
            >
              Addresses
            </button>
            <button
              className={`btn ${
                activeTab === "tickets" ? "btn-main" : "btn-outline-main"
              }`}
              onClick={() => setActiveTab("tickets")}
            >
              Support
            </button>
          </div>
        </div>

        {activeTab === "profile" && (
          <div className="row gy-4">
            <div className="col-xl-6 pe-xl-5">
              <div className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40 h-100 bg-white">
                <h6 className="text-xl mb-32">Account details</h6>
                {profileError && (
                  <div className="text-danger-600 text-sm mb-24 text-center">
                    {profileError}
                  </div>
                )}
                {profileLoading ? (
                  <div className="text-gray-500 text-sm text-center py-24">
                    Loading profile...
                  </div>
                ) : (
                  <form onSubmit={handleProfileSubmit}>
                    <div className="mb-24">
                      <label className="text-neutral-900 text-lg mb-8 fw-medium">
                        Profile image
                      </label>
                      <div className="d-flex align-items-center gap-16">
                        <div
                          className="rounded-circle overflow-hidden border border-gray-100"
                          style={{ width: 64, height: 64 }}
                        >
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Profile"
                              className="w-100 h-100 object-fit-cover"
                            />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-neutral-100 text-neutral-500 text-lg fw-semibold">
                              {profileForm.name
                                ? profileForm.name.charAt(0).toUpperCase()
                                : "?"}
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={handleImageChange}
                          disabled={savingProfile}
                        />
                      </div>
                    </div>
                    <div className="mb-24">
                      <label
                        htmlFor="profileName"
                        className="text-neutral-900 text-lg mb-8 fw-medium"
                      >
                        Full name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="common-input"
                        id="profileName"
                        placeholder="Enter your name"
                        value={profileForm.name}
                        onChange={(event) =>
                          handleProfileChange("name", event.target.value)
                        }
                        disabled={savingProfile}
                        required
                      />
                    </div>
                    <div className="mb-24">
                      <label
                        htmlFor="profileEmail"
                        className="text-neutral-900 text-lg mb-8 fw-medium"
                      >
                        Email address
                      </label>
                      <input
                        type="email"
                        className="common-input"
                        id="profileEmail"
                        placeholder="Enter your email"
                        value={profileForm.email}
                        onChange={(event) =>
                          handleProfileChange("email", event.target.value)
                        }
                        disabled={savingProfile}
                      />
                    </div>
                    <div className="mb-24">
                      <label
                        htmlFor="profilePhone"
                        className="text-neutral-900 text-lg mb-8 fw-medium"
                      >
                        Phone number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className="common-input"
                        id="profilePhone"
                        placeholder="Enter your phone number"
                        value={profileForm.phone}
                        onChange={(event) =>
                          handleProfileChange("phone", event.target.value)
                        }
                        disabled={savingProfile}
                        required
                      />
                    </div>
                    <div className="mb-24">
                      <label
                        htmlFor="profileGender"
                        className="text-neutral-900 text-lg mb-8 fw-medium"
                      >
                        Gender
                      </label>
                      <select
                        id="profileGender"
                        className="common-input"
                        value={profileForm.gender || ""}
                        onChange={(event) =>
                          handleProfileChange("gender", event.target.value)
                        }
                        disabled={savingProfile}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-main py-18 px-40 w-100"
                      disabled={savingProfile}
                    >
                      {savingProfile ? "Saving..." : "Save changes"}
                    </button>
                  </form>
                )}
              </div>
            </div>
            <div className="col-xl-6">
              <div className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40 h-100 bg-white">
                <h6 className="text-xl mb-32">Change password</h6>
                {passwordError && (
                  <div className="text-danger-600 text-sm mb-24 text-center">
                    {passwordError}
                  </div>
                )}
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-24">
                    <label
                      htmlFor="currentPassword"
                      className="text-neutral-900 text-lg mb-8 fw-medium"
                    >
                      Current password
                    </label>
                    <div className="position-relative">
                      <input
                        type={
                          showPasswordFields.current_password
                            ? "text"
                            : "password"
                        }
                        className="common-input"
                        id="currentPassword"
                        placeholder="Enter current password"
                        value={passwordForm.current_password}
                        onChange={(event) =>
                          handlePasswordChange(
                            "current_password",
                            event.target.value
                          )
                        }
                        disabled={savingPassword}
                      />
                      <span
                        className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ${
                          showPasswordFields.current_password
                            ? "ph-eye"
                            : "ph-eye-slash"
                        }`}
                        onClick={() => togglePasswordField("current_password")}
                      />
                    </div>
                  </div>
                  <div className="mb-24">
                    <label
                      htmlFor="newPassword"
                      className="text-neutral-900 text-lg mb-8 fw-medium"
                    >
                      New password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPasswordFields.password ? "text" : "password"}
                        className="common-input"
                        id="newPassword"
                        placeholder="Enter new password"
                        value={passwordForm.password}
                        onChange={(event) =>
                          handlePasswordChange("password", event.target.value)
                        }
                        disabled={savingPassword}
                      />
                      <span
                        className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ${
                          showPasswordFields.password
                            ? "ph-eye"
                            : "ph-eye-slash"
                        }`}
                        onClick={() => togglePasswordField("password")}
                      />
                    </div>
                  </div>
                  <div className="mb-40">
                    <label
                      htmlFor="confirmPassword"
                      className="text-neutral-900 text-lg mb-8 fw-medium"
                    >
                      Confirm password
                    </label>
                    <div className="position-relative">
                      <input
                        type={
                          showPasswordFields.password_confirmation
                            ? "text"
                            : "password"
                        }
                        className="common-input"
                        id="confirmPassword"
                        placeholder="Confirm new password"
                        value={passwordForm.password_confirmation}
                        onChange={(event) =>
                          handlePasswordChange(
                            "password_confirmation",
                            event.target.value
                          )
                        }
                        disabled={savingPassword}
                      />
                      <span
                        className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ${
                          showPasswordFields.password_confirmation
                            ? "ph-eye"
                            : "ph-eye-slash"
                        }`}
                        onClick={() =>
                          togglePasswordField("password_confirmation")
                        }
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-main py-18 px-40 w-100"
                    disabled={savingPassword}
                  >
                    {savingPassword ? "Updating..." : "Update password"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
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
                                onClick={() =>
                                  orderId && handleViewOrder(orderId)
                                }
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
        )}

        {activeTab === "addresses" && (
          <div className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-32">
              <h6 className="text-xl mb-0">My Addresses</h6>
              {!showAddressForm && (
                <button
                  className="btn btn-main btn-sm"
                  onClick={() => setShowAddressForm(true)}
                >
                  Add Address
                </button>
              )}
            </div>
            {addressesError && (
              <div className="text-danger-600 text-sm mb-24 text-center">
                {addressesError}
              </div>
            )}
            {showAddressForm && (
              <form
                onSubmit={handleAddAddress}
                className="mb-32 p-16 bg-gray-50 rounded-12"
              >
                <div className="row gy-3">
                  <div className="col-md-6">
                    <label className="text-neutral-900 text-sm fw-medium mb-8">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      className="common-input"
                      placeholder="Street address"
                      value={addressForm.street}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          street: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="text-neutral-900 text-sm fw-medium mb-8">
                      City *
                    </label>
                    <input
                      type="text"
                      className="common-input"
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="text-neutral-900 text-sm fw-medium mb-8">
                      State
                    </label>
                    <input
                      type="text"
                      className="common-input"
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          state: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="text-neutral-900 text-sm fw-medium mb-8">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      className="common-input"
                      placeholder="Postal code"
                      value={addressForm.postal_code}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          postal_code: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="text-neutral-900 text-sm fw-medium mb-8">
                      Country *
                    </label>
                    <input
                      type="text"
                      className="common-input"
                      placeholder="Country"
                      value={addressForm.country}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          country: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="text-neutral-900 text-sm fw-medium mb-8">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="common-input"
                      placeholder="Phone number"
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="defaultAddress"
                        checked={addressForm.is_default}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            is_default: e.target.checked,
                          })
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="defaultAddress"
                      >
                        Set as default address
                      </label>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-12 mt-20">
                  <button type="submit" className="btn btn-main btn-sm">
                    Save Address
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-main btn-sm"
                    onClick={() => setShowAddressForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {addressesLoading ? (
              <div className="text-gray-500 text-sm text-center py-24">
                Loading addresses...
              </div>
            ) : addresses.length > 0 ? (
              <div className="row gy-3">
                {addresses.map((address) => (
                  <div key={address.id} className="col-md-6">
                    <div className="border border-gray-100 rounded-12 p-16">
                      <div className="d-flex justify-content-between align-items-start mb-12">
                        <h6 className="text-sm fw-semibold mb-0">
                          {address.city}, {address.country}
                        </h6>
                        {address.is_default && (
                          <span className="badge bg-success-100 text-success-600">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs mb-12">
                        {address.street}
                        <br />
                        {address.state && `${address.state}, `}
                        {address.postal_code}
                      </p>
                      {address.phone && (
                        <p className="text-gray-600 text-xs mb-12">
                          {address.phone}
                        </p>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteAddress(address.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm text-center py-24">
                No addresses found
              </div>
            )}
          </div>
        )}

        {activeTab === "tickets" && <Support />}
      </div>
    </section>
  );
};

export default Account;
