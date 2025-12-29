import React, { forwardRef } from "react";
import "./CertificatePreview.css";

// forwardRef so html2canvas / jsPDF can capture this DOM node
const CertificatePreview = forwardRef(
  ({ participantName, eventTitle, date }, ref) => {
    return (
      <div ref={ref} className="cert-wrapper">
        <div className="cert-border">
          <div className="cert-header">
            <h2 className="cert-title">CERTIFICATE</h2>
            <span className="cert-subtitle">OF EXCELLENCE</span>
          </div>

          <p className="cert-line">THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>

          <div className="cert-name">{participantName}</div>

          <p className="cert-body">
            For active participation in{" "}
            <span className="cert-event">{eventTitle}</span> held on{" "}
            <span className="cert-event">{date}</span>.
          </p>

          <div className="cert-footer">
            <div className="cert-footer-col">
              <div className="cert-footer-line" />
              <span className="cert-footer-label">DATE</span>
            </div>
            <div className="cert-footer-col">
              <div className="cert-footer-line" />
              <span className="cert-footer-label">SIGNATURE</span>
            </div>
          </div>

          <div className="cert-badge">BEST AWARD</div>
        </div>
      </div>
    );
  }
);

export default CertificatePreview;
