"use client";

import { useState } from "react";

export function GraphEngineSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "1. Signal Ingestion",
      tag: "WEBHOOK STREAM",
      desc: "Razorpay webhooks stream transaction events (`payment.captured`, `order.paid`) containing device signatures, hashed card tokens, IP ranges, and shipping destinations.",
      detail: "Normalized and parsed into distinct identity entities in sub-millisecond pipelines.",
    },
    {
      title: "2. Graph Construction & Linking",
      tag: "COMMUNITY DETECTION",
      desc: "Entities form nodes in an in-memory graph. When two separate customer accounts share a payment instrument or device, an edge is created with weighted confidence.",
      detail: "Connected components and Louvain clustering automatically isolate emerging abuse rings.",
    },
    {
      title: "3. Risk Scoring & Case Dispatch",
      tag: "INVESTIGATOR WORKSPACE",
      desc: "Sentinel computes a ring-level risk score based on promo usage density, velocity, and multi-account count, instantly generating an actionable case for your fraud analysts.",
      detail: "Includes full natural language explanations powered by LLM synthesis.",
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
            From raw transaction webhooks to a connected intelligence graph in milliseconds.
          </p>
        </div>

        {/* Interactive Step-by-Step Architecture */}
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

            {/* Interactive Graph Node Schematic Visual */}
            <div className="graph-schematic-visual">
              <div className="schematic-header">
                <span>SENTINEL IN-MEMORY GRAPH</span>
                <span className="live-status">● LIVE ENGINE</span>
              </div>
              <div className="schematic-canvas">
                {/* Node cluster */}
                <div className="node-item account n1">
                  <span className="node-icon">👤</span>
                  <span className="node-name">Acc #912</span>
                </div>
                <div className="node-item device n2">
                  <span className="node-icon">📱</span>
                  <span className="node-name">Device_Canvas_88</span>
                </div>
                <div className="node-item account n3">
                  <span className="node-icon">👤</span>
                  <span className="node-name">Acc #441</span>
                </div>
                <div className="node-item card n4">
                  <span className="node-icon">💳</span>
                  <span className="node-name">Card_4111_XX</span>
                </div>
                <div className="node-item promo n5">
                  <span className="node-icon">🏷️</span>
                  <span className="node-name">SAVE50</span>
                </div>

                <svg className="schematic-svg" viewBox="0 0 400 240">
                  <line x1="80" y1="60" x2="200" y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="320" y1="60" x2="200" y2="120" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="200" y1="120" x2="100" y2="190" stroke="#a855f7" strokeWidth="2" />
                  <line x1="200" y1="120" x2="300" y2="190" stroke="#f59e0b" strokeWidth="2" />
                  <line x1="100" y1="190" x2="300" y2="190" stroke="#ef4444" strokeWidth="2" />
                </svg>

                <div className="schematic-footer-label">
                  <span className="risk-indicator">High Risk Ring Cluster: 96/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
