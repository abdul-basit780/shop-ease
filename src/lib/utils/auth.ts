// lib/utils/auth.ts
import bcrypt from "bcryptjs";
import { sign, verify, SignOptions, VerifyOptions } from "jsonwebtoken";
import { UserRole, Gender } from "../models/enums";
import { Customer, ICustomer } from "../models/Customer";
import { Admin, IAdmin } from "../models/Admin";
import { emailService } from "../services/EmailService";

export interface ValidationErrors {
  errors: string[];
}

export interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface IUser {
  _id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface ICustomerRegistrationData {
  name: string;
  email: string;
  password: string;
  dob: string;
  phone: string;
  address: AddressData;
  gender: Gender;
  occupation?: string;
}

// --- helper to turn "7d", "1h", "30m", "45s" into seconds  ---
function parseDurationToSeconds(raw: string): number {
  const match = /^(\d+)([smhd])$/i.exec(raw);
  if (!match) {
    // default to 7 days if unparseable
    return 7 * 24 * 60 * 60;
  }
  const value = parseInt(match[1], 10);
  switch (match[2].toLowerCase()) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 24 * 60 * 60;
    default:
      return 7 * 24 * 60 * 60;
  }
}

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || "secret";
let rawExpires = process.env.JWT_EXPIRES_IN ?? "7d";

// Validate format ("1h", "7d", etc.)
if (!/^\d+[smhd]$/i.test(rawExpires)) {
  console.warn('JWT_EXPIRES_IN is not in a valid format. Using default "7d"');
  rawExpires = "7d";
}
const JWT_EXPIRES_IN_SECONDS = parseDurationToSeconds(rawExpires);

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// JWT Token generation
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  type?: string;
}

export const generateToken = (user: IUser): string => {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN_SECONDS, // now a number
    issuer: "shop-ease",
    audience: "shop-ease-users",
    algorithm: "HS256",
  };

  return sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const opts: VerifyOptions = {
      issuer: "shop-ease",
      audience: "shop-ease-users",
    };
    return verify(token, JWT_SECRET, opts) as JWTPayload;
  } catch {
    throw new Error("Invalid or expired token");
  }
};

export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  const [bearer, token] = authHeader.split(" ");
  return bearer === "Bearer" && token ? token : null;
};

// Refresh tokens
const RAW_REFRESH_EXPIRES = "30d";
const REFRESH_EXPIRES_IN_SECONDS = parseDurationToSeconds(RAW_REFRESH_EXPIRES);

export const generateRefreshToken = (user: IUser): string => {
  const options: SignOptions = {
    expiresIn: REFRESH_EXPIRES_IN_SECONDS,
    issuer: "shop-ease",
    audience: "shop-ease-refresh",
    algorithm: "HS256",
  };
  return sign(
    { userId: user._id.toString(), type: "refresh" },
    JWT_SECRET,
    options
  );
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const opts: VerifyOptions = {
      issuer: "shop-ease",
      audience: "shop-ease-refresh",
    };
    const decoded = verify(token, JWT_SECRET, opts) as { userId: string };
    return { userId: decoded.userId };
  } catch {
    throw new Error("Invalid refresh token");
  }
};

// Ad-hoc auth tokens
export const generateAuthToken = (
  payload: { userId: string; email: string; type: string },
  rawExpire: string = "1h"
): string => {
  const expiresIn = parseDurationToSeconds(rawExpire);
  const options: SignOptions = {
    expiresIn,
    issuer: "shop-ease",
    audience: "shop-ease-auth",
    algorithm: "HS256",
  };
  return sign(payload, JWT_SECRET, options);
};

export const verifyAuthToken = (token: string): JWTPayload | null => {
  try {
    const options: VerifyOptions = {
      issuer: "shop-ease",
      audience: "shop-ease-auth",
      algorithms: ["HS256"],
    };
    return verify(token, JWT_SECRET, options) as JWTPayload;
  } catch {
    return null;
  }
};

// URL generators
export const generatePasswordResetUrl = (token: string): string => {
  const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  return `${base}/auth/reset-password?token=${token}`;
};

export const generateEmailVerificationUrl = (token: string): string => {
  const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  return `${base}/auth/verify-email?token=${token}`;
};

// Static token expiry definitions (strings still OK here)
export const TOKEN_EXPIRY = {
  PASSWORD_RESET: "1h",
  EMAIL_VERIFICATION: "24h",
  REFRESH_TOKEN: "7d",
} as const;

// Existing password / input validators
export const validatePasswordStrength = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8)
    errors.push("Password must be at least 8 characters long");
  if (!/[a-z]/.test(password))
    errors.push("Password must contain at least one lowercase letter");
  if (!/[A-Z]/.test(password))
    errors.push("Password must contain at least one uppercase letter");
  if (!/\d/.test(password))
    errors.push("Password must contain at least one number");
  if (!/[@$!%*?&]/.test(password))
    errors.push(
      "Password must contain at least one special character (@$!%*?&)"
    );
  return { isValid: errors.length === 0, errors };
};

export const validateEmailFormat = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePhoneFormat = (phone: string): boolean => {
  return /^[\+]?[1-9][\d]{0,15}$/.test(phone);
};

export const generateRandomPassword = (): string => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&";
  let pwd = "";
  // ensure one of each required type
  pwd += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  pwd += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  pwd += "0123456789"[Math.floor(Math.random() * 10)];
  pwd += "@$!%*?&"[Math.floor(Math.random() * 7)];
  for (let i = 4; i < length; i++) {
    pwd += charset[Math.floor(Math.random() * charset.length)];
  }
  return pwd
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
};

export const isAccountLocked = (
  loginAttempts: number,
  lastLoginAttempt?: Date
): boolean => {
  const MAX = 5;
  const DURATION_MS = 30 * 60 * 1000; // 30m
  if (loginAttempts < MAX) return false;
  if (!lastLoginAttempt) return true;
  return Date.now() - lastLoginAttempt.getTime() < DURATION_MS;
};

export const createRateLimitKey = (
  ip: string,
  type: "login" | "register"
): string => `${type}_${ip}`;

export const validateEmail = (email: unknown): string | null => {
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    return "Email is required";
  }

  // Use existing email format validator
  if (!validateEmailFormat(email.trim())) {
    return "Please provide a valid email address";
  }

  return null;
};

export const validatePassword = (password: unknown): string | null => {
  if (
    !password ||
    typeof password !== "string" ||
    password.trim().length === 0
  ) {
    return "Password is required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }

  return null;
};

export const validateName = (name: unknown): string | null => {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return "Name is required";
  }
  return null;
};

export const validatePhone = (phone: unknown): string | null => {
  if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
    return "Phone is required";
  }

  const phoneRegex = /^\+?[0-9]{7,15}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  if (!phoneRegex.test(cleanPhone)) {
    return "Please provide a valid phone number";
  }

  return null;
};

export const validateDateOfBirth = (dob: unknown): string | null => {
  if (!dob || isNaN(Date.parse(dob as string))) {
    return "Valid date of birth is required";
  }
  return null;
};

export const validateAddress = (address: unknown): string[] => {
  const errors: string[] = [];

  if (!address || typeof address !== "object") {
    errors.push("Address is required");
    return errors;
  }

  const { street, city, state, zipCode } = address as AddressData;

  if (!street || typeof street !== "string" || street.trim().length === 0) {
    errors.push("Street address is required");
  }

  if (!city || typeof city !== "string" || city.trim().length === 0) {
    errors.push("City is required");
  }

  if (!state || typeof state !== "string" || state.trim().length === 0) {
    errors.push("State is required");
  }

  if (!zipCode || typeof zipCode !== "string" || zipCode.trim().length === 0) {
    errors.push("ZIP code is required");
  } else {
    const zipRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    if (!zipRegex.test(zipCode.trim())) {
      errors.push("Please enter a valid zip code");
    }
  }

  return errors;
};

export const validateGender = (gender: unknown): string | null => {
  if (!gender || !Object.values(Gender).includes(gender as Gender)) {
    return "Valid gender is required";
  }
  return null;
};

export const validateOptionalStringArray = (
  value: unknown,
  fieldName: string
): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Array.isArray(value)) {
    return `${fieldName} must be an array of strings`;
  }

  if (value.some((item) => typeof item !== "string")) {
    return `${fieldName} must be an array of strings`;
  }

  return null;
};

export const validateOptionalEnum = <T extends Record<string, string>>(
  value: unknown,
  enumObject: T,
  fieldName: string
): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Object.values(enumObject).includes(value as T[keyof T])) {
    return `Invalid ${fieldName}`;
  }

  return null;
};

export const validateOptionalString = (
  value: unknown,
  fieldName: string
): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return `${fieldName} must be a non-empty string`;
  }

  return null;
};

// validation function for login
export const validateLoginCredentials = (
  email: unknown,
  password: unknown
): string[] => {
  const errors: string[] = [];

  if (
    !password ||
    typeof password !== "string" ||
    password.trim().length === 0
  ) {
    errors.push("Password is required");
  }

  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email is required");
  } else {
    const emailError = validateEmail(email);
    if (emailError) {
      errors.push(emailError);
    }
  }

  return errors;
};

// Common validation function for registration
export const validateRegistrationData = (
  data: ICustomerRegistrationData
): string[] => {
  const errors: string[] = [];

  const { name, email, password, dob, phone, address, gender, occupation } =
    data;

  const nameError = validateName(name);
  if (nameError) errors.push(nameError);

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);

  const dobError = validateDateOfBirth(dob);
  if (dobError) errors.push(dobError);

  const phoneError = validatePhone(phone);
  if (phoneError) errors.push(phoneError);

  const addressErrors = validateAddress(address);
  errors.push(...addressErrors);

  const genderError = validateGender(gender);
  if (genderError) errors.push(genderError);

  const occupationError = validateOptionalString(occupation, "Occupation");
  if (occupationError) errors.push(occupationError);

  return errors;
};

// Helper function to sanitize and prepare data
export const sanitizeCustomerData = (data: ICustomerRegistrationData) => {
  const sanitized: {
    name: string;
    email: string;
    phone: string;
    address: AddressData;
    dob: string;
    gender: Gender;
    occupation: string | undefined;
  } = {
    name: data.name?.trim(),
    email: data.email?.toLowerCase().trim(),
    phone: data.phone?.trim(),
    address: {
      street: data.address?.street?.trim(),
      city: data.address?.city?.trim(),
      state: data.address?.state?.trim(),
      zipCode: data.address?.zipCode?.trim(),
    },
    dob: data.dob?.trim(),
    gender: data.gender,
    occupation: data.occupation?.trim(),
  };

  return sanitized;
};

// Helper function to prepare response user data
export const prepareUserResponse = (user: ICustomer | IAdmin) => {
  const baseResponse = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };

  // Add customer-specific fields if user is a customer
  if (user.role === UserRole.CUSTOMER) {
    return {
      ...baseResponse,
      dob: (user as ICustomer).dob?.toISOString(),
      phone: (user as ICustomer).phone,
      gender: (user as ICustomer).gender,
      isVerified: (user as ICustomer).isVerified,
      isActive: (user as ICustomer).isActive,
      ...((user as ICustomer).occupation && {
        occupation: (user as ICustomer).occupation,
      }),
    };
  }

  return baseResponse;
};

export const handleAccountLocking = async (user: IUser) => {
  if (user.role === UserRole.ADMIN) {
    const adminUser = await Admin.findById(user._id);
    if (adminUser && isAccountLocked(adminUser.loginAttempts || 0)) {
      throw new Error(
        "Account is temporarily locked due to too many failed login attempts"
      );
    }
  }
};

export const handleFailedLogin = async (user: IUser) => {
  if (user.role === UserRole.ADMIN) {
    await Admin.findByIdAndUpdate(user._id, {
      $inc: { loginAttempts: 1 },
    });
  }
};

export const handleSuccessfullLogin = async (user: IUser) => {
  if (user.role === UserRole.ADMIN) {
    await Admin.findByIdAndUpdate(user._id, {
      loginAttempts: 0,
      lastLogin: new Date(),
    });
  }
};

export const getCustomerVerificationStatus = async (
  user: IUser
): Promise<boolean> => {
  if (user.role === UserRole.CUSTOMER) {
    const customerUser = await Customer.findById(user._id);
    return customerUser?.isVerified ?? false;
  }
  return true;
};

export const checkExistingUser = async (email: string) => {
  const existingUser = await Customer.findOne({
    email: email.toLowerCase().trim(),
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }
};

export const sendWelcomeEmail = async (customer: any) => {
  try {
    const emailSent = await emailService.sendCustomerWelcome({
      name: customer.name,
      email: customer.email,
      loginUrl: process.env.NEXT_PUBLIC_URL + "/auth/login",
    });

    if (!emailSent) {
      console.error("Failed to send welcome email to:", customer.email);
    }
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};
