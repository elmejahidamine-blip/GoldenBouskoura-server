// src/controllers/clerkWebhook.ts
import { Request, Response } from 'express';
import User from '../models/User';

export const clerkWebhook = async (req: Request, res: Response) => {
  try {
    const evt: any = req.body;
    const eventType = evt.type;

    console.log('📩 Webhook received:', eventType);

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      // Vérifie si l'utilisateur existe déjà
      const exists = await User.findOne({ clerkId: id });
      if (exists) {
        console.log('⚠️ User already exists:', id);
        return res.status(200).json({ success: true });
      }

      const newUser = await User.create({
        clerkId: id,
        email: email_addresses?.[0]?.email_address || '',
        firstName: first_name || '',
        lastName: last_name || '',
        photo: image_url || '',
      });

      console.log('✅ User created in MongoDB:', newUser);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};