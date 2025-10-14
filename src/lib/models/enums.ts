// lib/models/enums.ts
export enum UserRole {
  ADMIN = "admin",
  CUSTOMER = "customer",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export enum DayOfWeek {
  SUNDAY = "Sunday",
  MONDAY = "Monday",
  TUESDAY = "Tuesday",
  WEDNESDAY = "Wednesday",
  THURSDAY = "Thursday",
  FRIDAY = "Friday",
  SATURDAY = "Saturday",
}

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  REFUNDED = "refunded",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

export enum PaymentMethod {
  STRIPE = "stripe",
  CASH = "cash",
}
