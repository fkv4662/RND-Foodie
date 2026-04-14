import { useState } from "react";
import DashboardLayout from "./DashboardLayout";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: "CHEF" | "MANAGER" | "STAFF" | "AUDITOR" | "USER";
  lastActive: string;
};

export default function Admin() {
  const [users, setUsers] = useState<UserRow[]>([
    {
      id: 1,
      name: "SHAZIA",
      email: "shaziasultani@example.com",
      role: "MANAGER",
      lastActive: "newActive",
    },
    {
      id: 2,
      name: "TOMMY",
      email: "tommy@example.com",
      role: "CHEF",
      lastActive: "newActive",
    },
    {
      id: 3,
      name: "TAHA",
      email: "tahabazyan@example.com",
      role: "STAFF",
      lastActive: "5 min ago",
    },
    {
      id: 4,
      name: "THARSIKAN",
      email: "tharsikan@example.com",
      role: "STAFF",
      lastActive: "newActive",
    },
    {
      id: 5,
      name: "ROJAN",
      email: "rojan@example.com",
      role: "AUDITOR",
      lastActive: "5 min ago",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deletingUserName, setDeletingUserName] = useState("");

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRow["role"]>("STAFF");
  const [newActive, setNewActive] = useState(true);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<UserRow["role"]>("STAFF");
  const [editActive, setEditActive] = useState(true);

  const isUserActive = (user: UserRow) => user.lastActive !== "5 min ago";
  const statusText = (user: UserRow) =>
    isUserActive(user) ? "ACTIVE" : "INACTIVE";

  const handleAddUser = () => {
    if (!newName || !newEmail || !newPassword || !newRole) {
      alert("Please fill in all fields");
      return;
    }

    const emailExists = users.some(
      (user) => user.email.toLowerCase() === newEmail.toLowerCase()
    );

    if (emailExists) {
      alert("Email already exists");
      return;
    }

    const newUser: UserRow = {
      id: Date.now(),
      name: newName,
      email: newEmail,
      role: newRole,
      lastActive: newActive ? "newActive" : "5 min ago",
    };

    setUsers((prev) => [newUser, ...prev]);

    setShowAddModal(false);
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewRole("STAFF");
    setNewActive(true);
  };

  const handleEdit = (user: UserRow) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword("");
    setEditRole(user.role);
    setEditActive(isUserActive(user));
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editName || !editEmail || !editRole || editingUserId === null) {
      alert("Please fill in all required fields");
      return;
    }

    const emailExists = users.some(
      (user) =>
        user.id !== editingUserId &&
        user.email.toLowerCase() === editEmail.toLowerCase()
    );

    if (emailExists) {
      alert("Email already exists");
      return;
    }

    setUsers((prev) =>
      prev.map((user) =>
        user.id === editingUserId
          ? {
              ...user,
              name: editName,
              email: editEmail,
              role: editRole,
              lastActive: editActive ? "newActive" : "5 min ago",
            }
          : user
      )
    );

    setShowEditModal(false);
    setEditingUserId(null);
    setEditName("");
    setEditEmail("");
    setEditPassword("");
    setEditRole("STAFF");
    setEditActive(true);
  };

  const handleDeleteClick = (user: UserRow) => {
    setDeletingUserId(user.id);
    setDeletingUserName(user.name);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (deletingUserId === null) return;

    setUsers((prev) => prev.filter((user) => user.id !== deletingUserId));
    setShowDeleteModal(false);
    setDeletingUserId(null);
    setDeletingUserName("");
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingUserId(null);
    setDeletingUserName("");
  };

  return (
    <DashboardLayout title="ADMIN">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div
          style={{
            background: "#efefef",
            border: "1px solid #bdbdbd",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "10px",
            }}
          >
            Admin Dashboard
          </div>

          <StatRow
            number={String(users.length)}
            label="total users"
            icon="👥"
            iconColor="#7a4cc2"
          />
          <StatRow
            number={String(users.filter((u) => u.lastActive === "newActive").length)}
            label="Active Users"
            icon="✔"
            iconColor="#1fc34a"
          />
          <StatRow
            number={String(users.filter((u) => u.role === "CHEF").length)}
            label="Chef Users"
            icon="⚙️"
            iconColor="#f59c42"
          />
        </div>

        <div
          style={{
            background: "#efefef",
            border: "1px solid #9f9f9f",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                <span style={{ fontSize: "28px" }}>👥</span>
                <span>User Management</span>
              </div>

              <div
                style={{
                  color: "red",
                  fontSize: "9px",
                  opacity: 0.8,
                  marginTop: "2px",
                  marginLeft: "38px",
                }}
              >
                 Admin only
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: "#1f2bff",
                color: "#fff",
                border: "none",
                padding: "14px 24px",
                borderRadius: "6px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                minWidth: "140px",
              }}
            >
              +Add Users
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#fff",
                  border: "1px solid #cfcfcf",
                  borderRadius: "6px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  padding: "14px",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f7f7f7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#fff";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "50%",
                      background: "#2ecc71",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px" }}>
                      {user.name}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "4px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "10px",
                          fontWeight: 700,
                          background:
                            user.role === "CHEF"
                              ? "#e74c3c"
                              : user.role === "MANAGER"
                              ? "#f39c12"
                              : user.role === "AUDITOR"
                              ? "#8e44ad"
                              : "#3498db",
                          color: "#fff",
                        }}
                      >
                        {user.role}
                      </span>

                      <span style={{ fontSize: "11px", color: "#666" }}>
                        {user.email}
                      </span>

                      <span
                        style={{
                          fontSize: "10px",
                          color: statusText(user) === "INACTIVE" ? "#999" : "#1fc34a",
                          fontWeight: 700,
                        }}
                      >
                        {statusText(user)}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => handleEdit(user)}
                    style={actionButtonStyle("#1991ff")}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
                    style={actionButtonStyle("#e74c3c")}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0, marginBottom: "16px" }}>Add New User</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                placeholder="Full Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={inputStyle}
              />

              <input
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
              />

              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRow["role"])}
                style={inputStyle}
              >
                <option value="CHEF">CHEF</option>
                <option value="MANAGER">MANAGER</option>
                <option value="STAFF">STAFF</option>
                <option value="AUDITOR">AUDITOR</option>
                <option value="USER">USER</option>
              </select>

              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={newActive}
                  onChange={(e) => setNewActive(e.target.checked)}
                />
                Active user
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                onClick={() => setShowAddModal(false)}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>

              <button
                onClick={handleAddUser}
                style={primaryButtonStyle}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0, marginBottom: "16px" }}>Edit User</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                placeholder="Full Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                style={inputStyle}
              />

              <input
                type="email"
                placeholder="Email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Password (demo only, optional)"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                style={inputStyle}
              />

              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRow["role"])}
                style={inputStyle}
              >
                <option value="CHEF">CHEF</option>
                <option value="MANAGER">MANAGER</option>
                <option value="STAFF">STAFF</option>
                <option value="AUDITOR">AUDITOR</option>
                <option value="USER">USER</option>
              </select>

              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                />
                Active user
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                onClick={() => setShowEditModal(false)}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                style={primaryButtonStyle}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0, marginBottom: "12px" }}>Delete User</h2>

            <p style={{ margin: "0 0 18px 0", fontSize: "14px", color: "#333" }}>
              Are you sure you want to delete{" "}
              <strong>{deletingUserName}</strong>?
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={handleCancelDelete}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                style={{
                  ...primaryButtonStyle,
                  background: "#e74c3c",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function StatRow({
  number,
  label,
  icon,
  iconColor,
}: {
  number: string;
  label: string;
  icon: string;
  iconColor: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "80px 1fr 40px",
        alignItems: "center",
        background: "#fff",
        border: "1px solid #d3d3d3",
        borderRadius: "6px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        padding: "10px 10px",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          fontSize: "18px",
          fontWeight: 700,
        }}
      >
        {number}
      </div>

      <div
        style={{
          fontSize: "14px",
          color: "#333",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "22px",
          textAlign: "center",
          color: iconColor,
        }}
      >
        {icon}
      </div>
    </div>
  );
}

function actionButtonStyle(color: string): React.CSSProperties {
  return {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    color,
    padding: 0,
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
};

const modalStyle: React.CSSProperties = {
  width: "420px",
  maxWidth: "90%",
  background: "#fff",
  borderRadius: "12px",
  padding: "24px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  border: "1px solid #ccc",
  background: "#fff",
  cursor: "pointer",
  borderRadius: "6px",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 16px",
  border: "none",
  background: "#1f2bff",
  color: "#fff",
  cursor: "pointer",
  borderRadius: "6px",
  fontWeight: 700,
};