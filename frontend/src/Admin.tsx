import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";

type UserRow = {
  id: number;
  username: string;
  email: string;
  role: "CHEF" | "MANAGER" | "AUDITOR";
};

export default function Admin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRow["role"]>("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [deletingUserName, setDeletingUserName] = useState("");

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRow["role"]>("MANAGER");

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<UserRow["role"]>("CHEF");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/api/users");
      const data = await res.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        alert(data.message || "Failed to load users");
      }
    } catch {
      alert("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().startsWith(searchText.toLowerCase());

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

  return matchesSearch && matchesRole;
});

  const handleAddUser = async () => {
    if (!newName || !newEmail || !newPassword || !newRole) {
      alert("Please fill in all fields");
      return;
    }

    const res = await fetch("http://localhost:4000/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: newName,
        email: newEmail,
        password: newPassword,
        role: newRole,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setShowAddModal(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewRole("CHEF");
      fetchUsers();
    } else {
      alert(data.message || "Failed to create user");
    }
  };

  const handleEditClick = (user: UserRow) => {
    setEditingUserId(user.id);
    setEditName(user.username);
    setEditEmail(user.email);
    setEditPassword("");
    setEditRole(user.role);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editName || !editEmail || !editRole || editingUserId === null) {
      alert("Please fill in all required fields");
      return;
    }

    const res = await fetch(`http://localhost:4000/api/users/${editingUserId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: editName,
        email: editEmail,
        role: editRole,
        password: editPassword,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setShowEditModal(false);
      setEditingUserId(null);
      setEditName("");
      setEditEmail("");
      setEditPassword("");
      setEditRole("CHEF");
      fetchUsers();
    } else {
      alert(data.message || "Failed to update user");
    }
  };

  const handleDeleteClick = (user: UserRow) => {
    setDeletingUserId(user.id);
    setDeletingUserName(user.username);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingUserId === null) return;

    const res = await fetch(`http://localhost:4000/api/users/${deletingUserId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (data.success) {
      setShowDeleteModal(false);
      setDeletingUserId(null);
      setDeletingUserName("");
      fetchUsers();
    } else {
      alert(data.message || "Failed to delete user");
    }
  };

  return (
    <DashboardLayout title="MANAGER CONTROL PANEL">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={cardStyle}>
          <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "10px" }}>
            Admin Dashboard
          </div>

          <StatRow number={String(users.length)} label="total users" icon="👥" iconColor="#7a4cc2" />
          <StatRow number={String(users.filter((u) => u.role === "CHEF").length)} label="Chef Users" icon="✔" iconColor="#1fc34a" />
          <StatRow number={String(users.filter((u) => u.role === "MANAGER").length)} label="Manager Users" icon="⚙️" iconColor="#f59c42" />
        </div>

        <div style={cardStyle}>
          <div style={headerTop}>
            <div>
              <div style={titleRow}>
                <span style={{ fontSize: "28px" }}>👥</span>
                <span>User Management</span>
              </div>

              <div style={subText}>MANAGER VIEW ONLY</div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                placeholder="Search users..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={searchInputStyle}
              />

              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as "ALL" | UserRow["role"])
                }
                style={filterStyle}
              >
                <option value="ALL">Filter</option>
                <option value="CHEF">CHEF</option>
                <option value="MANAGER">MANAGER</option>
                <option value="AUDITOR">AUDITOR</option>
              </select>

              <button onClick={fetchUsers} title="Refresh" style={refreshIconButton}>
                🔄
              </button>

              <button onClick={() => setShowAddModal(true)} style={primaryButtonStyle}>
                + Add User
              </button>
            </div>
          </div>

          <div style={tableHeaderStyle}>
            <div>USERNAME</div>
            <div style={{ textAlign: "center" }}>EMAIL</div>
            <div style={{ gridTemplateColumns: "80px 1fr 2fr 150px 180px" }}>ROLE</div>
            <div style={{ textAlign: "center" }}>ACTIONS</div>
          </div>

          {loading ? (
            <div style={emptyStyle}>Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div style={emptyStyle}>No users found.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filteredUsers.map((user) => (
                <div key={user.id} style={userRowStyle}>
                  <div>
                    <div style={{ ...avatarStyle, background: getRoleColor(user.role) }}>
                      {user.username.slice(0, 2).toUpperCase()}
                    </div>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: "16px" }}>
                    {user.username}
                  </div>

                  <div style={{ fontSize: "14px", color: "#555",  textAlign: "center"}}>
                    {user.email}
                  </div>

                  <div>
                    <span style={{ ...roleBadgeStyle, background: getRoleColor(user.role) }}>
                      {user.role}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                    <button onClick={() => handleEditClick(user)} style={smallEditButton}>
                      Edit
                    </button>

                    <button onClick={() => handleDeleteClick(user)} style={smallDeleteButton}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0 }}>Add User</h2>

            <input style={inputStyle} placeholder="Username" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input style={inputStyle} placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <input style={inputStyle} placeholder="Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

            <select style={inputStyle} value={newRole} onChange={(e) => setNewRole(e.target.value as UserRow["role"])}>
              <option value="CHEF">CHEF</option>
              <option value="MANAGER">MANAGER</option>
              <option value="AUDITOR">AUDITOR</option>
            </select>

            <div style={modalActions}>
              <button onClick={() => setShowAddModal(false)} style={cancelButtonStyle}>
                Cancel
              </button>
              <button onClick={handleAddUser} style={primaryButtonStyle}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0 }}>Edit User</h2>

            <input style={inputStyle} placeholder="Username" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <input style={inputStyle} placeholder="Email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            <input style={inputStyle} placeholder="New Password (optional)" type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />

            <select style={inputStyle} value={editRole} onChange={(e) => setEditRole(e.target.value as UserRow["role"])}>
              <option value="CHEF">CHEF</option>
              <option value="MANAGER">MANAGER</option>
              <option value="AUDITOR">AUDITOR</option>
            </select>

            <div style={modalActions}>
              <button onClick={() => setShowEditModal(false)} style={cancelButtonStyle}>
                Cancel
              </button>
              <button onClick={handleSaveEdit} style={primaryButtonStyle}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0 }}>Delete User</h2>

            <p>
              Are you sure you want to delete <strong>{deletingUserName}</strong>?
            </p>

            <div style={modalActions}>
              <button onClick={() => setShowDeleteModal(false)} style={cancelButtonStyle}>
                Cancel
              </button>
              <button onClick={handleConfirmDelete} style={deleteButtonStyle}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function getRoleColor(role: UserRow["role"]) {
  if (role === "CHEF") return "#3498db";
  if (role === "MANAGER") return "#f39c12";
  if (role === "AUDITOR") return "#8e44ad";
  return "#777";
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
    <div style={statRowStyle}>
      <div style={{ fontSize: "18px", fontWeight: 700 }}>{number}</div>
      <div style={{ fontSize: "14px", color: "#333" }}>{label}</div>
      <div style={{ fontSize: "22px", textAlign: "center", color: iconColor }}>
        {icon}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#efefef",
  border: "1px solid #bdbdbd",
  borderRadius: "8px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  padding: "12px 14px",
};

const headerTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
  flexWrap: "wrap",
  gap: "12px",
};

const titleRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "18px",
  fontWeight: 700,
};

const subText: React.CSSProperties = {
  color: "red",
  fontSize: "9px",
  opacity: 0.8,
  marginTop: "2px",
  marginLeft: "38px",
};

const statRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "80px 1fr 40px",
  alignItems: "center",
  background: "#fff",
  border: "1px solid #d3d3d3",
  borderRadius: "6px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
  padding: "10px",
  marginBottom: "8px",
};

const tableHeaderStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.5fr 2fr 150px 180px",
  alignItems: "center",
  background: "#ddd",
  padding: "12px 14px",
  fontWeight: 700,
  fontSize: "13px",
  borderRadius: "6px 6px 0 0",
  border: "1px solid #cfcfcf",
  textAlign: "left",
};

const userRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "80px 1.6fr 2fr 170px 180px",
  alignItems: "center",
  background: "#fff",
  borderLeft: "1px solid #cfcfcf",
  borderRight: "1px solid #cfcfcf",
  borderBottom: "1px solid #cfcfcf",
  padding: "14px",
  columnGap: "12px",
};

const searchInputStyle: React.CSSProperties = {
  padding: "12px",
  border: "1px solid #bbb",
  borderRadius: "6px",
  fontSize: "14px",
  minWidth: "220px",
};

const filterStyle: React.CSSProperties = {
  padding: "12px",
  border: "1px solid #bbb",
  borderRadius: "6px",
  fontSize: "14px",
  minWidth: "140px",
};

const refreshIconButton: React.CSSProperties = {
  background: "#fff",
  color: "#000",
  border: "1px solid #bbb",
  width: "48px",
  height: "48px",
  borderRadius: "6px",
  fontSize: "24px",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#1f2bff",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
};

const cancelButtonStyle: React.CSSProperties = {
  background: "#fff",
  color: "#333",
  border: "1px solid #bbb",
  padding: "12px 20px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
};

const deleteButtonStyle: React.CSSProperties = {
  background: "#e74c3c",
  color: "#fff",
  border: "none",
  padding: "12px 20px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: 700,
  cursor: "pointer",
};

const smallEditButton: React.CSSProperties = {
  background: "#fff",
  color: "#1991ff",
  border: "1px solid #1991ff",
  padding: "8px 14px",
  borderRadius: "6px",
  fontWeight: 700,
  cursor: "pointer",
};

const smallDeleteButton: React.CSSProperties = {
  background: "#fff",
  color: "#e74c3c",
  border: "1px solid #e74c3c",
  padding: "8px 14px",
  borderRadius: "6px",
  fontWeight: 700,
  cursor: "pointer",
};

const emptyStyle: React.CSSProperties = {
  padding: "20px",
  background: "#fff",
  borderRadius: "6px",
};

const avatarStyle: React.CSSProperties = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: "bold",
  color: "#fff",
};

const roleBadgeStyle: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: "10px",
  fontSize: "12px",
  fontWeight: 800,
  color: "#fff",
  display: "inline-block",
  textAlign: "center",
  minWidth: "90px",
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
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "14px",
  marginBottom: "10px",
  boxSizing: "border-box",
};

const modalActions: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "12px",
};