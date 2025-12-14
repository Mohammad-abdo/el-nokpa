import { Navigate } from "react-router-dom";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const ProtectedRoute = ({ children }) => {
  const token = cookies.get("token"); // 👈 هنا بنجيب التوكن من الكوكيز
  if (!token) {
    // لو مفيش توكن يرجعه لصفحة اللوجين
    return <Navigate to="/login" replace />;
  }
  return children;

  return children;
};

export default ProtectedRoute;
