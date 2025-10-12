// lib/controllers/auth.ts
import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "../db/mongodb";
import { IUser } from "../models/User";
import {
  comparePassword,
  generateToken,
  validateLoginCredentials,
  prepareUserResponse,
  handleAccountLocking,
  handleFailedLogin,
  handleSuccessfullLogin,
  validateRegistrationData,
  ICustomerRegistrationData,
  checkExistingUser,
  hashPassword,
  sendWelcomeEmail,
  generateAuthToken,
  generateEmailVerificationUrl,
  TOKEN_EXPIRY,
  generatePasswordResetUrl,
  verifyAuthToken,
} from "../utils/auth";
import { UserRole } from "../models/enums";
import { User } from "../models/User";
import { IAdmin } from "../models/Admin";
import { Customer, ICustomer } from "../models/Customer";
import { emailService } from "@/lib/services/EmailService";
import { Address } from "../models/Address";
import { AuthenticatedRequest } from "../middleware/auth";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user: ReturnType<typeof prepareUserResponse> | null;
  token: string;
  expiresIn: string;
  statusCode: number | undefined;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface VerifyEmailRequest {
  token: string;
}

export const login = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  const loginResponse: AuthResponse = {
    success: false,
    message: "",
    user: null,
    token: "",
    expiresIn: "",
    statusCode: 401,
  };

  const { email, password }: LoginRequest = req.body;

  // Validate credentials
  const validationErrors = validateLoginCredentials(email, password);
  if (validationErrors.length > 0) {
    loginResponse.message = validationErrors.join(", ");
    return loginResponse;
  }

  // Find user by email
  const user: ICustomer | IAdmin | IUser | null = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");

  if (!user) {
    loginResponse.message = "Invalid email or password";
    return loginResponse;
  }

  const isCustomer = user.role === UserRole.CUSTOMER;
  const isAdmin = user.role === UserRole.ADMIN;

  // Check if user is active
  if (isCustomer && !(user as ICustomer)?.isActive) {
    loginResponse.message = "Customer account is not active";
    return loginResponse;
  }

  // Check if account is locked (for admin users)
  try {
    await handleAccountLocking(user);
  } catch (error: unknown) {
    console.log(error);
    loginResponse.message = "Account is locked";
    loginResponse.statusCode = 423;
    return loginResponse;
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    await handleFailedLogin(user);
    loginResponse.message = "Invalid email or password";
    return loginResponse;
  }

  // Handle successful login
  await handleSuccessfullLogin(user);

  // Generate JWT token
  const token = generateToken(user as IUser);

  loginResponse.success = true;
  loginResponse.message = "Login successful";
  loginResponse.user = prepareUserResponse(user as ICustomer | IAdmin);
  loginResponse.token = token;
  loginResponse.expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  loginResponse.statusCode = 200;

  return loginResponse;
};

export const register = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  const registerResponse: AuthResponse = {
    success: false,
    message: "",
    user: null,
    token: "",
    expiresIn: "",
    statusCode: 500,
  };

  const requestData: ICustomerRegistrationData = req.body;

  // Validate all registration data
  const validationErrors = validateRegistrationData(requestData);
  if (validationErrors.length > 0) {
    registerResponse.message = validationErrors.join(", ");
    return registerResponse;
  }

  try {
    // Check if user already exists
    await checkExistingUser(requestData.email);

    // Hash password
    const hashedPassword = await hashPassword(requestData.password);

    const address = requestData.address;

    // Create customer data object for Mongoose
    const customerData: Omit<ICustomerRegistrationData, "address"> = {
      name: requestData.name,
      email: requestData.email,
      password: hashedPassword,
      phone: requestData.phone,
      dob: requestData.dob,
      gender: requestData.gender,
      occupation: requestData.occupation,
    };

    // Create the customer
    const customer = await Customer.create(customerData);

    await Address.create({
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      customerId: customer._id,
    });

    // Send welcome email (non-blocking)
    await sendWelcomeEmail(customer);

    // Generate verification token
    const verificationToken = generateAuthToken(
      {
        userId: customer._id.toString(),
        email: customer.email,
        type: "email-verification",
      },
      TOKEN_EXPIRY.EMAIL_VERIFICATION
    );

    // Generate verification URL
    const verificationUrl = generateEmailVerificationUrl(verificationToken);

    // Send verification email
    const emailSent = await emailService.sendEmailVerification(customer.email, {
      name: customer.name,
      verificationUrl,
      expiresIn: "24 hours",
    });

    if (!emailSent) {
      console.error("Failed to send verification email to:", customer.email);
    }

    // Generate JWT token
    const token = generateToken(customer);

    // Prepare response data
    const responseUser = prepareUserResponse(customer);

    registerResponse.success = true;
    registerResponse.message = "Registration successful";
    registerResponse.user = responseUser;
    registerResponse.token = token;
    registerResponse.expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    registerResponse.statusCode = 201;

    return registerResponse;
  } catch (err: any) {
    console.error("Registration error:", err);

    // Handle specific errors
    if (err.message === "Email already registered") {
      registerResponse.message = err.message;
      registerResponse.statusCode = 409;
      return registerResponse;
    }

    registerResponse.message = "Internal server error";
    registerResponse.statusCode = 500;
    return registerResponse;
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const changePasswordResponse: Omit<
    AuthResponse,
    "user" | "token" | "expiresIn"
  > = {
    success: false,
    message: "",
    statusCode: 500,
  };

  const { currentPassword, newPassword }: ChangePasswordRequest = req.body;
  const errors: string[] = [];

  // Validate inputs
  if (
    !currentPassword ||
    typeof currentPassword !== "string" ||
    currentPassword.trim().length === 0
  ) {
    errors.push("Current password is required");
  }

  if (!newPassword || typeof newPassword !== "string") {
    errors.push("New password is required");
  } else if (newPassword.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (errors.length > 0) {
    changePasswordResponse.message = errors.join(", ");
    changePasswordResponse.statusCode = 400;
    return changePasswordResponse;
  }

  try {
    // Find the user
    const user = await User.findById(req.user.userId);

    if (!user) {
      changePasswordResponse.message = "User not found";
      changePasswordResponse.statusCode = 404;
      return changePasswordResponse;
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      changePasswordResponse.message = "Invalid current password";
      changePasswordResponse.statusCode = 401;
      return changePasswordResponse;
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    changePasswordResponse.success = true;
    changePasswordResponse.message = "Password has been changed successfully.";
    changePasswordResponse.statusCode = 200;
    return changePasswordResponse;
  } catch (err: any) {
    console.error("Change password error:", err);
    changePasswordResponse.message = "Internal server error";
    changePasswordResponse.statusCode = 500;
    return changePasswordResponse;
  }
};

export const forgotPassword = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const forgotPasswordResponse: Omit<
    AuthResponse,
    "user" | "token" | "expiresIn"
  > = {
    success: false,
    message: "",
    statusCode: 500,
  };

  await connectToDatabase();

  const { email }: ForgotPasswordRequest = req.body;
  const errors: string[] = [];

  // Validate email
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push("Please provide a valid email");
    }
  }

  if (errors.length > 0) {
    forgotPasswordResponse.message = errors.join(", ");
    forgotPasswordResponse.statusCode = 400;
    return forgotPasswordResponse;
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Find user in any of the user collections
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      forgotPasswordResponse.message = "User not found";
      forgotPasswordResponse.statusCode = 404;
      return forgotPasswordResponse;
    }

    const isCustomer = user.role === UserRole.CUSTOMER;

    if (isCustomer) {
      const customer = await Customer.findById(user._id);
      if (!customer) {
        forgotPasswordResponse.message = "Customer not found";
        forgotPasswordResponse.statusCode = 404;
        return forgotPasswordResponse;
      }
      // Check if user is active
      if (!customer.isActive) {
        forgotPasswordResponse.message = "Customer account is not active";
        return forgotPasswordResponse;
      }
    }

    // SECURITY: Prevent admin password resets for security reasons
    if (user.role === UserRole.ADMIN) {
      // Log the attempt for security monitoring
      console.warn(
        `Admin password reset attempt for email: ${user.email} from IP: ${
          req.headers["x-forwarded-for"] || req.connection.remoteAddress
        }`
      );

      // Return generic success message (don't reveal it's an admin account)
      return forgotPasswordResponse;
    }

    // Generate reset token
    const resetToken = generateAuthToken(
      {
        userId: user._id.toString(),
        email: user.email,
        type: "password-reset",
      },
      TOKEN_EXPIRY.PASSWORD_RESET
    );

    // Generate reset URL
    const resetUrl = generatePasswordResetUrl(resetToken);

    // Send password reset email
    const emailSent = await emailService.sendPasswordReset(user.email, {
      name: user.name,
      resetUrl,
      expiresIn: "1 hour",
    });

    if (!emailSent) {
      console.error("Failed to send password reset email to:", user.email);
      // Still return success to user for security
    }

    forgotPasswordResponse.success = true;
    forgotPasswordResponse.message =
      "If an account with that email exists, you will receive a password reset email.";
    forgotPasswordResponse.statusCode = 200;
    return forgotPasswordResponse;
  } catch (err) {
    console.error("Forgot password error:", err);
    forgotPasswordResponse.message = "Internal server error";
    forgotPasswordResponse.statusCode = 500;
    return forgotPasswordResponse;
  }
};

export const resetPassword = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const resetPasswordResponse: Omit<
    AuthResponse,
    "user" | "token" | "expiresIn"
  > = {
    success: false,
    message: "",
    statusCode: 500,
  };

  const { token, newPassword }: ResetPasswordRequest = req.body;
  const errors: string[] = [];

  // Validate inputs
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    errors.push("Reset token is required");
  }

  if (!newPassword || typeof newPassword !== "string") {
    errors.push("New password is required");
  } else if (newPassword.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (errors.length > 0) {
    resetPasswordResponse.message = errors.join(", ");
    resetPasswordResponse.statusCode = 400;
    return resetPasswordResponse;
  }

  try {
    // Verify the reset token
    const decoded = verifyAuthToken(token.trim());

    if (!decoded || decoded.type !== "password-reset") {
      resetPasswordResponse.message = "Invalid or expired reset token";
      resetPasswordResponse.statusCode = 400;
      return resetPasswordResponse;
    }

    // Find the user
    const user: ICustomer | null = await User.findById(decoded.userId);

    if (!user) {
      resetPasswordResponse.message = "Invalid or expired reset token";
      resetPasswordResponse.statusCode = 400;
      return resetPasswordResponse;
    }

    const isAdmin = user.role === UserRole.ADMIN;
    // SECURITY: Prevent admin password resets for security reasons
    if (isAdmin) {
      resetPasswordResponse.message = "Cannot reset password for admin account";
      resetPasswordResponse.statusCode = 400;
      return resetPasswordResponse;
    }

    // Check if account is still active
    if (!user.isActive) {
      resetPasswordResponse.message = "Account is not active";
      resetPasswordResponse.statusCode = 403;
      return resetPasswordResponse;
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    resetPasswordResponse.success = true;
    resetPasswordResponse.message =
      "Password has been reset successfully. You can now login with your new password.";
    resetPasswordResponse.statusCode = 200;
    return resetPasswordResponse;
  } catch (err: any) {
    console.error("Reset password error:", err);

    // Handle JWT specific errors
    if (err.name === "JsonWebTokenError") {
      resetPasswordResponse.message = "Invalid reset token";
      resetPasswordResponse.statusCode = 400;
      return resetPasswordResponse;
    }
    if (err.name === "TokenExpiredError") {
      resetPasswordResponse.message = "Reset token has expired";
      resetPasswordResponse.statusCode = 400;
      return resetPasswordResponse;
    }

    resetPasswordResponse.message = "Internal server error";
    resetPasswordResponse.statusCode = 500;
    return resetPasswordResponse;
  }
};

export const sendVerification = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const sendVerificationResponse: Omit<
    AuthResponse,
    "user" | "token" | "expiresIn"
  > = {
    success: false,
    message: "",
    statusCode: 500,
  };

  try {
    // Get current customer
    const customer = await Customer.findById(req.user.userId);

    if (!customer) {
      sendVerificationResponse.message = "Customer not found";
      sendVerificationResponse.statusCode = 404;
      return sendVerificationResponse;
    }

    // Check if already verified
    if (customer.isVerified) {
      sendVerificationResponse.message = "Email is already verified";
      sendVerificationResponse.statusCode = 400;
      return sendVerificationResponse;
    }

    // Generate verification token
    const verificationToken = generateAuthToken(
      {
        userId: customer._id.toString(),
        email: customer.email,
        type: "email-verification",
      },
      TOKEN_EXPIRY.EMAIL_VERIFICATION
    );

    // Generate verification URL
    const verificationUrl = generateEmailVerificationUrl(verificationToken);

    // Send verification email
    const emailSent = await emailService.sendEmailVerification(customer.email, {
      name: customer.name,
      verificationUrl,
      expiresIn: "24 hours",
    });

    if (!emailSent) {
      console.error("Failed to send verification email to:", customer.email);
      sendVerificationResponse.message = "Failed to send verification email";
      sendVerificationResponse.statusCode = 500;
      return sendVerificationResponse;
    }

    sendVerificationResponse.success = true;
    sendVerificationResponse.message =
      "Verification email sent successfully. Please check your inbox.";
    sendVerificationResponse.statusCode = 200;
    return sendVerificationResponse;
  } catch (err) {
    console.error("Send verification error:", err);
    sendVerificationResponse.message = "Internal server error";
    sendVerificationResponse.statusCode = 500;
    return sendVerificationResponse;
  }
};

export const verifyEmail = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const verifyEmailResponse: Omit<
    AuthResponse,
    "user" | "token" | "expiresIn"
  > = {
    success: false,
    message: "",
    statusCode: 500,
  };

  const { token }: VerifyEmailRequest = req.body;
  const errors: string[] = [];

  // Validate token
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    errors.push("Verification token is required");
  }

  if (errors.length > 0) {
    verifyEmailResponse.message = errors.join(", ");
    verifyEmailResponse.statusCode = 400;
    return verifyEmailResponse;
  }

  try {
    // Verify the token
    const decoded = verifyAuthToken(token.trim());

    if (!decoded || decoded.type !== "email-verification") {
      verifyEmailResponse.message = "Invalid or expired verification token";
      verifyEmailResponse.statusCode = 400;
      return verifyEmailResponse;
    }

    // Find the customer
    const customer = await Customer.findById(decoded.userId);

    if (!customer) {
      verifyEmailResponse.message = "Invalid or expired verification token";
      verifyEmailResponse.statusCode = 400;
      return verifyEmailResponse;
    }

    // Check if account is active
    if (!customer.isActive) {
      verifyEmailResponse.message = "Account is not active";
      verifyEmailResponse.statusCode = 403;
      return verifyEmailResponse;
    }

    // Check if already verified
    if (customer.isVerified) {
      verifyEmailResponse.message = "Email is already verified";
      verifyEmailResponse.statusCode = 200;
      return verifyEmailResponse;
    }

    // Verify the email token matches
    if (customer.email !== decoded.email) {
      verifyEmailResponse.message = "Invalid verification token";
      verifyEmailResponse.statusCode = 400;
      return verifyEmailResponse;
    }

    // Update customer verification status
    await Customer.findByIdAndUpdate(customer._id, {
      isVerified: true,
      emailVerifiedAt: new Date(),
    });

    verifyEmailResponse.success = true;
    verifyEmailResponse.message =
      "Email verified successfully! Your account is now fully activated.";
    verifyEmailResponse.statusCode = 200;
    return verifyEmailResponse;
  } catch (err: any) {
    console.error("Verify email error:", err);

    // Handle JWT specific errors
    if (err.name === "JsonWebTokenError") {
      verifyEmailResponse.message = "Invalid verification token";
      verifyEmailResponse.statusCode = 400;
      return verifyEmailResponse;
    }
    if (err.name === "TokenExpiredError") {
      verifyEmailResponse.message = "Verification token has expired";
      verifyEmailResponse.statusCode = 400;
      return verifyEmailResponse;
    }

    verifyEmailResponse.message = "Internal server error";
    verifyEmailResponse.statusCode = 500;
    return verifyEmailResponse;
  }
};

export const me = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  await connectToDatabase();

  const meResponse: Omit<AuthResponse, "token" | "expiresIn"> = {
    user: null,
    success: false,
    message: "",
    statusCode: 500,
  };

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      meResponse.message = "No token provided";
      meResponse.statusCode = 401;
      return meResponse;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      meResponse.message = "No token provided";
      meResponse.statusCode = 401;
      return meResponse;
    }

    // Verify JWT token
    try {
      jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
      meResponse.message = "Invalid or expired token";
      meResponse.statusCode = 401;
      return meResponse;
    }

    // Find user by ID from token
    const user: ICustomer | IAdmin | IUser | null = await User.findById(
      req.user.userId
    );

    if (!user) {
      meResponse.message = "User not found";
      meResponse.statusCode = 404;
      return meResponse;
    }

    const isCustomer = user.role === UserRole.CUSTOMER;
    const isAdmin = user.role === UserRole.ADMIN;

    // Check if user is active
    if (isCustomer && !(user as ICustomer).isActive) {
      meResponse.message = "User account is inactive";
      meResponse.statusCode = 401;
      return meResponse;
    }

    // Check if admin account is locked
    if (isAdmin) {
      const loginAttempts = (user as IAdmin).loginAttempts;
      if (loginAttempts && loginAttempts >= 5) {
        meResponse.message =
          "Account is temporarily locked due to too many failed login attempts";
        meResponse.statusCode = 423;
        return meResponse;
      }
    }

    meResponse.user = prepareUserResponse(user as ICustomer | IAdmin);
    meResponse.success = true;
    meResponse.message = "User data retrieved successfully";
    meResponse.statusCode = 200;
    return meResponse;
  } catch (error) {
    console.error("Me endpoint error:", error);
    meResponse.message = "Internal server error";
    meResponse.statusCode = 500;
    return meResponse;
  }
};
