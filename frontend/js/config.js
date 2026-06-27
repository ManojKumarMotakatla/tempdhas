(function () {
    "use strict";

    window.API_BASE = "https://tempdhas.onrender.com";

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

