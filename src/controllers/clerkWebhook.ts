import { verifyWebhook } from "@clerk/express/webhooks";
import type { Request, Response } from "express";
import connectToDatabase from "../config/db";
import User from "../models/User";

type ClerkEmailAddress = {
  id?: string;
  email_address?: string;
};

type ClerkUserData = {
  id: string;
  email_addresses?: ClerkEmailAddress[];
  primary_email_address_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
};

let mongoConnection: Promise<void> | null = null;

function ensureDatabaseConnection(): Promise<void> {
  mongoConnection ??= connectToDatabase();
  return mongoConnection;
}

function getPrimaryEmail(data: ClerkUserData): string {
  const email =
    data.email_addresses?.find((address) => address.id === data.primary_email_address_id)?.email_address ||
    data.email_addresses?.[0]?.email_address ||
    "";

  return email.trim().toLowerCase();
}

function getDisplayName(data: ClerkUserData): string {
  return [data.first_name, data.last_name].filter(Boolean).join(" ").trim();
}

export async function clerkWebhook(req: Request, res: Response) {
  try {
    const evt = await verifyWebhook(req);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      await ensureDatabaseConnection();

      const data = evt.data as ClerkUserData;
      const userData = {
        clerkId: data.id,
        email: getPrimaryEmail(data),
        name: getDisplayName(data),
        image: data.image_url || "",
      };

      const user = await User.findOneAndUpdate({ clerkId: data.id }, userData, {
        new: true,
        setDefaultsOnInsert: true,
        upsert: true,
      });

      return res.status(200).json({ success: true, user });
    }

    if (evt.type === "user.deleted") {
      await ensureDatabaseConnection();

      const data = evt.data as { id?: string };

      if (data.id) {
        await User.findOneAndDelete({ clerkId: data.id });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ success: true, ignored: evt.type });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return res.status(400).send("Error verifying webhook");
  }
}
