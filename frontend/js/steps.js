// ============================================================
// DHAS — Activity Tracker (steps.js) — v3
//
// FIX (this version) — "zero steps ever counted":
//   The step-detection math was fine. The real problem is almost
//   always that devicemotion/Accelerometer events never arrive in
//   the first place, and the old code had no way to tell you that.
//   Root causes, most common first:
//
//   1. INSECURE CONTEXT — DeviceMotionEvent and the Generic Sensor
//      API are ONLY delivered on https:// or http://localhost.
//      Testing on a phone via http://192.168.x.x:3007 (a plain LAN
//      IP) silently gets NO events at all — no error, no
//      permission prompt, nothing. This is the #1 cause.
//   2. iOS permission requested but not truly granted (result
//      wasn't inspected carefully).
//   3. No "watchdog" — old code couldn't distinguish "attached and
//      just no steps yet" from "attached but broken, zero events
//      ever arrived."
//
// FIXES ADDED:
//   - isSecureContext() check up front → clear on-screen banner
//     telling the user exactly what's wrong ("Open this over
//     HTTPS, or via http://localhost on this same device").
//   - A data-arrival watchdog: if the listener is attached but no
//     devicemotion event fires within 8s, we surface a distinct
//     "no-data" state instead of silently staying "still".
//   - A tiny debug readout (raw event count + live magnitude) so
//     you can immediately SEE whether the sensor is delivering
//     data at all, without opening devtools.
//   - Slightly hardened peak-detection thresholds for orientation
//     independence (works in-hand or in-pocket).
//   - Every emoji icon (🔥 👑 📅 🏅 etc.) replaced with Tabler
//     icon classes (ti-*), matching the rest of the app.
// ============================================================

(function () {
"use strict";

/* ============================================================
   CONSTANTS
   ============================================================ */
const DAILY_GOAL      = 10000;
const STEP_STRIDE_KM  = 0.000762;
const CAL_PER_STEP    = 0.04;
const STREAK_MIN_STEPS = 3000;
const CAL_TARGET      = 400;   // for score calc
const DIST_TARGET_KM  = 5;
const BRISK_MIN_TARGET = 30;
const STORAGE_KEY     = "dhas_activity_v1";
const HISTORY_MAX_DAYS = 400;

const MIN_STEP_MS   = 400;
const MAX_STEP_MS   = 1200;
const CONFIRM_STEPS = 2;
const LOW_PASS_ALPHA = 0.2;
const MIN_SWING = 2.2; // slightly more permissive than before — 2.5 was rejecting valid steps for phones in pockets
const WATCHDOG_MS = 8000;

function todayStr(d) {
  d = d || new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function daysAgoStr(n) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return todayStr(d);
}

/* ============================================================
   STORE — persistence layer
   ============================================================ */
const Store = (function () {
  function defaultState() {
    return {
      version: 1,
      today: { date: todayStr(), steps: 0, brisk: 0 },
      week: { weekStart: getWeekStart(todayStr()), days: {} }, // { "YYYY-MM-DD": steps }
      lifetime: {
        steps: 0, calories: 0, distanceKm: 0,
        highestDay: 0, totalActiveMinutes: 0,
        totalActiveDays: 0, goalsCompleted: 0
      },
      streak: { current: 0, longest: 0, lastCountedDate: null },
      achievements: [],
      challenge: null, // { id, weekStart, type, label, target, unit }
      history: {} // "YYYY-MM-DD": { steps, brisk, goalMet }
    };
  }

  function getWeekStart(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() - d.getDay());
    return todayStr(d);
  }

  let state = null;

  function migrateOld() {
    try {
      const old = JSON.parse(localStorage.getItem("dhas_steps_v4") || "null");
      if (!old) return null;
      const fresh = defaultState();
      if (old.date === new Date().toDateString()) {
        fresh.today.steps = old.steps || 0;
        fresh.today.brisk = old.briskSteps || 0;
      }
      return fresh;
    } catch (e) { return null; }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state = JSON.parse(raw);
      } else {
        state = migrateOld() || defaultState();
      }
    } catch (e) {
      state = defaultState();
    }

    // Roll day forward if the stored "today" is stale
    const tstr = todayStr();
    if (state.today.date !== tstr) {
      rolloverDay(tstr);
    }
    // Roll week forward if needed
    const wkStart = getWeekStart(tstr);
    if (state.week.weekStart !== wkStart) {
      state.week = { weekStart: wkStart, days: {} };
    }
    save();
    return state;
  }

  function rolloverDay(newDateStr) {
    // Finalize the day that just ended
    const finishedDate = state.today.date;
    const finishedSteps = state.today.steps;
    const finishedBrisk = state.today.brisk;
    const goalMet = finishedSteps >= DAILY_GOAL;

    // History
    state.history[finishedDate] = { steps: finishedSteps, brisk: finishedBrisk, goalMet };
    pruneHistory();

    // Lifetime
    if (finishedSteps > 0) {
      state.lifetime.totalActiveDays += (finishedSteps >= STREAK_MIN_STEPS) ? 1 : 0;
      if (goalMet) state.lifetime.goalsCompleted += 1;
      if (finishedSteps > state.lifetime.highestDay) state.lifetime.highestDay = finishedSteps;
    }

    // Streak — finalize yesterday's contribution
    if (finishedSteps >= STREAK_MIN_STEPS && state.streak.lastCountedDate !== finishedDate) {
      state.streak.current += 1;
      state.streak.lastCountedDate = finishedDate;
      if (state.streak.current > state.streak.longest) state.streak.longest = state.streak.current;
    } else if (finishedSteps < STREAK_MIN_STEPS) {
      state.streak.current = 0;
    }

    // Week bucket keeps this day's total too
    state.week.days[finishedDate] = finishedSteps;

    // Reset today
    state.today = { date: newDateStr, steps: 0, brisk: 0 };
  }

  function pruneHistory() {
    const cutoff = daysAgoStr(HISTORY_MAX_DAYS);
    Object.keys(state.history).forEach(k => { if (k < cutoff) delete state.history[k]; });
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function get() { return state; }

  function addSteps(count, isBrisk) {
    state.today.steps += count;
    if (isBrisk) state.today.brisk += count;
    state.lifetime.steps += count;
    state.lifetime.calories += count * CAL_PER_STEP;
    state.lifetime.distanceKm += count * STEP_STRIDE_KM;
    if (count > 0) {
      const min = Math.round(count / 100 * 10) / 10;
      state.lifetime.totalActiveMinutes += min;
    }
    state.week.days[state.today.date] = state.today.steps;
    state.history[state.today.date] = {
      steps: state.today.steps,
      brisk: state.today.brisk,
      goalMet: state.today.steps >= DAILY_GOAL
    };
  }

  function unlockAchievement(id) {
    if (!state.achievements.includes(id)) {
      state.achievements.push(id);
      return true;
    }
    return false;
  }

  function setChallenge(ch) { state.challenge = ch; }

  return { load, save, get, addSteps, unlockAchievement, setChallenge, getWeekStart };
})();

/* ============================================================
   SENSOR — walk/step detection off devicemotion
   Rewritten with: secure-context check, watchdog, debug counters.
   ============================================================ */
const Sensor = (function () {
  let onStep = null;
  let onStateChange = null;
  let onDebug = null;
  let attached = false;
  let usingGenericSensor = false;
  let genericSensor = null;

  // ── Gravity isolation ──
  // Gravity is the slow-moving component of acceleration; we track it
  // with a slow low-pass filter, then subtract it from the raw reading
  // to get "linear acceleration" — the part actually caused by movement,
  // independent of how the phone is oriented/held.
  let gravity = { x: 0, y: 0, z: 9.81 };
  const GRAVITY_ALPHA = 0.9;

  // Smoothed magnitude of linear acceleration
  let smoothedMag = 0;
  const SMOOTH_ALPHA = 0.25;
// ── Peak/valley step state machine ──
  let lastMag = 0;
  let rising = false;
  let waitingForValley = false;
  let peakVal = 0;
  let valleyVal = 0;
  let lastStepTime = 0;
  let lastInterval = 0;
  let candidateCount = 0;

  const STEP_THRESHOLD    = 3.2;   // min peak-to-valley swing (m/s^2) — real footstep, not hand jitter
  const MAX_SWING         = 9.0;   // max plausible swing — anything bigger is a shake/drop, not a step
  const MIN_STEP_INTERVAL = 280;   // ms - fastest plausible footfall (~215 steps/min ceiling)
  const MAX_STEP_INTERVAL = 1800;  // ms - gap this long resets the walking session
  const CADENCE_TOLERANCE = 0.45;  // consecutive step intervals must be within ±45% of each other
  const CONFIRM_STEPS     = 2;     // require this many consistent steps in a row before counting starts
 
  let eventCount = 0, lastEventAt = 0, watchdogTimer = null;
  let stillTimer = null;

  function isSecureEnough() {
    if (window.isSecureContext) return true;
    const h = location.hostname;
    return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
  }

  function clearWatchdog() { if (watchdogTimer) clearTimeout(watchdogTimer); }
  function armWatchdog() {
    clearWatchdog();
    watchdogTimer = setTimeout(() => {
      if (eventCount === 0) onStateChange && onStateChange("no-data");
    }, WATCHDOG_MS);
  }

  function scheduleStillCheck() {
    clearTimeout(stillTimer);
    stillTimer = setTimeout(() => onStateChange && onStateChange("still"), 2000);
  }

  // Core sample processor — fed by either the Generic Sensor API or devicemotion
  function processSample(ax, ay, az) {
    eventCount++;
    lastEventAt = Date.now();

    // Update gravity estimate (slow-moving average)
    gravity.x = GRAVITY_ALPHA * gravity.x + (1 - GRAVITY_ALPHA) * ax;
    gravity.y = GRAVITY_ALPHA * gravity.y + (1 - GRAVITY_ALPHA) * ay;
    gravity.z = GRAVITY_ALPHA * gravity.z + (1 - GRAVITY_ALPHA) * az;

    // Linear acceleration = raw minus gravity
    const lx = ax - gravity.x;
    const ly = ay - gravity.y;
    const lz = az - gravity.z;
    const linMag = Math.sqrt(lx * lx + ly * ly + lz * lz);

    // Light smoothing to cut sensor noise
    smoothedMag = SMOOTH_ALPHA * linMag + (1 - SMOOTH_ALPHA) * smoothedMag;

    onDebug && onDebug({ eventCount, magnitude: smoothedMag, lastEventAt });
    detectStep(smoothedMag);
  }

  function detectStep(mag) {
    const now = Date.now();

    if (mag > lastMag) {
      if (!rising) { rising = true; valleyVal = lastMag; }
      if (mag > peakVal) peakVal = mag;
    } else if (mag < lastMag) {
      if (rising) { rising = false; waitingForValley = true; }
      if (waitingForValley && mag < valleyVal) valleyVal = mag;

      if (waitingForValley) {
        const swing = peakVal - valleyVal;

        // Reject violent/unrealistic spikes (shaking, dropping, tapping the phone)
        if (swing > MAX_SWING) {
          waitingForValley = false;
          peakVal = mag; valleyVal = mag;
          candidateCount = 0;
          lastInterval = 0;
          return;
        }

        if (swing >= STEP_THRESHOLD) {
          const interval = lastStepTime === 0 ? MIN_STEP_INTERVAL + 1 : now - lastStepTime;

          if (interval >= MIN_STEP_INTERVAL && interval <= MAX_STEP_INTERVAL) {
            // Is this step's timing consistent with the last one (real walking rhythm)?
            const consistent = lastInterval === 0 ||
              Math.abs(interval - lastInterval) / lastInterval <= CADENCE_TOLERANCE;

            lastInterval  = interval;
            lastStepTime  = now;
            waitingForValley = false;
            peakVal = mag; valleyVal = mag;

            candidateCount = consistent ? candidateCount + 1 : 1;

            // Only count once we've seen a few steps at a consistent, walking-like rhythm
            if (candidateCount >= CONFIRM_STEPS) {
              const brisk = interval < 500;
              onStateChange && onStateChange("walking");
              onStep && onStep(brisk);
              scheduleStillCheck();
            }
          } else if (interval > MAX_STEP_INTERVAL) {
            // Long gap — fresh walking session starting, don't count this one yet
            lastStepTime = now;
            waitingForValley = false;
            peakVal = mag; valleyVal = mag;
            candidateCount = 0;
            lastInterval = 0;
          }
          // interval < MIN_STEP_INTERVAL → double-bounce of same footfall, ignore but keep tracking
        }
      }
    }
    lastMag = mag;
  }

  function handleMotion(e) {
    const a = e.accelerationIncludingGravity && e.accelerationIncludingGravity.x != null
      ? e.accelerationIncludingGravity
      : e.acceleration;
    if (!a || a.x == null || a.y == null || a.z == null) return;
    processSample(a.x, a.y, a.z);
  }

  // Prefer the Generic Sensor API (Accelerometer) when available — higher
  // sample rate and cleaner data than devicemotion, but Chrome-on-Android
  // only, and needs the 'accelerometer' permission.
  async function tryGenericSensor() {
    if (typeof Accelerometer === "undefined") return false;
    try {
      if (navigator.permissions) {
        try {
          const status = await navigator.permissions.query({ name: "accelerometer" });
          if (status.state === "denied") return false;
        } catch (_) { /* some browsers don't support querying this permission name */ }
      }
      genericSensor = new Accelerometer({ frequency: 30 });
      genericSensor.addEventListener("reading", () => {
        processSample(genericSensor.x, genericSensor.y, genericSensor.z);
      });
      genericSensor.addEventListener("error", (err) => {
        console.warn("[Steps] Generic Sensor error, falling back to devicemotion:", err.error && err.error.message);
        usingGenericSensor = false;
        startDeviceMotionFallback();
      });
      genericSensor.start();
      usingGenericSensor = true;
      return true;
    } catch (err) {
      console.warn("[Steps] Generic Sensor unavailable:", err.message);
      return false;
    }
  }

  function startDeviceMotionFallback() {
    if (attached) return;
    window.addEventListener("devicemotion", handleMotion);
    attached = true;
  }

  async function start() {
    if (attached || usingGenericSensor) return;

    if (!isSecureEnough()) { onStateChange && onStateChange("insecure-context"); return; }

    const gotGeneric = await tryGenericSensor();
    if (gotGeneric) {
      onStateChange && onStateChange("still");
      armWatchdog();
      return;
    }

    if (typeof DeviceMotionEvent === "undefined") {
      onStateChange && onStateChange("unsupported");
      return;
    }
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      onStateChange && onStateChange("permission-needed");
      return; // caller must invoke requestIOSPermission() from a user gesture
    }
    startDeviceMotionFallback();
    onStateChange && onStateChange("still");
    armWatchdog();
  }

  function requestIOSPermission() {
    return DeviceMotionEvent.requestPermission().then(result => {
      if (result === "granted") {
        startDeviceMotionFallback();
        onStateChange && onStateChange("still");
        armWatchdog();
        return true;
      }
      onStateChange && onStateChange("denied");
      return false;
    }).catch(() => { onStateChange && onStateChange("denied"); return false; });
  }

  function stop() {
    if (attached) window.removeEventListener("devicemotion", handleMotion);
    if (genericSensor) { try { genericSensor.stop(); } catch (_) {} }
    attached = false;
    usingGenericSensor = false;
    clearTimeout(stillTimer);
    clearWatchdog();
  }

  function getDebugSnapshot() {
    return { eventCount, lastEventAt, secure: isSecureEnough(), attached: attached || usingGenericSensor };
  }

  return {
    start, stop, requestIOSPermission, getDebugSnapshot,
    set onStep(fn) { onStep = fn; },
    set onStateChange(fn) { onStateChange = fn; },
    set onDebug(fn) { onDebug = fn; }
  };
})();

/* ============================================================
   ENGINE — pure calculations
   ============================================================ */
const Engine = (function () {

  function calories(steps) { return Math.round(steps * CAL_PER_STEP); }
  function distanceKm(steps) { return steps * STEP_STRIDE_KM; }
  function activeMinutes(steps) { return Math.round(steps / 100); }
  function briskMinutes(briskSteps) { return Math.round(briskSteps / 120 * 10) / 10; }

  function goalPct(steps) { return Math.min(steps / DAILY_GOAL, 1); }

  function goalMessage(steps) {
    if (steps >= DAILY_GOAL) return "Goal completed! Amazing work.";
    const remaining = DAILY_GOAL - steps;
    if (remaining <= 500) return `Almost there — only ${remaining.toLocaleString()} steps left!`;
    if (steps >= DAILY_GOAL * 0.75) return "So close — keep going!";
    if (steps >= DAILY_GOAL * 0.4) return "Great progress today.";
    if (steps > 0) return "Let's build some momentum.";
    return "Let's get moving!";
  }

  function activityScore(today, lifetime) {
    const cal = calories(today.steps);
    const dist = distanceKm(today.steps);
    const briskMin = briskMinutes(today.brisk);

    const goalComponent   = Math.min(today.steps / DAILY_GOAL, 1) * 100;
    const calComponent    = Math.min(cal / CAL_TARGET, 1) * 100;
    const distComponent   = Math.min(dist / DIST_TARGET_KM, 1) * 100;
    const briskComponent  = Math.min(briskMin / BRISK_MIN_TARGET, 1) * 100;

    const score = Math.round(
      goalComponent * 0.4 + calComponent * 0.2 + distComponent * 0.2 + briskComponent * 0.2
    );

    let label, stars;
    if (score >= 90)      { label = "Excellent";          stars = 5; }
    else if (score >= 75) { label = "Very Good";          stars = 4; }
    else if (score >= 50) { label = "Good";               stars = 3; }
    else if (score >= 25) { label = "Getting There";      stars = 2; }
    else                  { label = "Needs Improvement";  stars = 1; }

    return {
      score, label, stars,
      breakdown: `Goal ${Math.round(goalComponent)}% · Calories ${Math.round(calComponent)}% · Distance ${Math.round(distComponent)}% · Brisk ${Math.round(briskComponent)}%`
    };
  }

  // NEW: icon is now a Tabler icon class instead of an emoji character
  const ACHIEVEMENTS = [
    { id: "first_1000",  icon: "ti-shoe",           name: "First 1,000 Steps",   check: s => s.lifetime.steps >= 1000 },
    { id: "walk_5km",     icon: "ti-map-pin",        name: "Walk 5 km",           check: s => s.lifetime.distanceKm >= 5 },
    { id: "streak_7",     icon: "ti-flame",          name: "7-Day Streak",       check: s => s.streak.longest >= 7 },
    { id: "burn_500",     icon: "ti-flame-filled",   name: "Burn 500 Calories",  check: s => s.lifetime.calories >= 500 },
    { id: "walk_100k",    icon: "ti-crown",          name: "Walk 100,000 Steps", check: s => s.lifetime.steps >= 100000 },
    { id: "first_goal",   icon: "ti-rocket",         name: "First Goal Complete",check: s => s.lifetime.goalsCompleted >= 1 },
    { id: "active_30",    icon: "ti-calendar-check", name: "30 Active Days",     check: s => s.lifetime.totalActiveDays >= 30 },
    { id: "streak_30",    icon: "ti-star",           name: "30-Day Streak",      check: s => s.streak.longest >= 30 },
    { id: "walk_10km_day",icon: "ti-mountain",       name: "10 km in a Day",     check: s => distanceKm(s.today.steps) >= 10 }
  ];

  function checkAchievements(state) {
    const newlyUnlocked = [];
    ACHIEVEMENTS.forEach(a => {
      if (a.check(state) && Store.unlockAchievement(a.id)) newlyUnlocked.push(a);
    });
    return newlyUnlocked;
  }

  const CHALLENGE_TEMPLATES = [
    { type: "steps", label: "Walk 20,000 Steps this week", target: 20000, unit: "steps" },
    { type: "calories", label: "Burn 700 Calories this week", target: 700, unit: "kcal" },
    { type: "activeDays", label: "Walk on 5 Days this week", target: 5, unit: "days" },
    { type: "distance", label: "Walk 10 km this week", target: 10, unit: "km" }
  ];

  function getOrCreateChallenge(state) {
    const wkStart = state.week.weekStart;
    if (!state.challenge || state.challenge.weekStart !== wkStart) {
      const idx = Array.from(wkStart).reduce((a, c) => a + c.charCodeAt(0), 0) % CHALLENGE_TEMPLATES.length;
      const tmpl = CHALLENGE_TEMPLATES[idx];
      const ch = { id: wkStart + "_" + tmpl.type, weekStart: wkStart, ...tmpl, completed: false };
      Store.setChallenge(ch);
      return ch;
    }
    return state.challenge;
  }

  function challengeProgress(state) {
    const ch = getOrCreateChallenge(state);
    const days = state.week.days;
    const weekSteps = Object.values(days).reduce((a, b) => a + b, 0);
    let progress = 0;
    if (ch.type === "steps") progress = weekSteps;
    else if (ch.type === "calories") progress = calories(weekSteps);
    else if (ch.type === "distance") progress = Math.round(distanceKm(weekSteps) * 100) / 100;
    else if (ch.type === "activeDays") progress = Object.values(days).filter(s => s >= STREAK_MIN_STEPS).length;

    const pct = Math.min(progress / ch.target, 1) * 100;
    const done = progress >= ch.target;
    if (done && !ch.completed) { ch.completed = true; Store.setChallenge(ch); }
    return { ch, progress, pct, done };
  }

  function weeklyInsights(state) {
    const insights = [];
    const days = state.week.days;
    const weekSteps = Object.values(days).reduce((a, b) => a + b, 0);

    const prevWeekStart = new Date(state.week.weekStart + "T00:00:00");
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    let prevWeekSteps = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(prevWeekStart); d.setDate(d.getDate() + i);
      const key = todayStr(d);
      if (state.history[key]) prevWeekSteps += state.history[key].steps || 0;
    }

    if (prevWeekSteps > 0) {
      const diffPct = Math.round(((weekSteps - prevWeekSteps) / prevWeekSteps) * 100);
      if (diffPct > 5) insights.push({ icon: "ti-trending-up", text: `You walked ${diffPct}% more than last week.` });
      else if (diffPct < -5) insights.push({ icon: "ti-trending-down", text: `You walked ${Math.abs(diffPct)}% less than last week.` });
      else insights.push({ icon: "ti-equal", text: "Your activity is steady compared to last week." });
    }

    const briskMin = briskMinutes(state.today.brisk);
    const slowSteps = state.today.steps - state.today.brisk;
    if (state.today.steps > 0 && briskMin > 0 && state.today.brisk > slowSteps) {
      insights.push({ icon: "ti-run", text: "Most of today's activity comes from brisk walking." });
    }

    const monthPrefix = todayStr().slice(0, 7);
    let bestDay = null, bestSteps = -1;
    Object.entries(state.history).forEach(([date, rec]) => {
      if (date.startsWith(monthPrefix) && rec.steps > bestSteps) { bestSteps = rec.steps; bestDay = date; }
    });
    if (bestDay === state.today.date && state.today.steps > 0) {
      insights.push({ icon: "ti-star", text: "Today is your best day this month!" });
    }

    if (state.lifetime.highestDay > 0 && state.today.steps > 0) {
      const gap = state.lifetime.highestDay - state.today.steps;
      if (gap > 0 && gap <= 1500) {
        insights.push({ icon: "ti-target-arrow", text: `You're close to your personal record — only ${gap.toLocaleString()} steps away.` });
      } else if (state.today.steps >= state.lifetime.highestDay && state.today.steps > 0) {
        insights.push({ icon: "ti-trophy", text: "New personal best step count today!" });
      }
    }

    if (state.streak.current >= 3) {
      insights.push({ icon: "ti-flame", text: `You're on a ${state.streak.current}-day streak — your consistency is paying off.` });
    }

    if (!insights.length) {
      insights.push({ icon: "ti-info-circle", text: "Keep logging activity to unlock personalised insights." });
    }
    return insights;
  }

  return {
    calories, distanceKm, activeMinutes, briskMinutes, goalPct, goalMessage,
    activityScore, checkAchievements, ACHIEVEMENTS, getOrCreateChallenge,
    challengeProgress, weeklyInsights
  };
})();

/* ============================================================
   UI — DOM rendering, cached refs, animated counters
   ============================================================ */
const UI = (function () {
  const el = {};
  ["mSteps","mCalories","mDistance","mSlow","mBrisk","mActiveMin",
   "scoreNum","scoreArc","scoreLabel","scoreStars","scoreBreakdown",
   "goalArc","goalPct","goalStepsTxt","goalRemaining","goalMsg",
   "streakCurrent","streakLongest","streakTotalDays",
   "weekChart","weekDayLabels","wkSteps","wkAvg","wkDist","wkCal","wkBest","wkTrend",
   "lSteps","lCal","lDist","lHigh","lStreak","lDays","lMins","lGoals",
   "achGrid","chTitle","chSub","chBar","chProgressTxt","chDoneBadge",
   "insightsList","calMonthLbl","calDow","calGrid",
   "sensorPill","sensorPillText","sensorDot","dateSub","permCard","permBtn",
   "dayModalOverlay","dayModalTitle","dmSteps","dmCal","dmDist","dmBrisk","dmGoal","dayModalClose",
   "calPrev","calNext"
  ].forEach(id => el[id] = document.getElementById(id));

  const _animCache = {};
  function animateNumber(elem, key, from, to, decimals) {
    if (!elem) return;
    if (_animCache[key] === to) { elem.textContent = format(to, decimals); return; }
    _animCache[key] = to;
    const start = performance.now();
    const dur = 450;
    const startVal = from;
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = startVal + (to - startVal) * eased;
      elem.textContent = format(val, decimals);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function format(v, decimals) {
    if (decimals) return v.toFixed(decimals);
    return Math.round(v).toLocaleString();
  }

  function setArc(circleEl, pct, radius) {
    if (!circleEl) return;
    const circumference = 2 * Math.PI * radius;
    circleEl.setAttribute("stroke-dasharray", `${(pct * circumference).toFixed(1)} ${circumference.toFixed(1)}`);
  }

  // Ensures a small debug/diagnostics line exists under the sensor pill,
  // created lazily so we don't have to touch every steps.html deployment.
  function ensureDebugLine() {
    let d = document.getElementById("sensorDebugLine");
    if (d) return d;
    d = document.createElement("div");
    d.id = "sensorDebugLine";
    d.style.cssText = "font-size:.68rem;color:rgba(255,255,255,.55);margin-top:6px;text-align:right;position:relative;z-index:1;";
    const header = document.querySelector(".page-header .ph-top");
    if (header && header.parentElement) header.parentElement.appendChild(d);
    return d;
  }

  function renderSensorState(stateName) {
    if (!el.sensorPill) return;
    el.sensorPill.className = "sensor-pill";
    const dbg = ensureDebugLine();

    if (stateName === "walking") {
      el.sensorPill.classList.add("walking");
      el.sensorPillText.textContent = "Walking";
      el.sensorDot.style.display = "block";
      if (el.permCard) el.permCard.style.display = "none";
      if (dbg) dbg.textContent = "";

    } else if (stateName === "still") {
      el.sensorPill.classList.add("still");
      el.sensorPillText.textContent = "Standing still";
      el.sensorDot.style.display = "none";
      if (el.permCard) el.permCard.style.display = "none";
      if (dbg) dbg.textContent = "Sensor active — start walking to count steps.";

    } else if (stateName === "no-data") {
      el.sensorPill.classList.add("waiting");
      el.sensorPillText.textContent = "No sensor data";
      el.sensorDot.style.display = "none";
      if (el.permCard) {
        el.permCard.style.display = "block";
        el.permCard.innerHTML = `
          <i class="ti ti-alert-triangle" style="font-size:20px;color:var(--amber);display:block;margin-bottom:6px;"></i>
          No motion data has been received from your device's sensors.
          <ul style="text-align:left;margin:10px auto 0;max-width:340px;padding-left:18px;line-height:1.7;">
            <li>Make sure the page is opened over <strong>HTTPS</strong> (or <code>http://localhost</code> if testing on the same device)</li>
            <li>Check your browser's Site Settings → Motion sensors → Allow</li>
            <li>Some desktop browsers/emulators have no accelerometer at all — try a real phone</li>
          </ul>
          <button class="perm-btn" onclick="location.reload()">Reload Page</button>`;
      }

    } else if (stateName === "insecure-context") {
      el.sensorPill.classList.add("waiting");
      el.sensorPillText.textContent = "HTTPS required";
      el.sensorDot.style.display = "none";
      if (el.permCard) {
        el.permCard.style.display = "block";
        el.permCard.innerHTML = `
          <i class="ti ti-lock-open" style="font-size:20px;color:var(--rose);display:block;margin-bottom:6px;"></i>
          Motion sensors are blocked because this page isn't loaded securely.
          Browsers only allow step-counting sensors over <strong>HTTPS</strong>
          (or <code>http://localhost</code> on this exact device).
          <br><br>Open this app via its HTTPS address, or via <code>http://localhost:3007</code>
          if you're testing on this same machine.`;
      }

    } else if (stateName === "permission-needed") {
      el.sensorPill.classList.add("waiting");
      el.sensorPillText.textContent = "Tap to enable";
      el.sensorDot.style.display = "none";
      if (el.permCard) {
        el.permCard.style.display = "block";
        el.permCard.innerHTML = `
          <i class="ti ti-shoe" style="font-size:20px;color:var(--blue);display:block;margin-bottom:6px;"></i>
          Motion sensor access is needed to count your steps.
          <br><button class="perm-btn" id="permBtn">Enable Step Tracking</button>`;
        document.getElementById("permBtn")?.addEventListener("click", _permBtnHandler);
      }

    } else if (stateName === "denied") {
      el.sensorPill.classList.add("waiting");
      el.sensorPillText.textContent = "Permission denied";
      el.sensorDot.style.display = "none";
      if (el.permCard) {
        el.permCard.style.display = "block";
        el.permCard.innerHTML = `
          <i class="ti ti-lock" style="font-size:20px;color:var(--rose);display:block;margin-bottom:6px;"></i>
          Motion permission was denied. On iOS: Settings → Safari →
          Motion &amp; Orientation Access → On, then reload this page.`;
      }

    } else if (stateName === "unsupported") {
      el.sensorPill.classList.add("waiting");
      el.sensorPillText.textContent = "Sensor unavailable";
      el.sensorDot.style.display = "none";
      if (el.permCard) {
        el.permCard.style.display = "block";
        el.permCard.innerHTML = `
          <i class="ti ti-device-mobile-off" style="font-size:20px;color:var(--muted);display:block;margin-bottom:6px;"></i>
          This device or browser doesn't expose motion sensors. Try a
          real phone with Chrome or Safari.`;
      }

    } else {
      el.sensorPill.classList.add("waiting");
      el.sensorPillText.textContent = "Initialising…";
      el.sensorDot.style.display = "none";
    }
  }

  let _permBtnHandler = null;
  function setPermBtnHandler(fn) { _permBtnHandler = fn; }

  function renderDebug(snapshot) {
    const dbg = document.getElementById("sensorDebugLine");
    if (!dbg || !snapshot) return;
    if (snapshot.magnitude != null) {
      dbg.textContent = `Sensor events: ${snapshot.eventCount} · live signal: ${snapshot.magnitude.toFixed(2)}`;
    }
  }

  function renderToday(state) {
    const s = state.today.steps;
    animateNumber(el.mSteps, "steps", 0, s, 0);
    animateNumber(el.mCalories, "cal", 0, Engine.calories(s), 0);
    animateNumber(el.mDistance, "dist", 0, Engine.distanceKm(s), 2);
    animateNumber(el.mSlow, "slow", 0, s - state.today.brisk, 0);
    animateNumber(el.mBrisk, "brisk", 0, state.today.brisk, 0);
    animateNumber(el.mActiveMin, "active", 0, Engine.activeMinutes(s), 0);
  }

  function renderScore(state) {
    const r = Engine.activityScore(state.today, state.lifetime);
    animateNumber(el.scoreNum, "score", 0, r.score, 0);
    setArc(el.scoreArc, r.score / 100, 50);
    if (el.scoreLabel) el.scoreLabel.textContent = r.label;
    if (el.scoreStars) el.scoreStars.textContent = "★".repeat(r.stars) + "☆".repeat(5 - r.stars);
    if (el.scoreBreakdown) el.scoreBreakdown.textContent = r.breakdown;
  }

  function renderGoal(state) {
    const s = state.today.steps;
    const pct = Engine.goalPct(s);
    setArc(el.goalArc, pct, 55);
    if (el.goalPct) el.goalPct.textContent = Math.round(pct * 100) + "%";
    if (el.goalStepsTxt) el.goalStepsTxt.textContent = `${s.toLocaleString()} / ${DAILY_GOAL.toLocaleString()}`;
    const remaining = Math.max(DAILY_GOAL - s, 0);
    if (el.goalRemaining) {
      el.goalRemaining.textContent = remaining === 0 ? "Goal reached!" : `${remaining.toLocaleString()} steps to go`;
    }
    if (el.goalMsg) el.goalMsg.textContent = Engine.goalMessage(s);
  }

  function renderStreak(state) {
    const displayCurrent = state.today.steps >= STREAK_MIN_STEPS && state.streak.lastCountedDate !== state.today.date
      ? state.streak.current + 1 : state.streak.current;
    if (el.streakCurrent) el.streakCurrent.textContent = displayCurrent;
    if (el.streakLongest) el.streakLongest.textContent = Math.max(state.streak.longest, displayCurrent);
    if (el.streakTotalDays) el.streakTotalDays.textContent = state.lifetime.totalActiveDays;
  }

  function renderWeek(state) {
    const labels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const weekStartDate = new Date(state.week.weekStart + "T00:00:00");
    const values = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartDate); d.setDate(d.getDate() + i);
      const key = todayStr(d);
      values.push({ date: key, steps: state.week.days[key] || 0, isToday: key === state.today.date });
    }
    const maxVal = Math.max(...values.map(v => v.steps), 1500);

    if (el.weekChart) {
      el.weekChart.innerHTML = values.map(v => {
        const h = Math.max((v.steps / maxVal) * 74, v.steps > 0 ? 4 : 2);
        const cls = v.isToday ? "today" : (v.steps >= DAILY_GOAL ? "met" : "");
        return `<div class="week-col"><div class="week-bar ${cls}" style="height:${h}px"></div></div>`;
      }).join("");
    }
    if (el.weekDayLabels) {
      el.weekDayLabels.innerHTML = labels.map(l => `<span class="week-day-label" style="flex:1;text-align:center">${l}</span>`).join("");
    }

    const totalSteps = values.reduce((a, v) => a + v.steps, 0);
    const activeDaysCount = values.filter(v => v.steps > 0).length;
    const avg = activeDaysCount ? Math.round(totalSteps / activeDaysCount) : 0;
    const best = values.reduce((a, v) => v.steps > a.steps ? v : a, values[0]);

    if (el.wkSteps) el.wkSteps.textContent = totalSteps.toLocaleString();
    if (el.wkAvg) el.wkAvg.textContent = avg.toLocaleString();
    if (el.wkDist) el.wkDist.textContent = Engine.distanceKm(totalSteps).toFixed(2) + " km";
    if (el.wkCal) el.wkCal.textContent = Engine.calories(totalSteps).toLocaleString() + " kcal";
    if (el.wkBest) el.wkBest.textContent = best.steps > 0 ? labels[new Date(best.date + "T00:00:00").getDay()] + ` (${best.steps.toLocaleString()})` : "—";

    const prevStart = new Date(weekStartDate); prevStart.setDate(prevStart.getDate() - 7);
    let prevTotal = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(prevStart); d.setDate(d.getDate() + i);
      const rec = state.history[todayStr(d)];
      if (rec) prevTotal += rec.steps;
    }
    if (el.wkTrend) {
      if (prevTotal === 0) {
        el.wkTrend.textContent = "—"; el.wkTrend.className = "";
      } else {
        const diff = Math.round(((totalSteps - prevTotal) / prevTotal) * 100);
        el.wkTrend.textContent = (diff >= 0 ? "+" : "") + diff + "%";
        el.wkTrend.className = diff >= 0 ? "trend-up" : "trend-down";
      }
    }
  }

  function renderLifetime(state) {
    const L = state.lifetime;
    if (el.lSteps) el.lSteps.textContent = L.steps.toLocaleString();
    if (el.lCal) el.lCal.textContent = Math.round(L.calories).toLocaleString();
    if (el.lDist) el.lDist.textContent = L.distanceKm.toFixed(2) + " km";
    if (el.lHigh) el.lHigh.textContent = L.highestDay.toLocaleString();
    if (el.lStreak) el.lStreak.textContent = state.streak.longest;
    if (el.lDays) el.lDays.textContent = L.totalActiveDays;
    if (el.lMins) el.lMins.textContent = Math.round(L.totalActiveMinutes).toLocaleString();
    if (el.lGoals) el.lGoals.textContent = L.goalsCompleted;
  }

  // NEW: renders Tabler <i> icons instead of emoji characters
  function renderAchievements(state) {
    if (!el.achGrid) return;
    el.achGrid.innerHTML = Engine.ACHIEVEMENTS.map(a => {
      const unlocked = state.achievements.includes(a.id);
      return `<div class="ach-badge ${unlocked ? "unlocked" : ""}" title="${a.name}">
                <div class="ach-icon"><i class="ti ${a.icon}" aria-hidden="true"></i></div>
                <div class="ach-name">${a.name}</div>
              </div>`;
    }).join("");
  }

  function renderChallenge(state) {
    const { ch, progress, pct, done } = Engine.challengeProgress(state);
    if (el.chTitle) el.chTitle.innerHTML = `<i class="ti ti-target" aria-hidden="true"></i> ${ch.label}`;
    if (el.chSub) el.chSub.textContent = "Resets every week — keep it up!";
    if (el.chBar) el.chBar.style.width = pct + "%";
    const progDisplay = ch.type === "distance" ? progress.toFixed(2) : Math.round(progress).toLocaleString();
    if (el.chProgressTxt) el.chProgressTxt.textContent = `${progDisplay} / ${ch.target.toLocaleString()} ${ch.unit}`;
    if (el.chDoneBadge) el.chDoneBadge.style.display = done ? "inline-flex" : "none";
  }

  function renderInsights(state) {
    if (!el.insightsList) return;
    const insights = Engine.weeklyInsights(state);
    el.insightsList.innerHTML = insights.map(i =>
      `<div class="insight-item"><i class="ti ${i.icon}" aria-hidden="true"></i><div class="insight-text">${i.text}</div></div>`
    ).join("");
  }

  // ── Calendar ──
  let calViewDate = new Date();

  function renderCalendar(state) {
    if (!el.calGrid) return;
    const y = calViewDate.getFullYear(), m = calViewDate.getMonth();
    if (el.calMonthLbl) el.calMonthLbl.textContent = calViewDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

    if (el.calDow && !el.calDow.dataset.built) {
      el.calDow.innerHTML = ["S","M","T","W","T","F","S"].map(d => `<div class="cal-dow">${d}</div>`).join("");
      el.calDow.dataset.built = "1";
    }

    const firstDow = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    let html = "";
    for (let i = 0; i < firstDow; i++) html += `<div class="cal-cell empty"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      const rec = dateStr === state.today.date
        ? { steps: state.today.steps, brisk: state.today.brisk, goalMet: state.today.steps >= DAILY_GOAL }
        : state.history[dateStr];
      let cls = "none";
      if (rec && rec.steps > 0) {
        cls = rec.goalMet ? "goal" : (rec.steps >= STREAK_MIN_STEPS ? "mid" : "low");
      }
      html += `<div class="cal-cell ${cls}" data-date="${dateStr}" title="${dateStr}">${d}</div>`;
    }
    el.calGrid.innerHTML = html;

    el.calGrid.querySelectorAll(".cal-cell:not(.empty)").forEach(cell => {
      cell.addEventListener("click", () => openDayModal(cell.dataset.date, state));
    });
  }

  function openDayModal(dateStr, state) {
    const rec = dateStr === state.today.date
      ? { steps: state.today.steps, brisk: state.today.brisk }
      : state.history[dateStr];
    if (!rec) return;
    if (el.dayModalTitle) el.dayModalTitle.textContent = new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    if (el.dmSteps) el.dmSteps.textContent = rec.steps.toLocaleString();
    if (el.dmCal) el.dmCal.textContent = Engine.calories(rec.steps).toLocaleString() + " kcal";
    if (el.dmDist) el.dmDist.textContent = Engine.distanceKm(rec.steps).toFixed(2) + " km";
    if (el.dmBrisk) el.dmBrisk.textContent = Engine.briskMinutes(rec.brisk || 0) + " min";
    if (el.dmGoal) el.dmGoal.textContent = Math.round(Engine.goalPct(rec.steps) * 100) + "%";
    if (el.dayModalOverlay) el.dayModalOverlay.classList.add("show");
  }

  function initCalendarNav(getState) {
    el.calPrev?.addEventListener("click", () => { calViewDate.setMonth(calViewDate.getMonth() - 1); renderCalendar(getState()); });
    el.calNext?.addEventListener("click", () => { calViewDate.setMonth(calViewDate.getMonth() + 1); renderCalendar(getState()); });
    el.dayModalClose?.addEventListener("click", () => el.dayModalOverlay?.classList.remove("show"));
    el.dayModalOverlay?.addEventListener("click", (e) => { if (e.target === el.dayModalOverlay) el.dayModalOverlay.classList.remove("show"); });
  }

  function renderDateSub() {
    if (el.dateSub) {
      el.dateSub.textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
    }
  }

  function showToast(text, type) {
    const t = document.getElementById("dhasToast");
    if (!t) return;
    t.className = type || "success";
    t.innerHTML = `<span>${text}</span><button class="toast-dismiss" onclick="this.parentElement.style.display='none'">✕</button>`;
    t.style.display = "flex";
    setTimeout(() => { t.style.display = "none"; }, 4500);
  }

  function renderAll(state) {
    renderToday(state);
    renderScore(state);
    renderGoal(state);
    renderStreak(state);
    renderWeek(state);
    renderLifetime(state);
    renderAchievements(state);
    renderChallenge(state);
    renderInsights(state);
    renderCalendar(state);
  }

  return { renderAll, renderSensorState, renderDateSub, renderDebug, setPermBtnHandler, showToast, initCalendarNav, renderCalendar: () => {} };
})();

/* ============================================================
   MAIN — wiring
   ============================================================ */
(function main() {
  const state = Store.load();
  UI.renderDateSub();
  UI.renderAll(state);
  UI.initCalendarNav(Store.get);

  let saveDebounce = null;
  function scheduleSave() {
    clearTimeout(saveDebounce);
    saveDebounce = setTimeout(() => Store.save(), 1500);
  }

  Sensor.onStateChange = (s) => UI.renderSensorState(s);
  Sensor.onDebug = (snapshot) => UI.renderDebug(snapshot);

  Sensor.onStep = (isBrisk) => {
    Store.addSteps(1, isBrisk);
    const st = Store.get();
    UI.renderAll(st);

    const unlocked = Engine.checkAchievements(st);
    unlocked.forEach(a => UI.showToast(`Achievement unlocked: ${a.name}`, "success"));
    if (unlocked.length) UI.renderAll(st);

    scheduleSave();
  };

  async function enableTracking() {
    const granted = await Sensor.requestIOSPermission();
    if (granted) {
      UI.showToast("Step tracking enabled.", "success");
    } else {
      UI.showToast("Motion permission was denied.", "error");
    }
  }
  UI.setPermBtnHandler(enableTracking);

  // Wire the button that already exists in the static HTML too
  // (covers the initial permission-needed render before ensureDebugLine runs)
  const staticPermBtn = document.getElementById("permBtn");
  if (staticPermBtn) staticPermBtn.addEventListener("click", enableTracking);

  Sensor.start();

  // Midnight rollover watcher — check every 60s whether the date has changed
  let lastCheckedDate = todayStr();
  setInterval(() => {
    const t = todayStr();
    if (t !== lastCheckedDate) {
      lastCheckedDate = t;
      const s = Store.load(); // load() performs rollover internally
      UI.renderAll(s);
      UI.showToast("New day started — counters reset.", "success");
    }
  }, 60 * 1000);

  // Persist on tab hide/close so nothing is lost between debounced saves
  document.addEventListener("visibilitychange", () => { if (document.hidden) Store.save(); });
  window.addEventListener("beforeunload", () => Store.save());
})();

})();
