import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { authService } from "@/lib/auth-service";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, CheckCircle, Send } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPasswordRequest(email);

      if (response.success) {
        setIsSubmitted(true);
        toast.success("Password reset email sent! 📧", {
          icon: "✉️",
          style: {
            borderRadius: "12px",
            background: "#10b981",
            color: "#fff",
          },
        });
      } else {
        // Even on error, show success message for security (don't reveal if email exists)
        setIsSubmitted(true);
        toast.success("If an account exists, you'll receive an email", {
          icon: "✉️",
          style: {
            borderRadius: "12px",
            background: "#10b981",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-green-200 opacity-20 rounded-full blur-3xl top-10 right-10 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-blue-200 opacity-20 rounded-full blur-3xl bottom-10 left-10 animate-pulse"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
            <CardBody className="p-8 text-center">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 shadow-lg animate-bounce-in">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>

              {/* Success Message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Check Your Email! 📧
              </h2>
              <p className="text-gray-600 mb-2">
                We've sent password reset instructions to:
              </p>
              <p className="text-blue-600 font-semibold mb-6">{email}</p>

              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What's next?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">1️⃣</span>
                    <span>Check your email inbox (and spam folder)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">2️⃣</span>
                    <span>Click the password reset link</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">3️⃣</span>
                    <span>Create a new password</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link href="/auth/login">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Login
                  </Button>
                </Link>

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="w-full px-6 py-3 text-gray-700 hover:text-gray-900 font-semibold border-2 border-gray-300 hover:border-gray-400 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <Send className="h-5 w-5 mr-2 inline" />
                  Resend Email
                </button>
              </div>

              {/* Help Text */}
              <p className="mt-6 text-sm text-gray-600">
                Didn't receive the email? Check your spam folder or try again.
              </p>
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
            Forgot Password?
          </h1>
          <p className="text-gray-600">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="you@example.com"
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all ${
                      error
                        ? "border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                    }`}
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span> {error}
                  </p>
                )}
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
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Login
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}