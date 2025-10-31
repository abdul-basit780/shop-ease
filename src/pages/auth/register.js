import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { authService } from "../../lib/auth-service";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Calendar,
  ShoppingBag,
  Sparkles,
  CheckCircle,
  Gift,
  Send,
  ArrowRight,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    phone: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    occupation: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } 
    // else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    //   newErrors.password =
    //     "Password must contain uppercase, lowercase, and number";
    // }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        dob: formData.dob,
        phone: formData.phone,
        gender: formData.gender,
        address: formData.address,
        occupation: formData.occupation,
      });

      if (response.success) {
        // Show success and email verification info
        setRegisteredEmail(formData.email);
        setRegistrationSuccess(true);
        
        toast.success("Account created successfully! 🎉", {
          icon: "✨",
          duration: 4000,
          style: {
            borderRadius: "12px",
            background: "#10b981",
            color: "#fff",
          },
        });
      } else {
        toast.error(response.error || "Registration failed", {
          style: {
            borderRadius: "12px",
            background: "#ef4444",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
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

  const handleContinue = () => {
    router.push("/");
  };

  const handleResendVerification = async () => {
    try {
      const response = await authService.sendVerificationEmail(registeredEmail);
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
        toast.error("Failed to resend email", {
          style: {
            borderRadius: "12px",
            background: "#ef4444",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      toast.error("An error occurred", {
        style: {
          borderRadius: "12px",
          background: "#ef4444",
          color: "#fff",
        },
      });
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

  // ✅ SUCCESS SCREEN - Show after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome to ShopEase! 🎉
              </h2>
              <p className="text-gray-600 mb-2">
                Your account has been created successfully!
              </p>

              {/* Email Verification Notice */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6 text-left">
                <div className="flex items-start mb-4">
                  <Mail className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      📧 Verify Your Email
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      We've sent a verification link to:
                    </p>
                    <p className="text-sm font-semibold text-blue-600 mb-3 break-all">
                      {registeredEmail}
                    </p>
                    <p className="text-sm text-gray-600">
                      Please check your inbox and click the verification link to activate your account.
                    </p>
                  </div>
                </div>

                {/* What's Next */}
                <div className="border-t border-blue-200 pt-4 mt-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">What's next?</p>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2">1️⃣</span>
                      <span>Check your email (including spam folder)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2️⃣</span>
                      <span>Click the verification link</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3️⃣</span>
                      <span>Start shopping with full access!</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  Continue to ShopEase
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>

                <button
                  onClick={handleResendVerification}
                  className="w-full px-6 py-3 text-gray-700 hover:text-gray-900 font-semibold border-2 border-gray-300 hover:border-gray-400 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <Send className="h-5 w-5 mr-2 inline" />
                  Resend Verification Email
                </button>
              </div>

              {/* Note */}
              <p className="mt-6 text-xs text-gray-500">
                You can verify your email later from your account settings
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // REGISTRATION FORM (original code continues...)
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary-50 via-white to-primary-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-secondary-200 opacity-20 rounded-full blur-3xl -top-48 -right-48 animate-float"></div>
        <div className="absolute w-96 h-96 bg-primary-200 opacity-20 rounded-full blur-3xl top-1/3 left-10 animate-float animation-delay-500"></div>
        <div className="absolute w-96 h-96 bg-purple-200 opacity-20 rounded-full blur-3xl -bottom-48 -left-48 animate-float animation-delay-1000"></div>
      </div>

      {/* Floating Shapes */}
      <div className="absolute top-32 right-[10%] animate-float animation-delay-300">
        <div className="w-12 h-12 bg-secondary-200/40 rounded-full backdrop-blur-sm"></div>
      </div>
      <div className="absolute bottom-40 left-[15%] animate-float animation-delay-700">
        <div className="w-16 h-16 bg-primary-200/40 rounded-2xl rotate-45 backdrop-blur-sm"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Benefits */}
          <div className="hidden lg:block animate-fade-in-left">
            <div className="text-center lg:text-left">
              {/* Logo */}
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
                <div className="relative w-16 h-16 bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-600 rounded-2xl flex items-center justify-center transform hover:rotate-12 transition-all duration-500 shadow-2xl">
                  <span className="text-white font-extrabold text-3xl">SE</span>
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900">
                    ShopEase
                  </h1>
                  <p className="text-sm text-gray-600">
                    Smart Shopping Experience
                  </p>
                </div>
              </div>

              {/* Hero Text */}
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                Join Thousands of
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 mt-2">
                  Happy Shoppers! 🎉
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Create your account and unlock exclusive benefits
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  {
                    icon: Gift,
                    title: "Free Delivery",
                    desc: "No extra charge for delivery",
                  },
                  {
                    icon: Sparkles,
                    title: "Personalized Recommendations",
                    desc: "Personalized for you",
                  },
                  {
                    icon: ShoppingBag,
                    title: "Exclusive Deals",
                    desc: "Member-only offers",
                  },
                  {
                    icon: CheckCircle,
                    title: "Priority Support",
                    desc: "24/7 assistance",
                  },
                ].map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-scale-in"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mb-3 shadow-md">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600">{benefit.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Social Proof */}
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold">10,000+</div>
                    <div className="text-primary-100">Active Members</div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center"
                      >
                        <User className="h-5 w-5" />
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-primary-100">
                  Join our community of satisfied shoppers today!
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="w-full animate-scale-in">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-block w-20 h-20 bg-gradient-to-br from-primary-600 via-purple-600 to-secondary-600 rounded-2xl flex items-center justify-center mb-4 shadow-2xl animate-bounce-in">
                <span className="text-white font-extrabold text-4xl">E</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                Create{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                  Account
                </span>
              </h1>
              <p className="text-gray-600">Join ShopEase today</p>
            </div>

            <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
              <CardBody className="p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Input */}
                  <div className="animate-fade-in-up animation-delay-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all ${
                          errors.name
                            ? "border-red-500"
                            : "border-gray-200 focus:border-primary-500"
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                        <span className="mr-1">⚠️</span> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div className="animate-fade-in-up animation-delay-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all ${
                          errors.email
                            ? "border-red-500"
                            : "border-gray-200 focus:border-primary-500"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                        <span className="mr-1">⚠️</span> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="animate-fade-in-up animation-delay-300">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 8 characters"
                        className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all ${
                          errors.password
                            ? "border-red-500"
                            : "border-gray-200 focus:border-primary-500"
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
                      <div className="mt-2 animate-fade-in">
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
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                        <span className="mr-1">⚠️</span> {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div className="animate-fade-in-up animation-delay-400">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all ${
                          errors.confirmPassword
                            ? "border-red-500"
                            : "border-gray-200 focus:border-primary-500"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
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
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                        <span className="mr-1">⚠️</span>{" "}
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Optional Fields - Row 1: DOB & Gender */}
                  <div className="grid grid-cols-2 gap-4 animate-fade-in-up animation-delay-500">
                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Gender
                      </label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors pointer-events-none" />
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all appearance-none bg-white"
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">
                            Prefer not to say
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Phone & Occupation */}
                  <div className="grid grid-cols-2 gap-4 animate-fade-in-up animation-delay-550">
                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1234567890"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all"
                      />
                    </div>

                    {/* Occupation */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Occupation
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        placeholder="Software Engineer"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="animate-fade-in-up animation-delay-600">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Address
                    </label>

                    {/* Street */}
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      placeholder="Street Address"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all mb-3"
                    />

                    {/* City, State, Zip */}
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        placeholder="City"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all"
                      />
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        placeholder="State"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all"
                      />
                      <input
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        placeholder="Zip Code"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="animate-fade-in-up animation-delay-600">
                    <label className="flex items-start cursor-pointer group">
                      <input
                        type="checkbox"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className={`mt-1 w-5 h-5 text-primary-600 border-2 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer ${
                          errors.agreeToTerms
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
                        >
                          Terms and Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-primary-600 hover:text-primary-700 font-semibold hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                    {errors.agreeToTerms && (
                      <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
                        <span className="mr-1">⚠️</span> {errors.agreeToTerms}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="animate-fade-in-up animation-delay-700">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                      isLoading={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </span>
                      ) : (
                        <>
                          <Gift className="h-5 w-5 mr-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="relative my-6 animate-fade-in-up animation-delay-800">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">
                        Already have an account?
                      </span>
                    </div>
                  </div>

                  {/* Sign In Link */}
                  <div className="text-center animate-fade-in-up animation-delay-900">
                    <Link href="/auth/login">
                      <button
                        type="button"
                        className="w-full px-6 py-3 text-gray-700 hover:text-gray-900 font-semibold border-2 border-gray-300 hover:border-gray-400 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        Sign In Instead
                      </button>
                    </Link>
                  </div>
                </form>
              </CardBody>
            </Card>

            {/* Trust Badges */}
            <div className="mt-6 flex items-center justify-center space-x-6 animate-fade-in-up animation-delay-1000">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-semibold">Secure Sign Up</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">100% Free</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}