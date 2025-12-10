import { useState } from "react";
import PropTypes from "prop-types";

function ConfigMenu({
  actualDate,
  latitudeState,
  longitudeState,
  updateLocation,
  updateSelectedDate,
  updateActualDate,
}) {
  const [configOpen, setConfigOpen] = useState(false);
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formLat, setFormLat] = useState("");
  const [formLng, setFormLng] = useState("");

  // helpers to format actualDate (which may be dayjs) for inputs
  const dateForInput = (d) => {
    try {
      const dt = d && d.toDate ? d.toDate() : new Date(d);
      return dt.toISOString().slice(0, 10);
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  };

  const timeForInput = (d) => {
    try {
      const dt = d && d.toDate ? d.toDate() : new Date(d);
      return dt.toISOString().slice(11, 16);
    } catch (e) {
      return new Date().toISOString().slice(11, 16);
    }
  };

  const openConfig = () => {
    let useLat = latitudeState;
    let useLng = longitudeState;

    // Skip permissions check for simplicity in testing
    setFormDate(dateForInput(actualDate));
    setFormTime(timeForInput(actualDate));
    setFormLat(useLat);
    setFormLng(useLng);
    setConfigOpen(true);
  };

  const closeConfig = () => setConfigOpen(false);

  const toggleConfig = () => {
    if (configOpen) {
      closeConfig();
    } else {
      openConfig();
    }
  };

  const handleSave = () => {
    const iso = `${formDate}T${formTime}`;
    const newDate = new Date(iso);
    try {
      updateLocation({ lat: parseFloat(formLat), lng: parseFloat(formLng) });
    } catch (e) {
      console.warn("updateLocation failed", e);
    }
    try {
      updateSelectedDate(newDate);
    } catch (e) {}
    try {
      updateActualDate(newDate);
    } catch (e) {}
    setConfigOpen(false);
  };

  return (
    <>
      {/* Config button in top-right */}
      <button
        onClick={toggleConfig}
        title="Configuration"
        aria-label="Open configuration"
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 70,
          background: "rgba(0,0,0,0.75)",
          color: "white",
          border: "none",
          width: "56px",
          height: "56px",
          padding: 0,
          borderRadius: "50%",
          cursor: "pointer",
          fontSize: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        }}
      >
        ⚙
      </button>

      {/* Backdrop to close when clicking outside the modal */}
      {configOpen && (
        <div
          onClick={closeConfig}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 65,
            background: "transparent",
          }}
        />
      )}

      {/* Modal / dialog */}
      {configOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "52px",
            right: "12px",
            zIndex: 75,
            background: "rgba(0,0,0,0.85)",
            color: "white",
            padding: "12px",
            borderRadius: "8px",
            minWidth: "280px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ marginBottom: "8px", fontWeight: "600" }}>
            Configuration
          </div>
          <div style={{ marginBottom: "6px" }}>
            <label
              htmlFor="config-date"
              style={{ display: "block", fontSize: "12px" }}
            >
              Date
            </label>
            <input
              id="config-date"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ marginBottom: "6px" }}>
            <label
              htmlFor="config-time"
              style={{ display: "block", fontSize: "12px" }}
            >
              Time
            </label>
            <input
              id="config-time"
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
            <div style={{ flex: 1 }}>
              <label
                htmlFor="config-lat"
                style={{ display: "block", fontSize: "12px" }}
              >
                Latitude
              </label>
              <input
                id="config-lat"
                type="number"
                step="0.0001"
                value={formLat}
                onChange={(e) => setFormLat(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                htmlFor="config-lng"
                style={{ display: "block", fontSize: "12px" }}
              >
                Longitude
              </label>
              <input
                id="config-lng"
                type="number"
                step="0.0001"
                value={formLng}
                onChange={(e) => setFormLng(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
          >
            <button
              onClick={closeConfig}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                background: "#d21f1991",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "none",
                background: "#1976d2",
                color: "white",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
}

ConfigMenu.propTypes = {
  actualDate: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.instanceOf(Date),
  ]).isRequired,
  latitudeState: PropTypes.number.isRequired,
  longitudeState: PropTypes.number.isRequired,
  updateLocation: PropTypes.func.isRequired,
  updateSelectedDate: PropTypes.func.isRequired,
  updateActualDate: PropTypes.func.isRequired,
};

export default ConfigMenu;
