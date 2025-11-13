// lib/utils/conatct.ts

export interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const validateContactRequest = (data: ContactRequest): string[] => {
  const errors: string[] = [];

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push("Name is required");
  } else if (data.name.trim().length > 100) {
    errors.push("Name must be less than 100 characters");
  }

  if (
    !data.email ||
    typeof data.email !== "string" ||
    data.email.trim().length === 0
  ) {
    errors.push("Email is required");
  } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push("Invalid email format");
  }

  if (
    !data.subject ||
    typeof data.subject !== "string" ||
    data.subject.trim().length === 0
  ) {
    errors.push("Subject is required");
  } else if (data.subject.trim().length > 100) {
    errors.push("Subject must be less than 100 characters");
  }

  if (
    !data.message ||
    typeof data.message !== "string" ||
    data.message.trim().length === 0
  ) {
    errors.push("Message is required");
  } else if (data.message.trim().length > 1000) {
    errors.push("Message must be less than 1000 characters");
  }
  return errors;
};
