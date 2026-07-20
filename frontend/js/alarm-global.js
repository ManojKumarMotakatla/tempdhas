/**
 * alarm-global.js — DHAS Global Alarm Engine
 *
 * Lightweight script that runs the medicine-reminder alarm engine
 * on EVERY page (dashboard, chat, profile, steps, diet, …).
 *
 * It injects the alarm-card UI, loads reminders from the server,
 * and fires alarm sounds + cards whenever a scheduled time arrives —
 * regardless of which page the user is currently on.
 *
 * Pages that already include reminder.js (reminder.html) should NOT
 * include this script — reminder.js already contains this engine.
 */
(function () {
    "use strict";

    // ── Guard: skip if the full reminder.js is already loaded ──────
    if (window.__DHAS_ALARM_ENGINE_LOADED__) return;
    window.__DHAS_ALARM_ENGINE_LOADED__ = true;

    // ── Inject tabler icons if not already present ────────────────
    function ensureTablerIcons() {
        if (document.querySelector('link[href*="tabler-icons"]')) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css";
        document.head.appendChild(link);
    }

    // ── Config ────────────────────────────────────────────────────
    const API = (window.API_BASE || "http://localhost:3007") + "/reminders";

    // ── Helpers ───────────────────────────────────────────────────
    function getUserId() {
        const flatKeys = ["user_id", "userId", "uid", "dhas_user_id", "dhas_userId", "id", "user"];
        for (const store of [localStorage, sessionStorage]) {
            for (const key of flatKeys) {
                const val = store.getItem(key);
                if (val && val !== "null" && val !== "undefined") {
                    if (!val.startsWith("{") && !val.startsWith("[")) return val;
                }
            }
            const jsonKeys = ["user", "dhas_user", "currentUser", "loggedInUser", "profile"];
            for (const key of jsonKeys) {
                const raw = store.getItem(key);
                if (!raw) continue;
                try {
                    const obj = JSON.parse(raw);
                    const id = obj.user_id || obj.userId || obj.uid || obj.id;
                    if (id) return String(id);
                } catch { /* not JSON */ }
            }
        }
        return null;
    }

    function normalizeReminder(r) {
        return {
            ...r,
            doseCount: String(r.doseCount || r.dose_count || 1),
            times: (r.times || []).map(t => ({
                ...t,
                h:    String(t.h    || "8"),
                m:    String(t.m    || "00"),
                ampm: String(t.ampm || "AM"),
                display: t.display || `${t.h}:${String(t.m).padStart(2, "0")} ${t.ampm}`
            })),
            days:     Array.isArray(r.days) ? r.days.map(Number) : [],
            monthDay: parseInt(r.monthDay || r.month_day || 1),
            duration: String(r.duration || "forever"),
            sound:    r.sound || "bell",
            sched:    r.sched || "daily",
        };
    }

    // ── Inject UI styles ──────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById("dhasGlobalAlarmStyle")) return;
        const style = document.createElement("style");
        style.id = "dhasGlobalAlarmStyle";
        style.textContent = `
            #dhasGlobalAlarmContainer {
                position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
                z-index: 999999; display: flex; flex-direction: column;
                gap: 10px; max-width: 360px; width: 92%;
                pointer-events: none;
            }
            #dhasGlobalAlarmContainer > * { pointer-events: all; }
            .dhas-alarm-card {
                background: linear-gradient(135deg, #1a56db, #0ea5e9); color: #fff;
                border-radius: 16px; padding: 16px 20px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.28);
                animation: dhasAlarmSlideIn 0.35s ease;
            }
            @keyframes dhasAlarmSlideIn {
                from { opacity: 0; transform: translateY(-14px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            .dhas-alarm-title {
                display: flex; align-items: center; gap: 8px;
                font-size: 1rem; font-weight: 700; margin-bottom: 3px;
                font-family: 'DM Sans', sans-serif;
            }
            .dhas-alarm-title i { font-size: 18px; }
            .dhas-alarm-med {
                font-size: 1rem; font-weight: 700;
                display: flex; align-items: center; gap: 6px; margin-bottom: 3px;
                font-family: 'DM Sans', sans-serif;
            }
            .dhas-alarm-sub {
                font-size: 0.82rem; opacity: 0.85; margin-bottom: 10px;
                font-family: 'DM Sans', sans-serif;
            }
            .dhas-alarm-actions { display: flex; gap: 8px; }
            .dhas-alarm-snooze {
                background: rgba(255,255,255,0.2);
                border: 1.5px solid rgba(255,255,255,0.4);
                color: #fff; padding: 6px 12px; border-radius: 8px;
                cursor: pointer; font-weight: 700; flex: 1; font-size: 0.78rem;
                display: flex; align-items: center; justify-content: center;
                gap: 5px; font-family: 'DM Sans', sans-serif;
            }
            .dhas-alarm-dismiss {
                background: #fff; border: none; color: #1a56db;
                padding: 6px 12px; border-radius: 8px; cursor: pointer;
                font-weight: 700; flex: 1; display: flex;
                align-items: center; justify-content: center;
                gap: 5px; font-size: 0.78rem; font-family: 'DM Sans', sans-serif;
            }
        `;
        document.head.appendChild(style);
    }

    // ── Inject alarm container ────────────────────────────────────
    function injectContainer() {
        if (document.getElementById("dhasGlobalAlarmContainer")) return;
        const container = document.createElement("div");
        container.id = "dhasGlobalAlarmContainer";
        container.setAttribute("aria-live", "assertive");
        container.setAttribute("aria-label", "Medicine reminders");
        document.body.appendChild(container);
    }

    // ── Audio engine ──────────────────────────────────────────────
    let audioCtx = null;
    function getAudioCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    }
    function warmAudio() {
        try { const ctx = getAudioCtx(); if (ctx.state === "suspended") ctx.resume(); } catch (e) {}
    }
    ["click", "touchstart", "keydown", "pointerdown"].forEach(ev =>
        document.addEventListener(ev, warmAudio, { passive: true })
    );

    function playTone(ctx, notes, type) {
        notes.forEach(({ freq, dur, delay, gain }) => {
            const osc = ctx.createOscillator(), gn = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gn.gain.setValueAtTime(0, ctx.currentTime + delay);
            gn.gain.linearRampToValueAtTime(gain, ctx.currentTime + delay + 0.02);
            gn.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
            osc.connect(gn); gn.connect(ctx.destination);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + dur + 0.05);
        });
    }

    const SOUNDS = {
        bell:   { play(ctx) { playTone(ctx, [{ freq: 880, dur: 0.3, delay: 0, gain: 0.6 }, { freq: 660, dur: 0.3, delay: 0.35, gain: 0.5 }, { freq: 880, dur: 0.5, delay: 0.7, gain: 0.7 }], "sine"); } },
        chime:  { play(ctx) { [523, 659, 784, 1047, 784, 659, 523].forEach((f, i) => playTone(ctx, [{ freq: f, dur: 0.25, delay: i * 0.18, gain: 0.45 }], "sine")); } },
        beep:   { play(ctx) { [0, 0.35, 0.7].forEach(d => playTone(ctx, [{ freq: 1000, dur: 0.2, delay: d, gain: 0.5 }], "square")); } },
        gentle: { play(ctx) { playTone(ctx, [{ freq: 440, dur: 0.8, delay: 0, gain: 0.3 }, { freq: 550, dur: 0.8, delay: 0.5, gain: 0.25 }, { freq: 440, dur: 0.8, delay: 1.0, gain: 0.2 }], "sine"); } },
        alarm:  { play(ctx) { for (let i = 0; i < 6; i++) playTone(ctx, [{ freq: i % 2 === 0 ? 880 : 660, dur: 0.18, delay: i * 0.2, gain: 0.6 }], "sawtooth"); } }
    };

    async function playSound(soundKey) {
        const s = SOUNDS[soundKey] || SOUNDS.bell;
        try {
            const ctx = getAudioCtx();
            if (ctx.state === "suspended") await ctx.resume();
            s.play(ctx);
        } catch (e) { console.warn("[DHAS Alarm] Audio:", e); }
    }

    // ── Snooze ────────────────────────────────────────────────────
    const snoozeTimers = {};
    function snoozeAlarm(reminderId, soundKey, cardEl) {
        cardEl.remove();
        if (snoozeTimers[reminderId]) clearTimeout(snoozeTimers[reminderId]);
        snoozeTimers[reminderId] = setTimeout(() => {
            const r = remindersCache.find(x => x.id === reminderId);
            const t = r?.times?.[0] || { label: "Reminder", display: "" };
            playSound(soundKey);
            showAlarmCard(r || { id: reminderId, medicine: "Medicine", sound: soundKey }, t);
            delete snoozeTimers[reminderId];
        }, 10 * 60 * 1000);
    }

    // ── Alarm card UI ─────────────────────────────────────────────
    function showAlarmCard(reminder, timeSlot) {
        // Ensure container exists (in case body wasn't ready earlier)
        injectContainer();
        const container = document.getElementById("dhasGlobalAlarmContainer");
        if (!container) return;

        const rid    = reminder.id;
        const sound  = reminder.sound || "bell";
        const cardId = `dhasAlarmCard_${rid}_${(timeSlot.label || "dose").replace(/\s+/g, "_")}`;

        if (document.getElementById(cardId)) return; // already shown

        const card = document.createElement("div");
        card.className = "dhas-alarm-card";
        card.id = cardId;
        card.innerHTML = `
            <div class="dhas-alarm-title">
                <i class="ti ti-bell-ringing" aria-hidden="true"></i>
                Medicine Time!
            </div>
            <div class="dhas-alarm-med">
                <i class="ti ti-pill" style="font-size:15px" aria-hidden="true"></i>
                ${reminder.medicine}
            </div>
            <div class="dhas-alarm-sub">${timeSlot.label}: ${timeSlot.display || "—"}</div>
            <div class="dhas-alarm-actions">
                <button class="dhas-alarm-snooze" id="snoozeBtn_${cardId}">
                    <i class="ti ti-player-pause" style="font-size:13px" aria-hidden="true"></i>
                    Snooze 10 min
                </button>
                <button class="dhas-alarm-dismiss" onclick="document.getElementById('${cardId}').remove()">
                    <i class="ti ti-check" style="font-size:13px" aria-hidden="true"></i>
                    Dismiss
                </button>
            </div>`;

        container.appendChild(card);

        document.getElementById(`snoozeBtn_${cardId}`)?.addEventListener("click", () => {
            snoozeAlarm(rid, sound, card);
        });

        // Auto-dismiss after 40 seconds
        setTimeout(() => { if (card.parentNode) card.remove(); }, 40000);
    }

    // ── Schedule helpers ──────────────────────────────────────────
    function shouldFireToday(r, dow, dom) {
        if (dow === undefined) { const n = new Date(); dow = n.getDay(); dom = n.getDate(); }
        const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0);
        if (r.startDate) {
            const start = new Date(r.startDate + "T00:00:00");
            if (todayMidnight < start) return false;
        }
        if (r.duration && r.duration !== "forever") {
            const base = r.startDate ? new Date(r.startDate + "T00:00:00") : new Date(r.createdAt);
            base.setHours(0, 0, 0, 0);
            if (Math.floor((todayMidnight - base) / 86400000) >= parseInt(r.duration)) return false;
        }
        switch (r.sched) {
            case "daily":      return true;
            case "alternate": {
                if (!r.altBase) return true;
                const base = new Date(r.altBase);
                const today = new Date(); today.setHours(0, 0, 0, 0);
                const bDay = new Date(base.getFullYear(), base.getMonth(), base.getDate());
                return Math.round((today - bDay) / 86400000) % 2 === 0;
            }
            case "weekly": case "twice_week": case "three_week": case "custom":
                return (r.days || []).map(Number).includes(dow);
            case "monthly": return dom === (parseInt(r.monthDay) || 1);
            default: return false;
        }
    }

    function to24(h, m, ampm) {
        let hour = parseInt(h, 10);
        if (ampm === "PM" && hour !== 12) hour += 12;
        if (ampm === "AM" && hour === 12) hour = 0;
        return [hour, parseInt(m, 10)];
    }

    // ── Alarm check ───────────────────────────────────────────────
    let remindersCache = [];

    function checkAlarms() {
        if (!remindersCache.length) return;
        const now = new Date();
        const dow = now.getDay(), dom = now.getDate();
        const hh  = now.getHours(), mm = now.getMinutes();

        remindersCache.forEach(r => {
            if (!shouldFireToday(r, dow, dom)) return;
            (r.times || []).forEach(t => {
                const [alarmH, alarmM] = to24(t.h, t.m, t.ampm);
                if (isNaN(alarmH) || isNaN(alarmM)) return;

                let diff = (hh * 60 + mm) - (alarmH * 60 + alarmM);
                if (diff < 0) diff += 1440;
                if (diff > 4) return; // only fire within 4-minute window

                // Deduplicate across tabs with localStorage
                const key = `fired_${r.id}_${t.label}_${alarmH}_${alarmM}`;
                const lastFired = localStorage.getItem(key);
                if (lastFired && (Date.now() - parseInt(lastFired, 10)) < 5 * 60 * 1000) return;
                localStorage.setItem(key, Date.now().toString());

                // Fire!
                playSound(r.sound || "bell");
                showAlarmCard(r, t);

                // Browser notification (if permission granted)
                if (Notification.permission === "granted") {
                    navigator.serviceWorker?.ready.then(reg =>
                        reg.showNotification(r.medicine, {
                            body: `${t.label}: ${t.display}\n${r.scheduleLabel || ""}`,
                            icon:  "/favicon.ico",
                            badge: "/favicon.ico",
                            vibrate: [300, 100, 300],
                            requireInteraction: true,
                            tag: `dhas-${r.id}-${t.label}`
                        })
                    ).catch(() => {});
                }
            });
        });
    }

    // ── Alarm ticker ──────────────────────────────────────────────
    function startAlarmTicker() {
        // Immediate check on load
        setTimeout(checkAlarms, 500);
        // Align to the start of every minute
        const now = new Date();
        const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 200;
        setTimeout(() => {
            checkAlarms();
            setInterval(checkAlarms, 60 * 1000);
        }, msUntilNextMinute);
    }

    // ── Service worker ────────────────────────────────────────────
    async function registerSW() {
        if (!("serviceWorker" in navigator)) return;
        try {
            await navigator.serviceWorker.register("/sw.js");
            navigator.serviceWorker.addEventListener("message", e => {
                if (e.data && e.data.type === "WAKE_CHECK") checkAlarms();
            });
        } catch (err) { console.warn("[DHAS Alarm] SW failed:", err); }
    }

    function syncWithSW() {
        if (navigator.serviceWorker?.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: "DHAS_SET_REMINDERS",
                reminders: remindersCache
            });
        }
    }

    // ── Load reminders from server ────────────────────────────────
    async function loadReminders() {
        const uid = getUserId();
        if (!uid) return;
        // Ensure getAuthHeaders is available (requires config.js to be loaded first)
        const getHeaders = window.getAuthHeaders || (() => ({}));
        try {
            const res  = await fetch(`${API}/get/${uid}`, { headers: getHeaders() });
            const data = await res.json();
            if (data.success) {
                remindersCache = (data.data || []).map(normalizeReminder);
                syncWithSW();
            }
        } catch (err) {
            console.warn("[DHAS Alarm] Could not load reminders:", err);
        }
    }

    // ── Boot ──────────────────────────────────────────────────────
    async function boot() {
        ensureTablerIcons();
        injectStyles();
        injectContainer();
        if ("Notification" in window) Notification.requestPermission();
        registerSW();
        await loadReminders();
        startAlarmTicker();
    }

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }

})();
