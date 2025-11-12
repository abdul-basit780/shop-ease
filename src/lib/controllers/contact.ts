// lib/controllers/contact.ts
// lib/controllers/category.ts
import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../db/mongodb";
import { ContactRequest } from "../utils/contact";
import { validateContactRequest } from "../utils/contact";
import { emailService } from "../services/EmailService";
import { Admin } from "../models";

interface Response {
  success: boolean;
  message: string;
  statusCode: number | undefined;
}


export const postContact = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const contactResponse: Response = {
    success: false,
    message: "",
    statusCode: 500,
  };

  const requestData: ContactRequest = req.body;

  const validationErrors = validateContactRequest(requestData);
  if (validationErrors.length > 0) {
    contactResponse.message = validationErrors.join(", ");
    contactResponse.statusCode = 400;
    return contactResponse;
  }

  try {

    const admins = await Admin.find().select('email');

    if(admins.length === 0) {
      contactResponse.message = "No admin found";
      contactResponse.statusCode = 404;
      return contactResponse;
    }

    const emails = admins.map(admin => admin.email);

    // Send email to admins
    const emailSent = await emailService.sendContactForm({...requestData, emails});
    if (!emailSent) {
      console.error("Failed to send contact email");
      contactResponse.message = "Failed to send contact email";
      contactResponse.statusCode = 500;
      return contactResponse;
    }
    

    contactResponse.success = true;
    contactResponse.message = "Message sent successfully";
    contactResponse.statusCode = 200;
    return contactResponse;
  } catch (err) {
    console.error("Create category error:", err);
    contactResponse.message = "Internal server error";
    contactResponse.statusCode = 500;
    return contactResponse;
  }
};
