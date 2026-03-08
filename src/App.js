import React, { useState } from "react";
import CCPChecks from "./pages/CCPChecks";
import HotFoodCheck from "./pages/HotFoodCheck";
import CCPLogs from "./pages/CCPLogs";

function App() {
  const [page, setPage] = useState("checks");

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", padding: "10px", backgroundColor: "#333" }}>
        <button onClick={() => setPage("checks")} style={{ padding: "8px 15px", cursor: "pointer" }}>CCP Checks</button>
        <button onClick={() => setPage("hotfood")} style={{ padding: "8px 15px", cursor: "pointer" }}>Hot Food Check</button>
        <button onClick={() => setPage("logs")} style={{ padding: "8px 15px", cursor: "pointer" }}>CCP Logs</button>
      </div>
      {page === "checks" && <CCPChecks />}
      {page === "hotfood" && <HotFoodCheck />}
      {page === "logs" && <CCPLogs />}
    </div>
  );
}

export default App;