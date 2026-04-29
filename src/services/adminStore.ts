import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type StoredOrder = {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    createdAt: string;
  };
  orderNumber: string;
  items: Array<{
    product: unknown;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    size?: string;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  createdAt: string;
};

type StoredNotification = {
  _id: string;
  type: "checkout_started" | "order_confirmed" | "order_status_updated";
  title: string;
  message: string;
  destination: string;
  relatedOrderId?: string;
  createdAt: string;
  isRead: boolean;
};

type StoreShape = {
  orders: StoredOrder[];
  notifications: StoredNotification[];
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "admin-store.json");

async function ensureStoreFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(dataFile, "utf8");
  } catch {
    const initialData: StoreShape = { orders: [], notifications: [] };
    await writeFile(dataFile, JSON.stringify(initialData, null, 2), "utf8");
  }
}

async function readStore(): Promise<StoreShape> {
  await ensureStoreFile();
  const raw = await readFile(dataFile, "utf8");
  return JSON.parse(raw) as StoreShape;
}

async function writeStore(store: StoreShape) {
  await ensureStoreFile();
  await writeFile(dataFile, JSON.stringify(store, null, 2), "utf8");
}

export async function getOrders() {
  const store = await readStore();
  return store.orders;
}

export async function getOrdersForEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const store = await readStore();
  return store.orders.filter((order) => order.user.email.trim().toLowerCase() === normalizedEmail);
}

export async function addOrder(order: StoredOrder) {
  const store = await readStore();
  store.orders = [order, ...store.orders];
  await writeStore(store);
  return order;
}

export async function updateOrderStatus(orderId: string, status: StoredOrder["orderStatus"]) {
  const store = await readStore();
  const orderIndex = store.orders.findIndex((order) => order._id === orderId);

  if (orderIndex === -1) {
    return null;
  }

  const updatedOrder: StoredOrder = { ...store.orders[orderIndex], orderStatus: status };
  store.orders[orderIndex] = updatedOrder;
  await writeStore(store);
  return updatedOrder;
}

export async function getNotifications() {
  const store = await readStore();
  return store.notifications;
}

export async function addNotification(notification: Omit<StoredNotification, "_id" | "createdAt" | "isRead">) {
  const store = await readStore();
  const createdNotification: StoredNotification = {
    ...notification,
    _id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  store.notifications = [createdNotification, ...store.notifications];
  await writeStore(store);
  return createdNotification;
}

export async function markNotificationRead(notificationId: string) {
  const store = await readStore();
  let updatedNotification: StoredNotification | null = null;

  store.notifications = store.notifications.map((notification) => {
    if (notification._id !== notificationId) {
      return notification;
    }

    updatedNotification = { ...notification, isRead: true };
    return updatedNotification;
  });

  await writeStore(store);
  return updatedNotification;
}
