import React from "react";

const AccountDetails = () => {
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
  return <div></div>;
};

export default AccountDetails;
