import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { authService } from "@/lib/auth-service";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Loader,
  Mail,
  Send,
  ArrowRight,
} from "lucide-react";

export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  const [verificationStatus, setVerificationStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Wait for router to be ready before processing
    if (router.isReady) {
      setPageLoading(false);
      if (token) {
        verifyEmail(token);
      } else {
        setVerificationStatus("no-token");
      }
    }
  }, [token, router.isReady]);

  const verifyEmail = async (verificationToken) => {
    try {
      const response = await authService.verifyEmail(verificationToken);

      if (response.success) {
        setVerificationStatus("success");
        setMessage(
          response.message ||
            "Email verified successfully! Your account is now fully activated."
        );
        toast.success("Email verified! 🎉", {
          icon: "✅",
          style: {
            borderRadius: "12px",
            background: "#10b981",
            color: "#fff",
          },
        });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setVerificationStatus("error");
        setMessage(
          response.error || "Invalid or expired verification token"
        );
      }
    } catch (error) {
      console.error("Email verification error:", error);
      setVerificationStatus("error");
      setMessage("An error occurred during verification. Please try again.");
    }
  };

  const handleResendVerification = async () => {
    const user = authService.getCurrentUser();
    
    if (!user?.email) {
      toast.error("Please log in to resend verification email", {
        style: {
          borderRadius: "12px",
          background: "#ef4444",
          color: "#fff",
        },
      });
      router.push("/auth/login");
      return;
    }

    setIsResending(true);

    try {
      const response = await authService.sendVerificationEmail(user.email);

      if (response.success) {
        toast.success("Verification email sent! 📧", {
          icon: "✉️",
          style: {
            borderRadius: "12px",
            background: "#10b981",
            color: "#fff",
          },
        });
      } else {
        toast.error(response.error || "Failed to send verification email", {
          style: {
            borderRadius: "12px",
            background: "#ef4444",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("An error occurred. Please try again.", {
        style: {
          borderRadius: "12px",
          background: "#ef4444",
          color: "#fff",
        },
      });
    } finally {
      setIsResending(false);
    }
  };

  // Loading State
  if (verificationStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-full max-w-md text-center">
          <Card className="shadow-2xl border-0">
            <CardBody className="p-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6 animate-pulse">
                <Loader className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Verifying Your Email
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Success State
  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-green-200 opacity-20 rounded-full blur-3xl top-10 right-10 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-blue-200 opacity-20 rounded-full blur-3xl bottom-10 left-10 animate-pulse"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
            <CardBody className="p-12 text-center">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 shadow-lg animate-bounce-in">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>

              {/* Success Message */}
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Email Verified! 🎉
              </h2>
              <p className="text-gray-600 mb-8">{message}</p>

              {/* Celebration */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                <p className="text-gray-700 font-medium mb-2">
                  ✨ Your account is now fully activated!
                </p>
                <p className="text-sm text-gray-600">
                  You'll be redirected to the login page in a moment...
                </p>
              </div>

              {/* Action Button */}
              <Link href="/auth/login">
                <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  Continue to Login
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Error State
  if (verificationStatus === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-red-200 opacity-20 rounded-full blur-3xl top-10 right-10 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-orange-200 opacity-20 rounded-full blur-3xl bottom-10 left-10 animate-pulse"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
            <CardBody className="p-8 text-center">
              {/* Error Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>

              {/* Error Message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>

              {/* Help Box */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What can you do?
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="mr-2">1️⃣</span>
                    <span>Request a new verification email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">2️⃣</span>
                    <span>Check if your email is already verified</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">3️⃣</span>
                    <span>Contact support if the issue persists</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleResendVerification}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  isLoading={isResending}
                >
                  {isResending ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>

                <Link href="/auth/login">
                  <button className="w-full px-6 py-3 text-gray-700 hover:text-gray-900 font-semibold border-2 border-gray-300 hover:border-gray-400 rounded-xl hover:bg-gray-50 transition-all">
                    Back to Login
                  </button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // No Token State
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardBody className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <Mail className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Email Verification
            </h2>
            <p className="text-gray-600 mb-6">
              No verification token found. Please check your email for the verification link.
            </p>
            <Link href="/auth/login">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Back to Login
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}