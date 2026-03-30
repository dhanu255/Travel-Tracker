import { NavLink } from "react-router-dom";
import React from "react";

export default function Shell(props: { children: React.ReactNode }) {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div>
            <div className="brandName">Travel MetaSearch</div>
            <div className="brandTag">Compare and book across providers</div>
          </div>
        </div>

        <nav className="nav">
          <NavLink className={({ isActive }) => (isActive ? "navLink active" : "navLink")} to="/">
            Home
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "navLink active" : "navLink")} to="/booking">
            Booking
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "navLink active" : "navLink")} to="/places">
            Places Monitor
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "navLink active" : "navLink")} to="/tracking">
            Tracking
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "navLink active" : "navLink")} to="/history">
            History
          </NavLink>
        </nav>
      </header>

      <main className="main">{props.children}</main>
      <footer className="footer">
        <div>Demo meta-search + booking engine (mock providers)</div>
        <div className="muted">API base can be set via VITE_API_BASE</div>
      </footer>
    </div>
  );
}

