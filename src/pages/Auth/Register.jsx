import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authRegister } from "../../api/api";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    password_confirmation: "",
    gender: "",
    invitation_code: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (files && files.length) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });
    try {
      const response = await authRegister(formData);
      const successMessage =
        response?.message || "Account created successfully. Welcome aboard!";
      setFeedback({ type: "success", message: successMessage });
      setTimeout(() => navigate("/login"), 1800);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to create account. Please check your details.";
      setFeedback({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth auth-eyewear auth-eyewear--register py-80 py-md-0 min-vh-100 d-flex align-items-center">
      <div className="container container-lg w-100 position-relative">
        <div className="row g-40 align-items-center">
          <div className="col-xl-6 col-lg-6 order-2 order-xl-1">
            <div className="auth-eyewear__content">
              <span className="auth-eyewear__badge">
                ابدأ رحلتك في التسوق
              </span>
              <h1 className="auth-eyewear__title">
                أنشئ حسابك في متجر النخبة
              </h1>
              <p className="auth-eyewear__subtitle">
                سجّل للاستمتاع بتجربة تسوق مميزة، وإدارة طلباتك، والحصول على توصيات مبنية على تفضيلاتك.
              </p>
              <div className="auth-eyewear__glass-card auth-eyewear__glass-card--alt shadow-sm">
                <div className="auth-eyewear__glass-main">
                  <span className="auth-eyewear__glass-icon ph ph-gift" />
                  <div className="auth-eyewear__glass-copy">
                    <span className="auth-eyewear__glass-heading">
                      فوائد العضوية المميزة
                    </span>
                    <span className="auth-eyewear__glass-text">
                      خصم 20% على أول طلب وتوصيل مجاني على جميع الطلبات
                    </span>
                  </div>
                </div>
                    <span className="auth-eyewear__glass-pill">حصري</span>
              </div>
              <div className="auth-eyewear__features auth-eyewear__features--split">
                <div className="auth-eyewear__feature">
                  <span className="auth-eyewear__feature-icon ph ph-calendar-dots" />
                  <div>
                    <h5 className="auth-eyewear__feature-title">
                      تتبع الطلبات
                    </h5>
                    <p className="auth-eyewear__feature-text">
                      احفظ طلباتك السابقة واحصل على تذكيرات للعروض الخاصة.
                    </p>
                  </div>
                </div>
                <div className="auth-eyewear__feature">
                  <span className="auth-eyewear__feature-icon ph ph-truck" />
                  <div>
                    <h5 className="auth-eyewear__feature-title">
                      شحن آمن وسريع
                    </h5>
                    <p className="auth-eyewear__feature-text">
                      تتبع شحناتك في الوقت الفعلي مع تغليف آمن لحماية منتجاتك.
                    </p>
                  </div>
                </div>
              </div>
              <div className="auth-eyewear__assurance">
                <span>لديك حساب بالفعل؟</span>
                <Link to="/login" className="auth-eyewear__assurance-link">
                  سجّل الدخول للوصول إلى حسابك
                </Link>
              </div>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 order-1 order-xl-2">
            <div className="auth-eyewear__card auth-eyewear__card--register">
              <div className="auth-eyewear__card-header text-center">
                <span className="auth-eyewear__card-badge">
                  <img src="assets/images/logo/logo.png" alt="" width={100} />{" "}
                </span>
                <h2 className="auth-eyewear__card-title">
                  إنشاء حساب جديد
                </h2>
                <p className="auth-eyewear__card-text">
                  أدخل بياناتك لإكمال التسجيل والاستمتاع بتجربة تسوق مميزة.
                </p>
              </div>
              <form
                onSubmit={handleSubmit}
                className="auth-eyewear__form-grid row g-24"
              >
                <div className="col-md-6">
                  <div className="auth-eyewear__field auth-eyewear__field--compact">
                    <label htmlFor="name" className="mt-10 auth-eyewear__label">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="common-input auth-eyewear__input"
                      placeholder="أدخل اسمك الكامل"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="auth-eyewear__field auth-eyewear__field--compact">
                    <label
                      htmlFor="phone"
                      className="mt-10 auth-eyewear__label"
                    >
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="common-input auth-eyewear__input"
                      placeholder="e.g. 0501234567"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="auth-eyewear__field auth-eyewear__field--compact">
                    <label
                      htmlFor="email"
                      className="mt-10 auth-eyewear__label"
                    >
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="common-input auth-eyewear__input"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="auth-eyewear__field auth-eyewear__field--compact">
                    <label
                      htmlFor="gender"
                      className="mt-10 auth-eyewear__label"
                    >
                      الجنس
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="common-input auth-eyewear__input"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">اختر الجنس</option>
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="auth-eyewear__field auth-eyewear__field--compact">
                    <label
                      htmlFor="password"
                      className="mt-10 auth-eyewear__label"
                    >
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className="common-input auth-eyewear__input"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="auth-eyewear__field auth-eyewear__field--compact">
                    <label
                      htmlFor="password_confirmation"
                      className="mt-10 auth-eyewear__label"
                    >
                      تأكيد كلمة المرور
                    </label>
                    <input
                      type="password"
                      id="password_confirmation"
                      name="password_confirmation"
                      className="common-input auth-eyewear__input"
                      placeholder="••••••••"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="auth-eyewear__field auth-eyewear__field--compact">
                    <label
                      htmlFor="invitation_code"
                      className="mt-10 auth-eyewear__label"
                    >
                      كود الدعوة (اختياري)
                    </label>
                    <input
                      type="text"
                      id="invitation_code"
                      name="invitation_code"
                      className="common-input auth-eyewear__input"
                      placeholder="أدخل كود الدعوة"
                      value={formData.invitation_code}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="auth-eyewear__field auth-eyewear__field--compact">
                    <label
                      htmlFor="image"
                      className="mt-10 auth-eyewear__label"
                    >
                      الصورة الشخصية
                    </label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      className="common-input auth-eyewear__input"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                {feedback.message && (
                  <div className="col-12">
                    <div
                      className={`auth-eyewear__feedback ${
                        feedback.type === "success"
                          ? "auth-eyewear__feedback--success"
                          : "auth-eyewear__feedback--error"
                      }`}
                    >
                      {feedback.message}
                    </div>
                  </div>
                )}
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-main mt-10 py-18 w-100"
                    disabled={loading}
                  >
                    {loading
                      ? "جاري إنشاء حسابك..."
                      : "إنشاء حساب جديد"}
                  </button>
                </div>
              </form>
              <div className="auth-eyewear__card-footer">
                <span className="ph ph-lightning" />
                <p className="mb-0">
                  احتفظ بتنبيهات المخزون للحصول على أحدث المنتجات بمجرد توفرها.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
