import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiCalendar,
  FiUsers,
  FiFileText,
  FiTrash2,
  FiUpload,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiInfo,
  FiX,
  FiDownload,
  FiPlus,
  FiEdit,
  FiAward,
  FiMessageSquare,
  FiShare2,
  FiBox,
} from "react-icons/fi";
import "./WorkshopManagerDashboard.css";
import AdminLayout from "./AdminLayout";

const WorkshopManagerDashboard = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [supports, setSupports] = useState([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [viewMode, setViewMode] = useState(null); // 'attendees', 'supports', 'broadcast', 'create', 'edit'
  const [events, setEvents] = useState([]);
  const [workshopForm, setWorkshopForm] = useState({
    titre: "",
    description: "",
    date: "",
    salle: "",
    level: "beginner",
    price: 0,
    nb_places: 30,
    evenement_id: "",
    responsable_id: "",
  });
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const rawUser = localStorage.getItem("user");
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  const [animateurs, setAnimateurs] = useState([]);

  useEffect(() => {
    fetchMyWorkshops();
    fetchEvents();
    if (
      currentUser &&
      (currentUser.role === "SUPER_ADMIN" ||
        currentUser.role === "ORGANISATEUR")
    ) {
      fetchAnimateurs();
    }

    // Listen for workshop registration updates
    const handleRegistrationUpdate = (event) => {
      // If we have a selected workshop and the registration is for this workshop, refresh attendees
      if (
        selectedWorkshop &&
        event.detail &&
        event.detail.type === "Workshop" &&
        event.detail.title === selectedWorkshop.titre
      ) {
        fetchAttendees(selectedWorkshop.id);
        // Also refresh the workshops list to update registration counts
        fetchMyWorkshops();
      }
    };

    window.addEventListener("registration-updated", handleRegistrationUpdate);

    return () => {
      window.removeEventListener(
        "registration-updated",
        handleRegistrationUpdate
      );
    };
  }, [selectedWorkshop]);

  const fetchAnimateurs = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch ONLY RESP_WORKSHOP users as requested
      const response = await axios.get("/api/users/role/RESP_WORKSHOP", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnimateurs(response.data);
    } catch (error) {
      console.error("Error fetching animateurs:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get("/api/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchMyWorkshops = async () => {
    try {
      setLoading(true);
      console.log("Fetching workshops...");
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/events/my-workshops", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Received workshops:", response.data);
      setWorkshops(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching workshops:", error);
      console.error("Error response:", error.response?.data);
      setLoading(false);
    }
  };

  const fetchAttendees = async (workshopId) => {
    try {
      setAttendeesLoading(true);
      console.log(`Fetching attendees for workshop ${workshopId}...`);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/events/workshops/${workshopId}/registrations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(`Received ${response.data.length} attendees:`, response.data);
      setAttendees(response.data);
    } catch (error) {
      console.error("Error fetching attendees:", error);
      console.error("Error response:", error.response?.data);
    } finally {
      setAttendeesLoading(false);
    }
  };

  const fetchSupports = async (workshopId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `/api/events/workshops/${workshopId}/supports`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSupports(response.data);
    } catch (error) {
      console.error("Error fetching supports:", error);
    }
  };

  const handleOpenManage = (workshop, mode) => {
    setSelectedWorkshop(workshop);
    setViewMode(mode);
    // Clean previous states
    setAttendees([]);
    setSupports([]);

    if (mode === "attendees" || mode === "certificates")
      fetchAttendees(workshop.id);
    if (mode === "supports") fetchSupports(workshop.id);
    if (mode === "edit") {
      setWorkshopForm({
        titre: workshop.titre || "",
        description: workshop.description || "",
        date: workshop.date ? workshop.date.slice(0, 16) : "",
        salle: workshop.salle || "",
        level: workshop.level || "beginner",
        price: workshop.price || 0,
        nb_places: workshop.nb_places || 30,
        evenement_id: workshop.evenement_id || "",
        responsable_id: workshop.responsable_id || currentUser.id,
      });
    }
  };

  const handleOpenCreate = () => {
    setWorkshopForm({
      titre: "",
      description: "",
      date: "",
      salle: "",
      level: "beginner",
      price: 0,
      nb_places: 30,
      evenement_id: events.length > 0 ? events[0].id : "",
      responsable_id: currentUser.id,
    });
    setViewMode("create");
  };

  const handleCloseManage = () => {
    setSelectedWorkshop(null);
    setViewMode(null);
    setAttendees([]);
    setSupports([]);
    setWorkshopForm({
      titre: "",
      description: "",
      date: "",
      salle: "",
      level: "beginner",
      price: 0,
      nb_places: 30,
      evenement_id: "",
      responsable_id: currentUser.id,
    });
    setBroadcastMsg("");
    setIsBroadcasting(false);
  };

  const handleRemoveAttendee = async (participantId) => {
    if (!window.confirm("Are you sure you want to remove this attendee?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `/api/events/workshops/${selectedWorkshop.id}/participants/${participantId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAttendees(
        attendees.filter(
          (a) => Number(a.participant_id) !== Number(participantId)
        )
      );
      // Also refresh the workshops list to update registration counts
      fetchMyWorkshops();
    } catch (error) {
      console.error("Error removing attendee:", error);
      alert("Failed to remove attendee");
    }
  };

  const handleUploadSupport = async (e) => {
    e.preventDefault();
    const type = e.target.elements.type.value;
    const title = e.target.elements.title.value;
    const token = localStorage.getItem("token");

    if (type === "link") {
      const url = e.target.elements.url.value;
      try {
        await axios.post(
          `/api/events/workshops/${selectedWorkshop.id}/supports`,
          { type: "link", titre: title, url },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchSupports(selectedWorkshop.id);
        e.target.reset();
      } catch (error) {
        alert("Failed to add link");
      }
      return;
    }

    const formData = new FormData();
    const fileInput = e.target.elements.file;

    if (!fileInput.files[0]) return;

    formData.append("file", fileInput.files[0]);
    formData.append("type", type);
    formData.append("titre", title);

    try {
      await axios.post(
        `/api/events/workshops/${selectedWorkshop.id}/supports`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchSupports(selectedWorkshop.id);
      e.target.reset();
    } catch (error) {
      console.error("Error uploading support:", error);
      alert(error.response?.data?.message || "Upload failed. Max 20MB.");
    }
  };

  const handleDeleteSupport = async (supportId) => {
    if (!window.confirm("Delete this support file?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/events/workshops/supports/${supportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSupports(supports.filter((s) => s.id !== supportId));
    } catch (error) {
      console.error("Error deleting support:", error);
    }
  };

  const handleToggleRegistration = async (workshop) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/events/workshops/${workshop.id}`,
        { ouvert: !workshop.ouvert },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyWorkshops();
    } catch (error) {
      console.error("Error toggling registration:", error);
      alert("Failed to update status");
    }
  };

  const handlePresenceToggle = async (attendee) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/events/workshops/registrations/${attendee.inscription_id}/presence`,
        { presence: !attendee.presence },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendees(
        attendees.map((a) =>
          a.inscription_id === attendee.inscription_id
            ? { ...a, presence: !a.presence }
            : a
        )
      );
    } catch (error) {
      console.error("Error toggling presence:", error);
      // alert(error.response?.data?.message || "Error updating presence");
    }
  };

  const handleConfirmationToggle = async (attendee) => {
    const nextStatus =
      attendee.confirmation_status === "confirmed" ? "pending" : "confirmed";
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/events/workshops/registrations/${attendee.inscription_id}/confirmation`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttendees(
        attendees.map((a) =>
          a.inscription_id === attendee.inscription_id
            ? { ...a, confirmation_status: nextStatus }
            : a
        )
      );
    } catch (error) {
      console.error("Error toggling confirmation:", error);
    }
  };

  const handleCreateWorkshop = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/events/${workshopForm.evenement_id}/workshops`,
        {
          ...workshopForm,
          responsable_id: workshopForm.responsable_id || currentUser.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Workshop created successfully!");

      handleCloseManage();
      fetchMyWorkshops();
      // Notify Event Details page to refresh workshops
      window.dispatchEvent(
        new CustomEvent("workshop-created", {
          detail: { eventId: workshopForm.evenement_id },
        })
      );
    } catch (error) {
      console.error("Error creating workshop:", error);
      alert(error.response?.data?.message || "Failed to create workshop");
    }
  };

  const handleUpdateWorkshop = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/events/workshops/${selectedWorkshop.id}`,
        workshopForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Workshop updated successfully!");
      handleCloseManage();
      fetchMyWorkshops();
    } catch (error) {
      console.error("Error updating workshop:", error);
      alert(error.response?.data?.message || "Failed to update workshop");
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setIsBroadcasting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/messages/broadcast/workshop/${selectedWorkshop.id}`,
        {
          contenu: broadcastMsg,
          evenement_id: selectedWorkshop.evenement_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Message sent to all participants!");
      setBroadcastMsg("");
      setViewMode("attendees");
    } catch (error) {
      console.error("Error sending broadcast:", error);
      alert(error.response?.data?.message || "Failed to send broadcast");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleBatchGenerate = async () => {
    if (!attendees.length) return;

    // Filter only present attendees
    const presentAttendees = attendees.filter((a) => a.presence);
    if (presentAttendees.length === 0) {
      alert(
        "No attendees marked as present. detailed: Mark attendees as present to generate certificates."
      );
      return;
    }

    const userIds = presentAttendees.map((a) => a.participant_id);

    if (
      !window.confirm(
        `Generate certificates for ${userIds.length} present attendees?`
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/attestations/admin/batch/${selectedWorkshop.evenement_id}?force=true`,
        {
          userIds,
          types: ["workshop"],
          workshopId: selectedWorkshop.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Certificates generation started successfully!");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Generation failed";
      const reason = error.response?.data?.reason;
      alert(`Failed: ${msg} ${reason ? `(${reason})` : ""}`);
    }
  };

  const handleDownloadCertificate = async (workshop) => {
    // Legacy or single download if needed
    handleOpenManage(workshop, "certificates");
  };

  const exportToCSV = () => {
    if (!attendees.length) return;
    const headers = "Name,Email,Status,Presence\n";
    const rows = attendees
      .map(
        (a) =>
          `${a.nom} ${a.prenom},${a.email},${a.confirmation_status},${
            a.presence ? "Present" : "Absent"
          }`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute(
      "download",
      `attendees_${selectedWorkshop.titre.replace(/\s+/g, "_")}.csv`
    );
    a.click();
  };

  const totalPlaces = workshops.reduce(
    (sum, ws) => sum + (ws.nb_places || 0),
    0
  );
  const totalRegistered = workshops.reduce(
    (sum, ws) => sum + (ws.registered_count || 0),
    0
  );
  const occupancyRate =
    totalPlaces > 0 ? Math.round((totalRegistered / totalPlaces) * 100) : 0;

  if (loading)
    return (
      <div className="workshop-loading">
        <div className="spinner"></div>
        <p>Loading workshops...</p>
      </div>
    );

  return (
    <AdminLayout>
      <div className="workshop-manager-container">
        <header className="workshop-header">
          <div className="header-content">
            <h1>Workshop & Tutorials Manager</h1>
            <p>Create, manage, and track your event workshops</p>
          </div>
        </header>

        <div className="workshop-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FiBox />
            </div>
            <div className="stat-info">
              <h3>Total Workshops</h3>
              <p>{workshops.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FiUsers />
            </div>
            <div className="stat-info">
              <h3>Total Capacity</h3>
              <p>{totalPlaces}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FiCheckCircle />
            </div>
            <div className="stat-info">
              <h3>Occupancy</h3>
              <p>{occupancyRate}%</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${occupancyRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="workshop-content">
          {/* LIST SECTION */}
          <div className="workshop-list-section">
            <div className="section-header">
              <h2>My Workshops</h2>
              <button className="btn-add" onClick={handleOpenCreate}>
                <FiPlus /> New Workshop
              </button>
            </div>

            {workshops.length === 0 ? (
              <div className="no-workshops">
                <FiBox size={48} />
                <p>No workshops assigned yet.</p>
                <button className="btn-link" onClick={handleOpenCreate}>
                  Create your first workshop
                </button>
              </div>
            ) : (
              <div className="workshops-grid">
                {workshops.map((workshop) => (
                  <div key={workshop.id} className="workshop-card">
                    <div className="card-header">
                      <h3>{workshop.titre}</h3>
                      <span
                        className={`status-badge ${
                          workshop.ouvert ? "open" : "closed"
                        }`}
                      >
                        {workshop.ouvert ? "Open" : "Closed"}
                      </span>
                    </div>
                    <div className="card-body">
                      <p className="event-name">
                        <FiMapPin /> {workshop.event_titre}
                      </p>
                      <div className="card-meta">
                        <span>
                          <FiCalendar />{" "}
                          {workshop.date
                            ? new Date(workshop.date).toLocaleString()
                            : "TBD"}
                        </span>
                        <span>
                          <FiMapPin /> {workshop.salle || "TBD"}
                        </span>
                        <span>
                          <FiUsers /> {workshop.registered_count} /{" "}
                          {workshop.nb_places}
                        </span>
                      </div>
                      <div className="card-actions">
                        <button
                          onClick={() =>
                            handleOpenManage(workshop, "attendees")
                          }
                          className="btn-action"
                        >
                          <FiUsers /> Attendees
                        </button>
                        <button
                          onClick={() => handleOpenManage(workshop, "supports")}
                          className="btn-action"
                        >
                          <FiUpload /> Content
                        </button>
                        <button
                          onClick={() =>
                            handleOpenManage(workshop, "broadcast")
                          }
                          className="btn-action"
                        >
                          <FiMessageSquare /> Message
                        </button>
                        <button
                          onClick={() => handleOpenManage(workshop, "edit")}
                          className="btn-action btn-edit"
                        >
                          <FiEdit /> Edit
                        </button>
                        <button
                          onClick={() =>
                            handleOpenManage(workshop, "certificates")
                          }
                          className="btn-action btn-cert"
                          title="Manage Certificates"
                        >
                          <FiAward /> Cert
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MODAL OVERLAY */}
          {(viewMode === "create" ||
            viewMode === "edit" ||
            selectedWorkshop) && (
            <div className="modal-overlay">
              <div className="modal-content large-modal">
                <div className="modal-header">
                  <h2>
                    {viewMode === "create" && "Create New Workshop"}
                    {viewMode === "edit" && "Edit Workshop"}
                    {viewMode === "attendees" &&
                      `Manage Attendees: ${selectedWorkshop.titre}`}
                    {viewMode === "supports" &&
                      `Workshop Material: ${selectedWorkshop.titre}`}
                    {viewMode === "broadcast" &&
                      `Broadcast Message: ${selectedWorkshop.titre}`}
                    {viewMode === "certificates" &&
                      `Certifications: ${selectedWorkshop.titre}`}
                  </h2>
                  <button className="btn-close" onClick={handleCloseManage}>
                    <FiX />
                  </button>
                </div>

                <div className="modal-body">
                  {/* Attendees View */}
                  {viewMode === "attendees" && (
                    <div className="attendees-panel">
                      <div className="panel-actions">
                        <div className="panel-stats">
                          <span>
                            Registered:{" "}
                            <strong>
                              {selectedWorkshop.registered_count || 0}
                            </strong>{" "}
                            / {selectedWorkshop.nb_places}
                          </span>
                          <span className="waitlist-tag">
                            Waitlist: {selectedWorkshop.waitlist_count || 0}
                          </span>
                        </div>
                        <div className="panel-buttons">
                          <button
                            className="btn-outline btn-small"
                            onClick={exportToCSV}
                          >
                            <FiDownload /> Export CSV
                          </button>
                          <button
                            className="btn-primary btn-small"
                            onClick={() => setViewMode("broadcast")}
                          >
                            <FiMessageSquare /> Message All
                          </button>
                        </div>
                      </div>
                      <div className="attendees-list">
                        {attendeesLoading ? (
                          <div className="loading-indicator">
                            <div className="spinner-small"></div>
                            <p>Updating attendees list...</p>
                          </div>
                        ) : attendees.length === 0 ? (
                          <p className="empty-msg">
                            No one has registered for this workshop yet.
                          </p>
                        ) : (
                          <table>
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Presence</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attendees.map((att) => (
                                <tr key={att.participant_id}>
                                  <td>
                                    {att.nom} {att.prenom}
                                  </td>
                                  <td className="dimmed">{att.email}</td>
                                  <td>
                                    <button
                                      className={`status-pill ${att.confirmation_status}`}
                                      onClick={() =>
                                        handleConfirmationToggle(att)
                                      }
                                    >
                                      {att.confirmation_status}
                                    </button>
                                  </td>
                                  <td>
                                    <div
                                      className="presence-check"
                                      onClick={() => handlePresenceToggle(att)}
                                    >
                                      {att.presence ? (
                                        <FiCheckCircle className="checked" />
                                      ) : (
                                        <div className="unchecked" />
                                      )}
                                      <span>Present</span>
                                    </div>
                                  </td>
                                  <td>
                                    <button
                                      className="btn-danger-icon"
                                      onClick={() =>
                                        handleRemoveAttendee(att.participant_id)
                                      }
                                    >
                                      <FiTrash2 />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Supports View */}
                  {viewMode === "supports" && (
                    <div className="supports-panel">
                      <form
                        onSubmit={handleUploadSupport}
                        className="upload-box modern-upload-box"
                      >
                        <div className="upload-header">
                          <div className="icon-wrapper">
                            <FiUpload />
                          </div>
                          <div>
                            <h4>Add New Resource</h4>
                            <p>
                              Share documents, slides, or links with attendees
                            </p>
                          </div>
                        </div>

                        <div className="upload-grid">
                          <div className="form-group-v3">
                            <label>Resource Title</label>
                            <input
                              type="text"
                              name="title"
                              placeholder="e.g. Workshop Slides v1"
                              required
                              className="modern-input"
                            />
                          </div>

                          <div className="form-group-v3">
                            <label>Type</label>
                            <select
                              name="type"
                              className="modern-select"
                              onChange={(e) => {
                                const fileGroup =
                                  document.getElementById("file-input-group");
                                const urlGroup =
                                  document.getElementById("url-input-group");
                                if (e.target.value === "link") {
                                  fileGroup.style.display = "none";
                                  urlGroup.style.display = "block";
                                } else {
                                  fileGroup.style.display = "block";
                                  urlGroup.style.display = "none";
                                }
                              }}
                            >
                              <option value="pdf">PDF Document</option>
                              <option value="ppt">PowerPoint (PPT)</option>
                              <option value="zip">Source Code (ZIP)</option>
                              <option value="link">External Link</option>
                            </select>
                          </div>
                        </div>

                        <div
                          className="upload-grid"
                          style={{ marginTop: "1rem" }}
                        >
                          <div
                            className="form-group-v3 full-width"
                            id="file-input-group"
                          >
                            <label>File Upload (Max 20MB)</label>
                            <div className="file-drop-area">
                              <input type="file" name="file" id="file" />
                              <label htmlFor="file" className="file-drop-label">
                                <span className="upload-icon">
                                  <FiUpload />
                                </span>
                                <span className="upload-text">
                                  Click to browse or drag file here
                                </span>
                              </label>
                            </div>
                          </div>
                          <div
                            className="form-group-v3 full-width"
                            id="url-input-group"
                            style={{ display: "none" }}
                          >
                            <label>External URL</label>
                            <div className="input-with-icon">
                              <FiShare2 className="input-icon" />
                              <input
                                type="url"
                                name="url"
                                placeholder="https://example.com/resource"
                                className="modern-input pl-icon"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="upload-actions">
                          <button
                            type="submit"
                            className="btn-primary btn-upload"
                          >
                            <FiPlus /> Add to Resources
                          </button>
                        </div>
                      </form>

                      <div className="materials-list">
                        <h4>Shared Resources</h4>
                        {supports.length === 0 ? (
                          <p className="empty-msg">
                            No materials uploaded yet.
                          </p>
                        ) : (
                          <div className="materials-grid">
                            {supports.map((sup) => (
                              <div key={sup.id} className="material-item">
                                {sup.type === "link" ? (
                                  <FiShare2 className="doc-icon link" />
                                ) : sup.type === "zip" ? (
                                  <FiBox className="doc-icon zip" />
                                ) : (
                                  <FiFileText className="doc-icon" />
                                )}
                                <div className="doc-info">
                                  <a
                                    href={
                                      sup.type === "link"
                                        ? sup.url
                                        : `http://localhost:5000/${sup.url}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {sup.titre}
                                  </a>
                                  <span>{sup.type.toUpperCase()} Support</span>
                                </div>
                                <button
                                  className="btn-danger-icon"
                                  onClick={() => handleDeleteSupport(sup.id)}
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Broadcast View */}
                  {viewMode === "broadcast" && (
                    <div className="broadcast-panel">
                      <form onSubmit={handleSendBroadcast}>
                        <div className="form-group">
                          <label>Your Message</label>
                          <textarea
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                            placeholder="Type your message to all attendees..."
                            rows="6"
                            required
                            className="broadcast-textarea"
                          />
                        </div>
                        <div
                          className="panel-buttons"
                          style={{ marginTop: "1rem" }}
                        >
                          <button
                            type="submit"
                            className="btn-primary"
                            disabled={isBroadcasting}
                          >
                            {isBroadcasting ? "Sending..." : "Send Broadcast"}
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setViewMode("attendees")}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Certificates View */}
                  {viewMode === "certificates" && (
                    <div className="certificates-panel">
                      <div
                        className="panel-actions"
                        style={{
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "1rem",
                          padding: "1.5rem",
                          background: "#f8f9fa",
                          borderRadius: "12px",
                          border: "1px solid #e9ecef",
                        }}
                      >
                        <div>
                          <h4
                            style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}
                          >
                            <FiAward /> Workshop Certification
                          </h4>
                          <p style={{ margin: 0, color: "#6c757d" }}>
                            Generate official certificates for all participants
                            who have completed this workshop. Only participants
                            marked as <strong>Present</strong> will receive a
                            certificate. Ensure the workshop date has passed.
                          </p>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <div
                            className="stat-badge"
                            style={{
                              background: "#e3f2fd",
                              color: "#0d47a1",
                              padding: "0.5rem 1rem",
                              borderRadius: "8px",
                              fontWeight: "bold",
                            }}
                          >
                            Eligible (Present):{" "}
                            {attendees.filter((a) => a.presence).length} /{" "}
                            {attendees.length}
                          </div>
                          <button
                            className="btn-primary"
                            onClick={handleBatchGenerate}
                            disabled={
                              attendees.filter((a) => a.presence).length === 0
                            }
                          >
                            <FiAward /> Generate All Certificates
                          </button>
                        </div>
                      </div>

                      <div
                        className="attendees-list"
                        style={{ marginTop: "1.5rem" }}
                      >
                        <h3>Participant Status</h3>
                        {attendees.length === 0 ? (
                          <p className="empty-msg">No attendees found.</p>
                        ) : (
                          <table>
                            <thead>
                              <tr>
                                <th>Participant</th>
                                <th>Email</th>
                                <th>Presence</th>
                                <th>Eligibility</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attendees.map((att) => (
                                <tr key={att.participant_id}>
                                  <td>
                                    {att.nom} {att.prenom}
                                  </td>
                                  <td className="dimmed">{att.email}</td>
                                  <td>
                                    {att.presence ? (
                                      <span className="status-badge open">
                                        Present
                                      </span>
                                    ) : (
                                      <span className="status-badge closed">
                                        Absent
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {att.presence ? (
                                      <span
                                        style={{
                                          color: "green",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        Eligible
                                      </span>
                                    ) : (
                                      <span style={{ color: "#aaa" }}>
                                        Not Eligible
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Create/Edit View */}
                  {(viewMode === "create" || viewMode === "edit") && (
                    <form
                      onSubmit={
                        viewMode === "create"
                          ? handleCreateWorkshop
                          : handleUpdateWorkshop
                      }
                    >
                      <div className="form-group">
                        <label>Event</label>
                        <select
                          value={workshopForm.evenement_id}
                          onChange={(e) =>
                            setWorkshopForm({
                              ...workshopForm,
                              evenement_id: e.target.value,
                            })
                          }
                          required
                          disabled={viewMode === "edit"}
                        >
                          <option value="">Select an Event</option>
                          {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                              {ev.name || ev.titre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Animateur Selection */}
                      {currentUser &&
                        (currentUser.role === "SUPER_ADMIN" ||
                          currentUser.role === "ORGANISATEUR") && (
                          <div className="form-group">
                            <label>Assign Animateur (Responsible)</label>
                            <select
                              value={workshopForm.responsable_id}
                              onChange={(e) =>
                                setWorkshopForm({
                                  ...workshopForm,
                                  responsable_id: e.target.value,
                                })
                              }
                              required
                            >
                              <option value={currentUser.id}>
                                Me ({currentUser.role})
                              </option>
                              {animateurs.map((anim) => (
                                <option key={anim.id} value={anim.id}>
                                  {anim.nom} {anim.prenom} (
                                  {anim.institution || anim.role})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          value={workshopForm.titre}
                          onChange={(e) =>
                            setWorkshopForm({
                              ...workshopForm,
                              titre: e.target.value,
                            })
                          }
                          placeholder="Workshop Title"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          value={workshopForm.description}
                          onChange={(e) =>
                            setWorkshopForm({
                              ...workshopForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Description..."
                          rows="3"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Date & Time</label>
                          <input
                            type="datetime-local"
                            value={workshopForm.date}
                            onChange={(e) =>
                              setWorkshopForm({
                                ...workshopForm,
                                date: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Room / Location</label>
                          <input
                            type="text"
                            value={workshopForm.salle}
                            onChange={(e) =>
                              setWorkshopForm({
                                ...workshopForm,
                                salle: e.target.value,
                              })
                            }
                            placeholder="Hall B, Room 102..."
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Level</label>
                          <select
                            value={workshopForm.level}
                            onChange={(e) =>
                              setWorkshopForm({
                                ...workshopForm,
                                level: e.target.value,
                              })
                            }
                          >
                            <option value="beginner">Beginner</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Price ($)</label>
                          <input
                            type="number"
                            value={workshopForm.price}
                            onChange={(e) =>
                              setWorkshopForm({
                                ...workshopForm,
                                price: e.target.value,
                              })
                            }
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Capacity</label>
                        <input
                          type="number"
                          value={workshopForm.nb_places}
                          onChange={(e) =>
                            setWorkshopForm({
                              ...workshopForm,
                              nb_places: e.target.value,
                            })
                          }
                          min="1"
                          required
                        />
                      </div>

                      <div className="modal-actions-footer">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={handleCloseManage}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                          {viewMode === "create"
                            ? "Create Workshop"
                            : "Update Workshop"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default WorkshopManagerDashboard;
