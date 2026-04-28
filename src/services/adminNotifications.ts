import { addNotification } from "./adminStore";

type AdminOrderNotificationEvent = "checkout_started" | "order_confirmed" | "order_status_updated";

type AdminOrderPayload = {
  orderId?: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  totalAmount: number;
  status?: string;
};

export type AdminOrderNotificationRequest = {
  event: AdminOrderNotificationEvent;
  order: AdminOrderPayload;
};

const adminEmail = process.env.ADMIN_ALERT_EMAIL || "admin@example.com";

function buildAdminMessage(event: AdminOrderNotificationEvent, order: AdminOrderPayload): string {
  switch (event) {
    case "checkout_started":
      return `Traitement en cours: ${order.customerName} a commence une commande. ${order.itemCount} article(s), total $${order.totalAmount.toFixed(2)}.`;
    case "order_confirmed":
      return `Operation confirmee: ${order.customerName} a confirme la commande ${order.orderNumber || order.orderId || ""}. Total $${order.totalAmount.toFixed(2)}.`;
    case "order_status_updated":
      return `Mise a jour commande: ${order.customerName}, commande ${order.orderNumber || order.orderId || ""}, statut ${order.status || "updated"}.`;
    default:
      return `Nouvelle mise a jour commande de ${order.customerName}.`;
  }
}

function buildSubject(event: AdminOrderNotificationEvent): string {
  switch (event) {
    case "checkout_started":
      return "GoldenBouskoura: traitement de commande en cours";
    case "order_confirmed":
      return "GoldenBouskoura: commande confirmee";
    case "order_status_updated":
      return "GoldenBouskoura: statut de commande mis a jour";
    default:
      return "GoldenBouskoura: notification commande";
  }
}

async function sendAdminEmail(subject: string, body: string): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (!resendApiKey || !emailFrom) {
    console.log("[admin-notify] Email bridge not configured.", { to: adminEmail, subject, body });
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [adminEmail],
      subject,
      text: body,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[admin-notify] Resend email failed", errorText);
    return false;
  }

  return true;
}

export async function notifyAdminOrder(request: AdminOrderNotificationRequest) {
  const message = buildAdminMessage(request.event, request.order);
  const subject = buildSubject(request.event);
  const delivered = await sendAdminEmail(subject, message);
  const storedNotification = await addNotification({
    type: request.event,
    title:
      request.event === "checkout_started"
        ? "Traitement en cours"
        : request.event === "order_confirmed"
          ? "Operation confirmee"
          : "Mise a jour commande",
    message,
    destination: adminEmail,
    relatedOrderId: request.order.orderId,
  });

  return {
    delivered,
    destination: adminEmail,
    subject,
    message,
    notification: storedNotification,
  };
}
