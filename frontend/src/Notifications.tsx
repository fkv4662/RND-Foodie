import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/notifications");
      const data = await response.json();
      setNotifications(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`http://localhost:4000/api/notifications/${id}/read`, {
        method: "PUT"
      });
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("http://localhost:4000/api/notifications/read-all", {
        method: "PUT"
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await fetch(`http://localhost:4000/api/notifications/${id}`, {
        method: "DELETE"
      });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "alert": return "#e74c3c";
      case "warning": return "#f39c12";
      case "success": return "#27ae60";
      default: return "#3498db";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "alert": return "🚨";
      case "warning": return "⚠️";
      case "success": return "✅";
      default: return "ℹ️";
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <DashboardLayout title="Notifications">
      <div style={{ maxWidth: "900px" }}>

        {/* Header with actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "16px", color: "#555" }}>
            {unreadCount > 0 ? (
              <span style={{ fontWeight: "bold", color: "#e74c3c" }}>
                {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
              </span>
            ) : (
              <span>All notifications read ✅</span>
            )}
          </div>
          <button
            onClick={markAllAsRead}
            style={{ backgroundColor: "black", color: "white", padding: "8px 16px", border: "none", cursor: "pointer", borderRadius: "4px" }}
          >
            Mark all as read
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "#555" }}>
            Loading notifications...
          </div>
        )}

        {/* Empty state */}
        {!loading && notifications.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "8px" }}>
            <div style={{ fontSize: "48px" }}>🔔</div>
            <div style={{ fontSize: "18px", color: "#555", marginTop: "10px" }}>No notifications yet</div>
          </div>
        )}

        {/* Notifications list */}
        {!loading && notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              backgroundColor: notification.is_read ? "white" : "#f0f7ff",
              padding: "16px 20px",
              borderRadius: "8px",
              marginBottom: "12px",
              borderLeft: `4px solid ${getTypeColor(notification.type)}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}
          >
            {/* Left side */}
            <div style={{ display: "flex", gap: "15px", flex: 1 }}>
              <div style={{ fontSize: "28px" }}>{getTypeIcon(notification.type)}</div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "4px" }}>
                  {notification.title}
                  {!notification.is_read && (
                    <span style={{ marginLeft: "8px", backgroundColor: "#e74c3c", color: "white", fontSize: "10px", padding: "2px 6px", borderRadius: "10px" }}>
                      NEW
                    </span>
                  )}
                </div>
                <div style={{ color: "#555", fontSize: "14px", marginBottom: "6px" }}>
                  {notification.message}
                </div>
                <div style={{ color: "#999", fontSize: "12px" }}>
                  {new Date(notification.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Right side buttons */}
            <div style={{ display: "flex", gap: "8px", marginLeft: "15px" }}>
              {!notification.is_read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  style={{ backgroundColor: "white", color: "black", padding: "5px 10px", border: "1px solid #ddd", cursor: "pointer", borderRadius: "4px", fontSize: "12px" }}
                >
                  Mark read
                </button>
              )}
              <button
                onClick={() => deleteNotification(notification.id)}
                style={{ backgroundColor: "white", color: "#e74c3c", padding: "5px 10px", border: "1px solid #e74c3c", cursor: "pointer", borderRadius: "4px", fontSize: "12px" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Test - Add sample notification button */}
        <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "white", borderRadius: "8px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "15px" }}>Test Notifications:</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={async () => {
                await fetch("http://localhost:4000/api/notifications", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title: "Temperature Alert!", message: "Hot food check temperature is below 75°C. Immediate action required!", type: "alert" })
                });
                fetchNotifications();
              }}
              style={{ backgroundColor: "#e74c3c", color: "white", padding: "8px 16px", border: "none", cursor: "pointer", borderRadius: "4px" }}
            >
              🚨 Add Temperature Alert
            </button>
            <button
              onClick={async () => {
                await fetch("http://localhost:4000/api/notifications", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title: "Task Reminder", message: "CCP checks are due at 11:30 AM. Please complete them on time.", type: "warning" })
                });
                fetchNotifications();
              }}
              style={{ backgroundColor: "#f39c12", color: "white", padding: "8px 16px", border: "none", cursor: "pointer", borderRadius: "4px" }}
            >
              ⚠️ Add Task Reminder
            </button>
            <button
              onClick={async () => {
                await fetch("http://localhost:4000/api/notifications", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title: "Task Completed!", message: "All CCP checks for today have been completed successfully.", type: "success" })
                });
                fetchNotifications();
              }}
              style={{ backgroundColor: "#27ae60", color: "white", padding: "8px 16px", border: "none", cursor: "pointer", borderRadius: "4px" }}
            >
              ✅ Add Completion
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}