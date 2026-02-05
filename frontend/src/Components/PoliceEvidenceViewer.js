import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import "./PoliceEvidenceViewer.css"

const API = "http://127.0.0.1:5000/api";

// 🔍 Evidence Viewer (Image / Video from MongoDB GridFS)
function EvidenceViewer({ fileId }) {
  const url = `http://127.0.0.1:5000/api/evidence/${fileId}`;

  // Video detection
  if (url.includes("mp4") || url.includes("video")) {
    return (
      <video
        src={url}
        controls
        width="320"
        style={{ marginBottom: "15px", borderRadius: "10px" }}
      />
    );
  }

  // Image fallback
  return (
    <img
      src={url}
      alt="Crime Evidence"
      width="320"
      style={{ marginBottom: "15px", borderRadius: "10px" }}
    />
  );
}

export default function PoliceEvidenceViewer() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    axios.get(`${API}/police/reports`).then(res => setReports(res.data));
  }, []);

  const verify = async (status) => {
    await axios.post(`${API}/police/verify-report`, {
      report_id: selected._id,
      status,
      note,
      officer: localStorage.getItem("username")
    });
    alert(`Report ${status}`);
    window.location.reload();
  };

  return (
    <>
      <Navbar />
      <div className="police-panel">

        <div className="report-list">
          {reports.map(r => (
            <div key={r._id} onClick={() => setSelected(r)}>
              <b>{r.crime_type}</b> — {r.status}
            </div>
          ))}
        </div>

        {selected && (
          <div className="report-detail">
            <h2>{selected.crime_type}</h2>
            <p>{selected.description}</p>

            <h4>Evidences</h4>
            {selected.evidence_file_ids?.map(id => (
              <EvidenceViewer key={id} fileId={id} />
            ))}

            <textarea
              placeholder="Verification note"
              onChange={e => setNote(e.target.value)}
            />

            <button onClick={() => verify("verified")}>✅ Verify</button>
            <button onClick={() => verify("rejected")}>❌ Reject</button>
          </div>
        )}

      </div>
    </>
  );
}