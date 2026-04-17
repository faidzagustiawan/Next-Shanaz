"use client";

import { usePathname, useRouter } from "next/navigation";

const items = [
  { label: "Dashboard", icon: "📋", href: "/dashboard" },
  { label: "Profil Saya", icon: "👤", href: "/profil" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      style={{
        background: "#1a1916",
        padding: "1.5rem 0",
        position: "sticky",
        top: 58,
        height: "calc(100vh - 58px)",
        overflowY: "auto",
      }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: "#444",
            padding: "0 1.25rem",
            marginBottom: 6,
          }}
        >
          Menu
        </div>

        {items.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 1.25rem",
                cursor: "pointer",
                color: isActive ? "#f7f4ef" : "#888",
                fontSize: 13.5,
                transition: 'background .15s, color .15s, border-left .15s',
                borderTop: "none",
                borderRight: "none",
                borderBottom: "none",
                borderLeft: isActive
                  ? "2px solid #2a8f76"
                  : "2px solid transparent",
                background: isActive ? "rgba(255,255,255,.04)" : "none",
                width: "100%",
                textAlign: "left",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span
                style={{
                  width: 16,
                  textAlign: "center",
                  flexShrink: 0,
                  fontSize: 14,
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
