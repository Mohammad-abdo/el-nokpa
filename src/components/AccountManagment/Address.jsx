import React from "react";

const Address = () => {
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
  return <div></div>;
};

export default Address;
