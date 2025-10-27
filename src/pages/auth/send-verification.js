import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { authService } from "@/lib/auth-service";
import toast from "react-hot-toast";
import { Mail, AlertCircle, Send, CheckCircle, X } from "lucide-react";

export default function SendEmailVerification() {
  const [user, setUser] = useState(null);
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem("emailVerificationBannerDismissed");
    if (dismissed) {
      setIsDismissed(true);
    }

    // Check cooldown
    const lastSent = localStorage.getItem("lastVerificationEmailSent");
    if (lastSent) {
      const timeSinceLastSent = Date.now() - parseInt(lastSent);
      const cooldownTime = 60000; // 1 minute cooldown
      if (timeSinceLastSent < cooldownTime) {
        setCooldown(Math.ceil((cooldownTime - timeSinceLastSent) / 1000));
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendVerification = async () => {
    if (!user?.email) {
      toast.error("User email not found", {
        style: {
          borderRadius: "12px",
          background: "#ef4444",
          color: "#fff",
        },
      });
      return;
    }

    setIsResending(true);

    try {
      const response = await authService.sendVerificationEmail(user.email);

      if (response.success) {
        toast.success("Verification email sent! 📧", {
          icon: "✉️",
          duration: 5000,
          style: {
            borderRadius: "12px",
            background: "#10b981",
            color: "#fff",
          },
        });

        // Set cooldown
        localStorage.setItem("lastVerificationEmailSent", Date.now().toString());
        setCooldown(60);
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

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("emailVerificationBannerDismissed", "true");
  };

  // Don't show banner if:
  // - User is not logged in
  // - Email is already verified
  // - Banner was dismissed
  if (!user || user.isEmailVerified || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 p-4 shadow-md">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>

            {/* Content */}
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Verify Your Email Address
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Please verify your email address to access all features and secure your account.
                We sent a verification link to <span className="font-semibold">{user.email}</span>
              </p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleResendVerification}
                  disabled={cooldown > 0 || isResending}
                  className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  size="sm"
                >
                  {isResending ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </span>
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      Resend Email
                    </>
                  )}
                </Button>

                <button
                  onClick={handleDismiss}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}