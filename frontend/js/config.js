(function () {
    "use strict";

    const isLocal = window.location.hostname === "localhost" ||
                    window.location.hostname === "127.0.0.1" ||
                    window.location.hostname.startsWith("192.168.") ||
                    window.location.hostname.startsWith("10.") ||
                    window.location.hostname.startsWith("172.");

    if (isLocal) {
        const port = window.location.port;
        if (port && port !== "3007" && (port === "5500" || port === "3000" || port === "5173" || port === "5501")) {
            window.API_BASE = window.location.protocol + "//" + window.location.hostname + ":3007";
        } else {
            window.API_BASE = window.location.origin;
        }
    } else {
        window.API_BASE = "https://tempdhas.onrender.com";
    }

    // ── Patient auth headers (reads dhas_token) ─────────────────
    // Pass { "Content-Type": "application/json" } in extraHeaders
    // for POST/PUT/PATCH requests that send JSON bodies, OR pass
    // json:true as a convenience shorthand.
    window.getAuthHeaders = function(extraHeaders = {}) {
        const token = localStorage.getItem("dhas_token");

        const headers = { ...extraHeaders };

        if (token) {
            headers["Authorization"] = "Bearer " + token;
        }

        return headers;
    };

    // ── JSON-body variant — always includes Content-Type ─────────
    // Use this for every fetch() that does JSON.stringify(body).
    window.getAuthHeadersJSON = function(extraHeaders = {}) {
        return window.getAuthHeaders({
            "Content-Type": "application/json",
            ...extraHeaders
        });
    };

    // ── Doctor auth headers (reads dhas_doctor_token) ────────────
    window.getDoctorAuthHeaders = function(extraHeaders = {}) {
        const token = localStorage.getItem("dhas_doctor_token");
        const headers = { ...extraHeaders };
        if (token) {
            headers["Authorization"] = "Bearer " + token;
        }
        return headers;
    };

    window.getDoctorAuthHeadersJSON = function(extraHeaders = {}) {
        return window.getDoctorAuthHeaders({
            "Content-Type": "application/json",
            ...extraHeaders
        });
    };

    // ── openChat(role, partnerId) — shared helper ─────────────────
    // Sets the role hint in sessionStorage so chat.js always opens
    // as the right side (patient vs doctor) and navigates to chat.html.
    // Called by dashboard.html, doctor_dashboard.html, my_doctors.html, etc.
    window.openChat = function(role, partnerId) {
        sessionStorage.setItem("dhas_chat_role", role || "patient");
        const url = partnerId
            ? "chat.html?partner=" + encodeURIComponent(partnerId)
            : "chat.html";
        window.location.href = url;
    };

})();

