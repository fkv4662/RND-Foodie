import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";

interface OvenLog {
  id?: number;
  device_name: string;
  food_item?: string;
  starting_temperature: number;
  finishing_temperature: number;
  status: string;
  recorded_at: string;
}

export default function RationalOven() {
  const navigate = useNavigate();

  const [logs, setLogs] = useState<OvenLog[]>([]);
  const [alerts, setAlerts] = useState<OvenLog[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAuditor = user?.role === "AUDITOR";

  const alertCount = alerts.length;

  const validStartTemps = logs
    .map((log) => Number(log.starting_temperature))
    .filter((temp) => !Number.isNaN(temp));

  const validFinishTemps = logs
    .map((log) => Number(log.finishing_temperature))
    .filter((temp) => !Number.isNaN(temp));

  const avgStartTemp =
    validStartTemps.length > 0
      ? (
          validStartTemps.reduce((sum, temp) => sum + temp, 0) /
          validStartTemps.length
        ).toFixed(2)
      : "N/A";

  const avgFinishTemp =
    validFinishTemps.length > 0
      ? (
          validFinishTemps.reduce((sum, temp) => sum + temp, 0) /
          validFinishTemps.length
        ).toFixed(2)
      : "N/A";

  useEffect(() => {
    const fetchData = () => {
      fetch("/api/rational-oven/logs")
        .then((res) => res.json())
        .then(setLogs);

      fetch("/api/rational-oven/alerts")
        .then((res) => res.json())
        .then(setAlerts);
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  const refresh = () => {
    fetch("/api/rational-oven/logs")
      .then((res) => res.json())
      .then(setLogs);

    fetch("/api/rational-oven/alerts")
      .then((res) => res.json())
      .then(setAlerts);
  };

  return (
    <DashboardLayout title="Rational Oven">
      <div
        style={{
          background: "#f7f7f7",
          fontFamily: "Arial, sans-serif",
          padding: "2em",
          borderRadius: 24,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto 1.25em",
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: "#fff",
              color: "#2a4d69",
              border: "1px solid #cbd5e1",
              padding: "0.75em 1.1em",
              borderRadius: "10px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            }}
          >
            ← Back
          </button>
        </div>

        {isAuditor && (
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto 1.5em",
              background: "#fff3cd",
              border: "1px solid #f1c40f",
              borderRadius: "10px",
              padding: "14px 18px",
              fontWeight: 700,
              color: "#6b5200",
            }}
          >
            View only 
          </div>
        )}

        {!isAuditor && (
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto 2.5em",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)",
              gap: "1.5em",
              alignItems: "start",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 4px 24px #0002",
                padding: "2.5em 2em 2em 2em",
              }}
            >
              <h2
                style={{
                  fontWeight: 800,
                  fontSize: "2em",
                  marginBottom: "1.2em",
                  color: "#2a4d69",
                }}
              >
                Manual Rational Oven Entry
              </h2>

              <OvenForm
                onSubmit={() => {
                  setTimeout(refresh, 500);
                }}
              />
            </div>

            <div
              style={{
                background: "linear-gradient(180deg, #eef6ff 0%, #ffffff 100%)",
                borderRadius: 18,
                boxShadow: "0 4px 24px #0002",
                padding: "2em",
                border: "1px solid #cfe0f2",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5em",
                  background: "#dbeafe",
                  color: "#1d4d8f",
                  borderRadius: 999,
                  padding: "0.5em 0.85em",
                  fontWeight: 700,
                  fontSize: "0.82em",
                  marginBottom: "1.25em",
                }}
              >
                CLOUD FEED STATUS
              </div>

              <h3
                style={{
                  fontWeight: 800,
                  fontSize: "1.6em",
                  margin: "0 0 0.7em",
                  color: "#2a4d69",
                }}
              >
                Automatic oven data is under maintenance
              </h3>

              <p
                style={{
                  margin: "0 0 1em",
                  color: "#4b5d6b",
                  lineHeight: 1.6,
                  fontSize: "1em",
                }}
              >
                The Rational cloud integration is not active yet, so live oven
                records are temporarily unavailable on this screen.
              </p>

              <div
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  padding: "1em 1.1em",
                  border: "1px solid #d8e4f0",
                  marginBottom: "1em",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: "#1d4d8f",
                    marginBottom: "0.45em",
                  }}
                >
                  What to use right now
                </div>

                <div style={{ color: "#4b5d6b", lineHeight: 1.6 }}>
                  Continue using manual entry to record start and finish
                  temperatures while the automatic sync is being updated.
                </div>
              </div>

              <div
                style={{
                  color: "#6b7b88",
                  fontSize: "0.95em",
                  lineHeight: 1.6,
                }}
              >
                Once maintenance is complete, cloud-fed oven logs can be added
                here alongside manual records.
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 4px 24px #0002",
            padding: "2em",
            marginBottom: "2.5em",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "2em",
              alignItems: "center",
              marginBottom: "2em",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                background: "#f7f7f7",
                borderRadius: "10px",
                boxShadow: "0 2px 8px #0001",
                padding: "1em 2em",
                minWidth: 180,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "2.2em",
                  color: "#e74c3c",
                  fontWeight: 700,
                }}
              >
                {alertCount}
              </div>

              <div
                style={{
                  color: "#e74c3c",
                  fontWeight: 600,
                  fontSize: "1.1em",
                }}
              >
                Active Alerts
              </div>
            </div>

            <div
              style={{
                background: "#f7f7f7",
                borderRadius: "10px",
                boxShadow: "0 2px 8px #0001",
                padding: "1em 2em",
                minWidth: 180,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "1.2em",
                  color: "#2a4d69",
                  fontWeight: 700,
                }}
              >
                Start: {avgStartTemp}°C
              </div>

              <div
                style={{
                  fontSize: "1.2em",
                  color: "#2a4d69",
                  fontWeight: 700,
                }}
              >
                Finish: {avgFinishTemp}°C
              </div>

              <div
                style={{
                  color: "#2a4d69",
                  fontWeight: 600,
                  fontSize: "1.1em",
                }}
              >
                Avg Temperatures
              </div>
            </div>

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: "1em",
              }}
            >
              <button
                onClick={() => setShowAlerts(false)}
                style={{
                  background: showAlerts ? "#fff" : "#2a4d69",
                  color: showAlerts ? "#2a4d69" : "#fff",
                  border: "2px solid #2a4d69",
                  padding: "0.5em 1.5em",
                  borderRadius: "6px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Show All Logs
              </button>

              <button
                onClick={() => setShowAlerts(true)}
                style={{
                  background: showAlerts ? "#2a4d69" : "#fff",
                  color: showAlerts ? "#fff" : "#2a4d69",
                  border: "2px solid #2a4d69",
                  padding: "0.5em 1.5em",
                  borderRadius: "6px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Show Alerts Only
              </button>

              {!isAuditor && (
                <button
                  style={{
                    background: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    padding: "0.5em 1.5em",
                    borderRadius: "6px",
                    fontWeight: 700,
                    cursor: "pointer",
                    marginLeft: "1em",
                  }}
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Delete ALL logs? This cannot be undone."
                      )
                    ) {
                      await fetch("/api/rational-oven/logs", {
                        method: "DELETE",
                      });
                      refresh();
                    }
                  }}
                >
                  Delete All Logs
                </button>
              )}
            </div>
          </div>

          <h2
            style={{
              fontWeight: 800,
              fontSize: "1.5em",
              marginBottom: "1em",
              color: "#2a4d69",
            }}
          >
            All Rational Oven Logs
          </h2>

          {!showAlerts ? (
            <OvenLogsTable logs={logs} />
          ) : (
            <OvenLogsTable logs={alerts} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function OvenForm({ onSubmit }: { onSubmit: () => void }) {
  const [device_name, setDeviceName] = useState("");
  const [food_item, setFoodItem] = useState("");
  const [starting_temperature, setStartingTemperature] = useState("");
  const [finishing_temperature, setFinishingTemperature] = useState("");


  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        const res = await fetch("/api/rational-oven/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            device_name,
            food_item,
            starting_temperature: parseFloat(starting_temperature),
            finishing_temperature: parseFloat(finishing_temperature),
          }),
        });

        const data = await res.json();

        setDeviceName("");
        setFoodItem("");
        setStartingTemperature("");
        setFinishingTemperature("");
        onSubmit();
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.2em",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
        <label style={{ fontWeight: 600, marginBottom: 2 }}>Device Name</label>
        <input
          type="text"
          value={device_name}
          onChange={(e) => setDeviceName(e.target.value)}
          required
          style={{
            border: "1.5px solid #e0e6ed",
            borderRadius: 8,
            padding: "0.7em",
            fontSize: "1.1em",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
        <label style={{ fontWeight: 600, marginBottom: 2 }}>Food Item</label>
        <input
          type="text"
          value={food_item}
          onChange={(e) => setFoodItem(e.target.value)}
          required
          style={{
            border: "1.5px solid #e0e6ed",
            borderRadius: 8,
            padding: "0.7em",
            fontSize: "1.1em",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
        <label style={{ fontWeight: 600, marginBottom: 2 }}>
          Starting Temperature (°C)
        </label>
        <input
          type="number"
          value={starting_temperature}
          onChange={(e) => setStartingTemperature(e.target.value)}
          required
          style={{
            border: "1.5px solid #e0e6ed",
            borderRadius: 8,
            padding: "0.7em",
            fontSize: "1.1em",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
        <label style={{ fontWeight: 600, marginBottom: 2 }}>
          Finishing Temperature (°C)
        </label>
        <input
          type="number"
          value={finishing_temperature}
          onChange={(e) => setFinishingTemperature(e.target.value)}
          required
          style={{
            border: "1.5px solid #e0e6ed",
            borderRadius: 8,
            padding: "0.7em",
            fontSize: "1.1em",
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "0.9em 0",
          fontWeight: 700,
          fontSize: "1.1em",
          marginTop: "0.5em",
          boxShadow: "0 2px 8px #2563eb22",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        Save Entry
      </button>

      
    </form>
  );
}

function OvenLogsTable({ logs }: { logs: any[] }) {
  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 4px 24px #0002",
        marginBottom: "2em",
        padding: "1.5em",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          marginTop: "1em",
          fontSize: "1.1em",
          boxShadow: "0 1px 4px #0001",
          background: "#fff",
          borderRadius: 12,
        }}
      >
        <thead>
          <tr style={{ background: "#f0f4f8", color: "#2a4d69" }}>
            <th style={{ padding: "12px 8px", borderTopLeftRadius: "8px" }}>
              Device
            </th>
            <th style={{ padding: "12px 8px" }}>Food Item</th>
            <th style={{ padding: "12px 8px" }}>Start Temp (°C)</th>
            <th style={{ padding: "12px 8px" }}>Finish Temp (°C)</th>
            <th style={{ padding: "12px 8px" }}>Status</th>
            <th style={{ padding: "12px 8px" }}>Recorded At</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log, idx) => {
            const isAlert = log.status === "ALERT";

            return (
              <tr
                key={log.id || idx}
                style={{
                  background: isAlert
                    ? "#fff0f0"
                    : idx % 2 === 0
                    ? "#f9fbfd"
                    : "#f3f6fa",
                  transition: "background 0.2s",
                  borderLeft: isAlert
                    ? "6px solid #e74c3c"
                    : "6px solid transparent",
                  fontWeight: isAlert ? 700 : 400,
                  boxShadow: isAlert ? "0 2px 8px #e74c3c22" : undefined,
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = isAlert
                    ? "#ffeaea"
                    : "#eaf3fa")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = isAlert
                    ? "#fff0f0"
                    : idx % 2 === 0
                    ? "#f9fbfd"
                    : "#f3f6fa")
                }
              >
                <td style={{ padding: "10px 8px" }}>{log.device_name}</td>
                <td style={{ padding: "10px 8px" }}>{log.food_item}</td>

                <td
                  style={{
                    padding: "10px 8px",
                    color:
                      Number(log.starting_temperature) < 75
                        ? "#e74c3c"
                        : "#2ecc71",
                    fontWeight: 600,
                  }}
                >
                  {log.starting_temperature}
                </td>

                <td
                  style={{
                    padding: "10px 8px",
                    color:
                      Number(log.finishing_temperature) < 75
                        ? "#e74c3c"
                        : "#2ecc71",
                    fontWeight: 600,
                  }}
                >
                  {log.finishing_temperature}
                </td>

                <td style={{ padding: "10px 8px" }}>
                  {isAlert ? (
                    <span
                      style={{
                        color: "#e74c3c",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span style={{ fontSize: "1.2em" }}>⚠️</span> ALERT
                    </span>
                  ) : (
                    <span style={{ color: "#2ecc71", fontWeight: 600 }}>
                      SAFE
                    </span>
                  )}
                </td>

                <td
                  style={{
                    padding: "10px 8px",
                    fontFamily: "monospace",
                    fontSize: "0.98em",
                  }}
                >
                  {log.recorded_at}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}