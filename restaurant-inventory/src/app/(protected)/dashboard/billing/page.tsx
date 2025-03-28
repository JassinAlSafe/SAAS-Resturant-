"use client";

import React from "react";

export default function CheckoutPage() {
  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Billing Plans</h1>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "30px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>
          Standard Plan
        </h2>
        <p style={{ color: "#4b5563", marginBottom: "10px" }}>
          Perfect for small restaurants just getting started
        </p>
        <div
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
        >
          200,00 kr/month
        </div>

        <ul style={{ paddingLeft: "20px", marginBottom: "20px" }}>
          <li style={{ marginBottom: "8px" }}>✓ Up to 500 inventory items</li>
          <li style={{ marginBottom: "8px" }}>✓ Basic reporting</li>
          <li style={{ marginBottom: "8px" }}>✓ 1 user account</li>
          <li style={{ marginBottom: "8px" }}>✓ Email support</li>
        </ul>

        <a
          href="https://checkout.stripe.com/c/pay/cs_test_a13CXFD126kZATRDVmNBqiJJkxD0UUJfgBb1w9gJjfbOuGuAZcQEk7nkGt"
          style={{
            display: "block",
            backgroundColor: "#f97316",
            color: "white",
            padding: "12px 16px",
            borderRadius: "9999px",
            textAlign: "center",
            fontWeight: "bold",
            cursor: "pointer",
            textDecoration: "none",
            marginBottom: "12px",
          }}
        >
          Subscribe Now
        </a>

        <a
          href="https://checkout.stripe.com/c/pay/cs_test_a13CXFD126kZATRDVmNBqiJJkxD0UUJfgBb1w9gJjfbOuGuAZcQEk7nkGt"
          style={{
            display: "block",
            border: "1px solid #d1d5db",
            color: "#4b5563",
            padding: "12px 16px",
            borderRadius: "9999px",
            textAlign: "center",
            fontWeight: "bold",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Checkout with Stripe
        </a>
      </div>

      <div
        style={{
          marginTop: "20px",
          textAlign: "center",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        <p>
          Additional plans for growing restaurants and enterprise customers
          coming soon.
        </p>
        <p style={{ marginTop: "10px" }}>
          Need a custom plan?{" "}
          <a href="mailto:sales@yourcompany.com" style={{ color: "#f97316" }}>
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
