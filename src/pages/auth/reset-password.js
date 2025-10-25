import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { authService } from "@/lib/auth-service";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!token) {
      toast.error("Invalid reset token", {
        style: {
          borderRadius: "12px",
          background: "#ef4444",
          color: "#fff",
        },
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPassword(token, formData.password);

      if (response.success) {
        toast.success("Password reset successful! 🎉", {
          icon: "✅",
          style: {
            borderRadius: "12px",
            background: "#10b981",
            color: "#fff",
          },
        });

        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } else {
        toast.error(response.error || "Password reset failed", {
          style: {
            borderRadius: "12px",
            background: "#ef4444",
            color: "#fff",
          },
        });
        
        if (response.error?.toLowerCase().includes("token") || 
            response.error?.toLowerCase().includes("expired")) {
          setTokenValid(false);
        }
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("An error occurred. Please try again.", {
        style: {
          borderRadius: "12px",
          background: "#ef4444",
          color: "#fff",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
      { strength: 1, label: "Very Weak", color: "bg-red-500" },
      { strength: 2, label: "Weak", color: "bg-orange-500" },
      { strength: 3, label: "Fair", color: "bg-yellow-500" },
      { strength: 4, label: "Good", color: "bg-blue-500" },
      { strength: 5, label: "Strong", color: "bg-green-500" },
    ];

    return levels[strength - 1] || { strength: 0, label: "", color: "" };
  };

  const strength = passwordStrength();

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardBody className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Invalid or Expired Link
              </h2>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href="/auth/forgot-password">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Request New Link
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-200 opacity-20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-200 opacity-20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 rounded-2xl flex items-center justify-center mb-4 shadow-2xl">
            <span className="text-white font-extrabold text-2xl">SE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Reset Your Password
          </h1>
          <p className="text-gray-600">
            Enter your new password below
          </p>
        </div>

        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                      errors.password
                        ? "border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">
                        Password Strength:
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          strength.strength >= 4
                            ? "text-green-600"
                            : strength.strength >= 3
                            ? "text-blue-600"
                            : strength.strength >= 2
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-500`}
                        style={{
                          width: `${(strength.strength / 5) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span> {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Password must contain:
                </h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className={`h-4 w-4 mr-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`} />
                    At least 8 characters
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className={`h-4 w-4 mr-2 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                    One uppercase letter
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className={`h-4 w-4 mr-2 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                    One lowercase letter
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className={`h-4 w-4 mr-2 ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`} />
                    One number
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl transition-all"
                  size="lg"
                  isLoading={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Resetting Password...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}