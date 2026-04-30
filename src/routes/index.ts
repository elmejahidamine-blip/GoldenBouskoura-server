// src/routes/index.ts
import { getAuth } from "@clerk/express";
import { Router } from "express";
import { 
  addOrder, 
  getNotifications, 
  getOrders, 
  getOrdersForEmail, 
  markNotificationRead, 
  updateOrderStatus 
} from "../services/adminStore";
import { notifyAdminOrder } from "../services/adminNotifications";

const router = Router();

// ==================== ROUTES DE BASE ====================
router.get("/", (_req, res) => {
  res.send("Server is live!");
});

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// ==================== ROUTES PROTÉGÉES ====================
router.get("/protected", (req, res) => {
  const { isAuthenticated, userId, sessionId } = getAuth(req);

  if (!isAuthenticated) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  return res.status(200).json({
    message: "Protected route is working",
    userId,
    sessionId,
  });
});

// ==================== ORDERS ====================
router.post("/orders", async (req, res) => {
  const order = req.body;

  if (!order?._id || !order?.user?.email || !Array.isArray(order?.items)) {
    return res.status(400).json({
      error: "Invalid order payload",
    });
  }

  try {
    const createdOrder = await addOrder(order);
    const notification = await notifyAdminOrder({
      event: "order_confirmed",
      order: {
        orderId: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        customerName: createdOrder.user.name,
        customerEmail: createdOrder.user.email,
        itemCount: createdOrder.items.length,
        totalAmount: createdOrder.totalAmount,
        status: createdOrder.orderStatus,
      },
    });

    return res.status(201).json({
      order: createdOrder,
      notification,
    });
  } catch {
    return res.status(500).json({
      error: "Failed to create order",
    });
  }
});

router.get("/orders", async (req, res) => {
  const userEmail = typeof req.query.userEmail === "string" ? req.query.userEmail : "";

  try {
    const orders = userEmail ? await getOrdersForEmail(userEmail) : await getOrders();
    return res.status(200).json({ orders });
  } catch {
    return res.status(500).json({
      error: "Failed to fetch orders",
    });
  }
});

// ==================== ADMIN ====================
router.post("/admin/notify-order", async (req, res) => {
  const { event, order } = req.body ?? {};

  if (!event || !order) {
    return res.status(400).json({
      error: "event and order are required",
    });
  }

  try {
    const result = await notifyAdminOrder({ event, order });

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to notify admin",
    });
  }
});

router.patch("/admin/orders/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body ?? {};

  if (!status) {
    return res.status(400).json({
      error: "status is required",
    });
  }

  try {
    const updatedOrder = await updateOrderStatus(orderId, status);

    if (!updatedOrder) {
      return res.status(404).json({
        error: "Order not found",
      });
    }

    await notifyAdminOrder({
      event: "order_status_updated",
      order: {
        orderId: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        customerName: updatedOrder.user.name,
        customerEmail: updatedOrder.user.email,
        itemCount: updatedOrder.items.length,
        totalAmount: updatedOrder.totalAmount,
        status: updatedOrder.orderStatus,
      },
    });

    return res.status(200).json({ order: updatedOrder });
  } catch {
    return res.status(500).json({
      error: "Failed to update order status",
    });
  }
});

router.get("/admin/notifications", async (_req, res) => {
  try {
    const notifications = await getNotifications();
    return res.status(200).json({ notifications });
  } catch {
    return res.status(500).json({
      error: "Failed to fetch notifications",
    });
  }
});

router.patch("/admin/notifications/:notificationId/read", async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await markNotificationRead(notificationId);

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    return res.status(200).json({ notification });
  } catch {
    return res.status(500).json({
      error: "Failed to update notification",
    });
  }
});

export default router;