// pages/api/docs/swagger.json.ts
import { NextApiRequest, NextApiResponse } from "next";
import { swaggerSpec } from "@/lib/utils/swagger/index";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // Set appropriate headers
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Return the Swagger specification
    res.status(200).json(swaggerSpec);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({
      success: false,
      message: "Method not allowed",
      allowedMethods: ["GET"],
    });
  }
}
