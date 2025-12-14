import React, { useCallback, useState } from "react";
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
const toReadableDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};
const resolveTicketStatus = (status) => {
  const source = status ?? "Pending";
  const label =
    typeof source === "object"
      ? source?.label ?? source?.name ?? source?.status ?? "Pending"
      : source;
  const value = String(label).toLowerCase();
  if (value.includes("close"))
    return { label: String(label), badge: "bg-danger-100 text-danger-600" };
  if (value.includes("resolve"))
    return { label: String(label), badge: "bg-success-100 text-success-600" };
  if (value.includes("open"))
    return { label: String(label), badge: "bg-success-100 text-success-600" };
  if (value.includes("pend"))
    return { label: String(label), badge: "bg-warning-100 text-warning-600" };
  return { label: String(label), badge: "bg-main-100 text-main-600" };
};
const Support = () => {
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
  return (
    <>
      <div className="border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-12 mb-16">
          <h6 className="text-xl mb-0">My Support Tickets</h6>
          <button
            className="btn btn-main btn-sm"
            onClick={() =>
              ticketFormVisible ? closeTicketForm() : openCreateTicket()
            }
            disabled={ticketSaving}
          >
            {ticketFormVisible ? "Cancel" : "New Ticket"}
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-24">
          Manage support requests, send new issues, and reply with updates.
        </p>
        {ticketFormVisible && (
          <form
            onSubmit={handleTicketFormSubmit}
            className="mb-32 p-20 bg-gray-50 rounded-12 border border-gray-100"
          >
            <div className="row gy-3">
              <div className="col-12">
                <label className="text-neutral-900 text-sm fw-medium mb-8">
                  Subject *
                </label>
                <input
                  type="text"
                  className="common-input"
                  placeholder="Enter a clear subject"
                  value={ticketForm.subject}
                  onChange={(event) =>
                    handleTicketFormChange("subject", event.target.value)
                  }
                  disabled={ticketSaving}
                  required
                />
              </div>
              <div className="col-12">
                <label className="text-neutral-900 text-sm fw-medium mb-8">
                  Description *
                </label>
                <textarea
                  className="common-input"
                  rows={4}
                  placeholder="Describe the issue in detail"
                  value={ticketForm.description}
                  onChange={(event) =>
                    handleTicketFormChange("description", event.target.value)
                  }
                  disabled={ticketSaving}
                  required
                />
              </div>
              {!editingTicketId && (
                <div className="col-12">
                  <label className="text-neutral-900 text-sm fw-medium mb-8">
                    Attachments
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    onChange={handleTicketAttachmentChange}
                    disabled={ticketSaving}
                  />
                  {ticketForm.attachments.length > 0 && (
                    <div className="d-flex flex-wrap gap-12 mt-12">
                      {ticketForm.attachments.map((file, index) => {
                        const label =
                          file?.name ??
                          file?.filename ??
                          file?.file_name ??
                          `File ${index + 1}`;
                        return (
                          <span
                            key={`${label}-${index}`}
                            className="badge bg-main-100 text-main-600"
                          >
                            {label}
                          </span>
                        );
                      })}
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() =>
                          handleTicketFormChange("attachments", [])
                        }
                        disabled={ticketSaving}
                      >
                        Clear Files
                      </button>
                    </div>
                  )}
                  <p className="text-gray-500 text-xs mt-12 mb-0">
                    PDF, DOC, DOCX, JPG, JPEG, PNG. Max 2MB each.
                  </p>
                </div>
              )}
            </div>
            {ticketFormError && (
              <div className="text-danger-600 text-sm text-center mb-16">
                {ticketFormError}
              </div>
            )}
            <div className="d-flex flex-wrap gap-12">
              <button
                type="submit"
                className="btn btn-main btn-sm"
                disabled={ticketSaving}
              >
                {ticketSaving
                  ? "Saving..."
                  : editingTicketId
                  ? "Update Ticket"
                  : "Create Ticket"}
              </button>
              <button
                type="button"
                className="btn btn-outline-main btn-sm"
                onClick={closeTicketForm}
                disabled={ticketSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {ticketsError && (
          <div className="text-danger-600 text-sm mb-24 text-center">
            {ticketsError}
          </div>
        )}
        {ticketsLoading ? (
          <div className="text-gray-500 text-sm text-center py-24">
            Loading tickets...
          </div>
        ) : tickets.length > 0 ? (
          <div className="row gy-3">
            {tickets.map((ticket, index) => {
              const ticketId = ticket?.id ?? index;
              const subject =
                ticket?.subject ?? ticket?.title ?? `Ticket #${ticketId}`;
              const statusInfo = resolveTicketStatus(
                ticket?.status ??
                  ticket?.state ??
                  ticket?.ticket_status ??
                  ticket?.status_label
              );
              const createdAt =
                ticket?.created_at ??
                ticket?.createdAt ??
                ticket?.created ??
                ticket?.updated_at;
              const description =
                ticket?.description ?? ticket?.message ?? ticket?.details ?? "";
              const reference =
                ticket?.reference ??
                ticket?.ticket_number ??
                ticket?.number ??
                ticket?.code ??
                "";
              const attachments = Array.isArray(ticket?.attachments)
                ? ticket.attachments
                : [];
              return (
                <div key={`${ticketId}-${index}`} className="col-md-6">
                  <div className="border border-gray-100 rounded-12 p-16 bg-light-purple">
                    <div className="d-flex justify-content-between align-items-start mb-12">
                      <div>
                        <h6 className="text-sm fw-semibold mb-8">{subject}</h6>
                        {reference && (
                          <span className="text-gray-600 text-xs">
                            #{reference}
                          </span>
                        )}
                      </div>
                      <span className={`badge ${statusInfo.badge}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    {description && (
                      <p className="text-gray-600 text-xs mb-12 text-line-2">
                        {description}
                      </p>
                    )}
                    <div className="row gy-2 text-xs mt-12 pt-12 border-top border-gray-100">
                      <div className="col-6">
                        <span className="text-gray-600">Created:</span>
                        <br />
                        <span className="fw-semibold">
                          {toReadableDate(createdAt)}
                        </span>
                      </div>
                      <div className="col-6">
                        <span className="text-gray-600">Attachments:</span>
                        <br />
                        <span className="fw-semibold">
                          {attachments.length}
                        </span>
                      </div>
                    </div>
                    {attachments.length > 0 && (
                      <div className="mt-12">
                        <span className="text-gray-600 text-xs d-block mb-8">
                          Attachment Links:
                        </span>
                        <div className="d-flex flex-column gap-8">
                          {attachments.map((attachment, attachmentIndex) => {
                            const label =
                              attachment?.name ??
                              attachment?.original_name ??
                              attachment?.filename ??
                              attachment?.file_name ??
                              `Attachment ${attachmentIndex + 1}`;
                            const link =
                              attachment?.url ??
                              attachment?.path ??
                              attachment?.link;
                            return link ? (
                              <a
                                key={`${ticketId}-attachment-${attachmentIndex}`}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-main-600 text-xs"
                              >
                                {label}
                              </a>
                            ) : (
                              <span
                                key={`${ticketId}-attachment-${attachmentIndex}`}
                                className="text-gray-600 text-xs"
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <div className="d-flex flex-wrap gap-12 mt-16">
                      <button
                        type="button"
                        className="btn btn-outline-main btn-sm"
                        onClick={() => openEditTicket(ticket)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-main btn-sm"
                        onClick={() => handleToggleReply(ticketId)}
                      >
                        Reply
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDeleteTicket(ticketId)}
                      >
                        Delete
                      </button>
                    </div>
                    {replyTicketId === ticketId && (
                      <form className="mt-16" onSubmit={handleSubmitReply}>
                        {replyError && (
                          <div className="text-danger-600 text-xs mb-12">
                            {replyError}
                          </div>
                        )}
                        <textarea
                          className="common-input"
                          rows={3}
                          placeholder="Write your reply"
                          value={replyMessage}
                          onChange={(event) =>
                            setReplyMessage(event.target.value)
                          }
                          disabled={replyLoading}
                        />
                        <div className="d-flex flex-wrap gap-12 mt-12">
                          <button
                            type="submit"
                            className="btn btn-main btn-sm"
                            disabled={replyLoading}
                          >
                            {replyLoading ? "Sending..." : "Send Reply"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-main btn-sm"
                            onClick={() => handleToggleReply(ticketId)}
                            disabled={replyLoading}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-500 text-sm text-center py-24">
            No tickets available
          </div>
        )}
      </div>
    </>
  );
};

export default Support;
