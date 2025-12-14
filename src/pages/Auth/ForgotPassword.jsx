import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { sendOTP, verifyOTP, setNewPassword } from "../../api/api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await sendOTP(email);
      Swal.fire({
        icon: "success",
        title: "OTP Sent",
        text: "Check your email to receive your OTP code.",
        timer: 1800,
        showConfirmButton: false,
      });
      setStep(2);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.email?.[0] ||
        "Failed to send OTP, please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await verifyOTP(email, otp);
      const token =
        response?.reset_token ||
        response?.data?.reset_token ||
        response?.token ||
        response?.data?.token;
      if (!token) {
        setError("OTP verification failed, please try again.");
        return;
      }
      setResetToken(token);
      Swal.fire({
        icon: "success",
        title: "OTP Verified",
        text: "You can now set a new password.",
        timer: 1600,
        showConfirmButton: false,
      });
      setStep(3);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.code?.[0] ||
        "Invalid OTP code.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (event) => {
    event.preventDefault();
    if (password !== passwordConfirmation) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await setNewPassword(resetToken, password, passwordConfirmation);
      Swal.fire({
        icon: "success",
        title: "Password Updated",
        text: "You can now login with your new password.",
        timer: 1800,
        showConfirmButton: false,
      });
      navigate("/login");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.password?.[0] ||
        "Failed to update password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <form onSubmit={handleSendOtp} className="auth-eyewear__form">
          <div className="auth-eyewear__field">
            <label htmlFor="email" className="auth-eyewear__label">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              className="common-input auth-eyewear__input"
              placeholder="example@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          {error && <div className="auth-eyewear__error">{error}</div>}
          <button
            type="submit"
            className="btn btn-main py-18 w-100"
            disabled={loading}
          >
            {loading ? "جاري الإرسال..." : "إرسال رمز OTP"}
          </button>
        </form>
      );
    }

    if (step === 2) {
      return (
        <form onSubmit={handleVerifyOtp} className="auth-eyewear__form">
          <div className="auth-eyewear__field">
            <label htmlFor="otp" className="auth-eyewear__label">
              رمز OTP
            </label>
            <input
              type="text"
              id="otp"
              className="common-input auth-eyewear__input"
              placeholder="أدخل رمز OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              required
            />
          </div>
          {error && <div className="auth-eyewear__error">{error}</div>}
          <div className="d-flex flex-column gap-12">
            <button
              type="submit"
              className="btn btn-main py-18 w-100"
              disabled={loading}
            >
              {loading ? "جاري التحقق..." : "التحقق من رمز OTP"}
            </button>
            <button
              type="button"
              className="btn btn-light py-14 w-100 fw-semibold text-main-600"
              disabled={loading}
              onClick={(event) => {
                if (loading) return;
                handleSendOtp(event);
              }}
            >
              إعادة إرسال رمز OTP
            </button>
            <button
              type="button"
              className="btn btn-link fw-semibold text-main-600"
              disabled={loading}
              onClick={() => setStep(1)}
            >
              تغيير البريد الإلكتروني
            </button>
          </div>
        </form>
      );
    }

    return (
      <form onSubmit={handleSetPassword} className="auth-eyewear__form">
        <div className="auth-eyewear__field">
          <label htmlFor="password" className="auth-eyewear__label">
            New Password
          </label>
          <input
            type="password"
            id="password"
            className="common-input auth-eyewear__input"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <div className="auth-eyewear__field">
          <label
            htmlFor="password_confirmation"
            className="auth-eyewear__label"
          >
            تأكيد كلمة المرور
          </label>
          <input
            type="password"
            id="password_confirmation"
            className="common-input auth-eyewear__input"
            placeholder="••••••••"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            required
          />
        </div>
        {error && <div className="auth-eyewear__error">{error}</div>}
        <button
          type="submit"
          className="btn btn-main py-18 w-100"
          disabled={loading}
        >
          {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
        </button>
      </form>
    );
  };

  const getCardTitle = () => {
    if (step === 1) return "إرسال رمز OTP";
    if (step === 2) return "التحقق من رمز OTP";
    return "تعيين كلمة مرور جديدة";
  };

  return (
    <section className="auth auth-eyewear py-80 py-md-0 min-vh-100 d-flex align-items-center">
      <div className="container container-lg position-relative w-100">
        <div className="row g-40 align-items-center">
          <div className="col-xl-5 col-lg-6">
            <div className="auth-eyewear__content">
              <span className="auth-eyewear__badge">استعد الوصول</span>
              <h1 className="auth-eyewear__title">
                استعد الوصول إلى حسابك في متجر النخبة
              </h1>
              <p className="auth-eyewear__subtitle">
                اتبع هذه الخطوات الثلاث السريعة لإعادة تعيين كلمة المرور والوصول إلى مشترياتك وطلباتك المحفوظة.
              </p>
              <div className="auth-eyewear__features">
                <div className="auth-eyewear__feature">
                  <span className="auth-eyewear__feature-icon ph ph-envelope" />
                  <div>
                    <h5 className="auth-eyewear__feature-title">
                      رمز OTP آمن عبر البريد الإلكتروني
                    </h5>
                    <p className="auth-eyewear__feature-text">
                      نرسل رمز تحقق فريد إلى بريدك الإلكتروني المسجل للحفاظ على أمان حسابك.
                    </p>
                  </div>
                </div>
                <div className="auth-eyewear__feature">
                  <span className="auth-eyewear__feature-icon ph ph-shield-check" />
                  <div>
                    <h5 className="auth-eyewear__feature-title">
                      التحقق خطوة بخطوة
                    </h5>
                    <p className="auth-eyewear__feature-text">
                      أدخل الرمز خلال دقائق للحصول على رمز إعادة التعيين السري.
                    </p>
                  </div>
                </div>
                <div className="auth-eyewear__feature">
                  <span className="auth-eyewear__feature-icon ph ph-key" />
                  <div>
                    <h5 className="auth-eyewear__feature-title">
                      كلمة مرور جديدة
                    </h5>
                    <p className="auth-eyewear__feature-text">
                      اختر كلمة مرور قوية لاستعادة السيطرة على حسابك ومشترياتك.
                    </p>
                  </div>
                </div>
              </div>
              <div className="auth-eyewear__assurance">
                <span>تذكرت كلمة المرور؟</span>
                <Link to="/login" className="auth-eyewear__assurance-link">
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </div>
          </div>
          <div className="col-xl-7 col-lg-6">
            <div className="auth-eyewear__card">
              <div className="auth-eyewear__card-header text-center">
                <span className="auth-eyewear__card-badge">إعادة تعيين آمنة</span>
                <h2 className="auth-eyewear__card-title">{getCardTitle()}</h2>
                <p className="auth-eyewear__card-text">الخطوة {step} من 3</p>
              </div>
              {renderStepContent()}
              <div className="auth-eyewear__card-footer">
                <span className="ph ph-lock" />
                <p className="mb-0">
                  حافظ على تحديث كلمة المرور للوصول السريع إلى العروض الحصرية.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
