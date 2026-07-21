import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HealthcareLogin } from "../components/auth/HealthcareLogin";

export function LoginPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <HealthcareLogin />;
}
