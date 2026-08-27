"use client";

import { useState } from "react";

export function GraphEngineSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "1. Webhook Signal Ingestion",
      tag: "STEP 1",
      desc: "Razorpay webhooks stream payment events containing device signatures, hashed card tokens, IP subnets, and delivery addresses directly to Sentinel's passive listener.",
      detail: "Normalized into structured identity entities in sub-millisecond pipelines.",
    },
    {
      title: "2. Graph Construction & Linking",
      tag: "STEP 2",
      desc: "Entities form nodes in an in-memory graph. When two separate customer accounts share a payment instrument, device, or shipping address, a weighted edge is established.",
      detail: "Connected components and Louvain community detection isolate emerging abuse clusters.",
    },
    {
      title: "3. Case Dispatch & Explainable Evidence",
      tag: "STEP 3",
      desc: "Sentinel computes a ring-level risk score and automatically dispatches an organized investigation case with natural language summaries and full evidence trails.",
      detail: "Merchant fraud analysts review the visual graph and make the final decision.",
    },
  ];

  return (
    <section className="graph-engine-section" id="graph">
      <div className="section-container">
        <div className="section-header-centered">
          <span className="section-badge dark">GRAPH ARCHITECTURE</span>
          <h2 className="section-title text-white">
            How we build the abuse graph
          </h2>
          <p className="section-subtitle text-slate-300">
            From raw transaction webhooks to an interconnected fraud intelligence graph in milliseconds.
          </p>
        </div>

        {/* Step-by-Step Architecture */}
        <div className="graph-steps-container">
          <div className="graph-step-tabs">
            {steps.map((step, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`graph-tab-btn ${activeStep === idx ? "active" : ""}`}
              >
                <div className="tab-number">0{idx + 1}</div>
                <div className="tab-text">
                  <h4>{step.title}</h4>
                  <span className="tab-tag">{step.tag}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="graph-step-content">
            <div className="step-card-active">
              <div className="step-badge">{steps[activeStep].tag}</div>
              <h3>{steps[activeStep].title}</h3>
              <p className="step-desc">{steps[activeStep].desc}</p>
              <div className="step-detail-box">
                <span className="detail-icon">◈</span>
                <span>{steps[activeStep].detail}</span>
              </div>
            </div>

            {/* Clean, Non-Neon SVG Graph Diagram */}
            <div className="graph-schematic-visual">
              <div className="schematic-header">
                <span>GRAPH TOPOLOGY VIEW</span>
                <span className="live-status">PASSIVE INGESTION ACTIVE</span>
              </div>
              <div className="schematic-canvas">
                {/* Node cluster */}
                <div className="node-item account n1">
                  <span className="node-dot" />
                  <span className="node-name">User #912</span>
                </div>
                <div className="node-item device n2">
                  <span className="node-dot" />
                  <span className="node-name">Device_iOS_A48</span>
                </div>
                <div className="node-item account n3">
                  <span className="node-dot" />
                  <span className="node-name">User #441</span>
                </div>
                <div className="node-item card n4">
                  <span className="node-dot" />
                  <span className="node-name">Card_Visa_4911</span>
                </div>
                <div className="node-item promo n5">
                  <span className="node-dot" />
                  <span className="node-name">WELCOME50</span>
                </div>

                <svg className="schematic-svg" viewBox="0 0 400 240">
                  <line x1="80" y1="60" x2="200" y2="120" stroke="#3b574f" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="320" y1="60" x2="200" y2="120" stroke="#3b574f" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="200" y1="120" x2="100" y2="190" stroke="#3b574f" strokeWidth="1.5" />
                  <line x1="200" y1="120" x2="300" y2="190" stroke="#3b574f" strokeWidth="1.5" />
                  <line x1="100" y1="190" x2="300" y2="190" stroke="#854d48" strokeWidth="1.5" />
                </svg>

                <div className="schematic-footer-label">
                  <span className="risk-indicator">Shared Device & Card Cluster (Risk: 94/100)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
