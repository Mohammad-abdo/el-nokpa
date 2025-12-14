import React, { useState } from "react";

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
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== "") form.append(key, value);
    });

    try {
      const response = await fetch("{{base-url}}/auth/register", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ تم التسجيل بنجاح!");
        console.log("Registered user:", data);
      } else {
        setMessage("❌ حدث خطأ أثناء التسجيل، تحقق من البيانات.");
        console.error("Register error:", data);
      }
    } catch (error) {
      setMessage("⚠️ خطأ في الاتصال بالخادم");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-2xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          🏗️ تسجيل حساب جديد في <span className="text-blue-600">النخبة</span>
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* الاسم */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الكامل
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="اكتب اسمك الكامل"
            />
          </div>

          {/* رقم الجوال */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الجوال
            </label>
            <input
              type="text"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+20123456789"
            />
          </div>

          {/* البريد الإلكتروني */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="example@email.com"
            />
          </div>

          {/* الجنس */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الجنس
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">اختر</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>

          {/* كلمة المرور */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {/* تأكيد كلمة المرور */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تأكيد كلمة المرور
            </label>
            <input
              type="password"
              name="password_confirmation"
              required
              value={formData.password_confirmation}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {/* كود الدعوة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كود الدعوة (اختياري)
            </label>
            <input
              type="text"
              name="invitation_code"
              value={formData.invitation_code}
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="218565"
            />
          </div>

          {/* الصورة الشخصية */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الصورة الشخصية
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-2 bg-gray-50 cursor-pointer"
            />
          </div>

          {/* زر التسجيل */}
          <div className="md:col-span-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition duration-200 shadow-md"
            >
              {loading ? "جاري التسجيل..." : "تسجيل حساب جديد"}
            </button>
          </div>
        </form>

        {/* رسالة الحالة */}
        {message && (
          <p className="text-center mt-4 text-sm text-gray-700">{message}</p>
        )}

        {/* تسجيل الدخول */}
        <p className="text-center text-sm text-gray-600 mt-6">
          لديك حساب بالفعل؟{" "}
          <a
            href="/login"
            className="text-blue-600 font-medium hover:underline"
          >
            تسجيل الدخول
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
