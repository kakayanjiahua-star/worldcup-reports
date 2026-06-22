import fs from "node:fs/promises";

const FIFA_SCHEDULE_URL =
  "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023";
const LIVESCORE_FIXTURES_URL =
  "https://www.livescore.com/en/football/international/world-cup-2026/fixtures/";
const SENT_REPORTS_PATH = new URL("./sent_pre_match_reports.json", import.meta.url);
const STATUS_PATH = new URL("./pre_match_monitor_status.json", import.meta.url);
const SNAPSHOT_PATH = new URL("./pre_match_window_snapshot.json", import.meta.url);
const WINDOW_MINUTES = 60;
const WINDOW_HOURS = 24;
const HISTORY_LIMIT = 72;

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    result[key] = value;
  }
  return result;
}

function toDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
}

function formatBjt(dateLike) {
  const date = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function desc(value, fallback = "") {
  return value?.[0]?.Description ?? fallback;
}

function normalizeMatch(match, now) {
  const kickoff = toDate(match.Date);
  const deltaHours = (kickoff.getTime() - now.getTime()) / 36e5;
  return {
    matchId: String(match.IdMatch),
    stage: desc(match.StageName),
    group: desc(match.GroupName),
    homeCode: match.Home?.Abbreviation ?? "TBD",
    awayCode: match.Away?.Abbreviation ?? "TBD",
    homeName: match.Home?.ShortClubName ?? desc(match.Home?.TeamName) ?? "TBD",
    awayName: match.Away?.ShortClubName ?? desc(match.Away?.TeamName) ?? "TBD",
    venue: desc(match.Stadium?.Name),
    kickoffUtc: kickoff.toISOString(),
    kickoffBjt: formatBjt(kickoff),
    deltaHours: Number(deltaHours.toFixed(3))
  };
}

async function readJson(url, fallback) {
  try {
    return JSON.parse(await fs.readFile(url, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(url, value) {
  await fs.writeFile(url, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalizeSentReports(state) {
  const reports = [];
  const seen = new Set();

  const push = (item) => {
    if (!item || item.matchId == null) return;
    const matchId = String(item.matchId);
    if (seen.has(matchId)) return;
    seen.add(matchId);
    reports.push({
      ...item,
      matchId,
      match: item.match ?? "",
      kickoffBjt: item.kickoffBjt ?? "",
      reportPath: item.reportPath ?? "",
      pushedAtBjt: item.pushedAtBjt ?? "",
      mode: item.mode ?? "unknown"
    });
  };

  if (Array.isArray(state?.reports)) {
    state.reports.forEach(push);
  }

  if (state && typeof state === "object") {
    for (const [key, value] of Object.entries(state)) {
      if (key === "reports") continue;
      if (value && typeof value === "object") {
        push({ ...value, matchId: value.matchId ?? key });
      }
    }
  }

  return reports;
}

async function fetchSchedule() {
  const response = await fetch(FIFA_SCHEDULE_URL, {
    headers: { "user-agent": "codex-worldcup-pre-match-monitor/1.0" }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch FIFA schedule: ${response.status}`);
  }
  return response.json();
}

const args = parseArgs(process.argv.slice(2));
const now = args.now ? toDate(args.now) : new Date();
const lowerBound = WINDOW_HOURS - WINDOW_MINUTES / 60;
const upperBound = WINDOW_HOURS + WINDOW_MINUTES / 60;

const [schedulePayload, sentState, statusState] = await Promise.all([
  fetchSchedule(),
  readJson(SENT_REPORTS_PATH, { reports: [] }),
  readJson(STATUS_PATH, { latestRun: null, history: [] })
]);

const sentReports = normalizeSentReports(sentState);
const sentMatchIds = new Set(sentReports.map((item) => String(item.matchId)));

const upcomingMatches = (schedulePayload.Results ?? [])
  .map((match) => normalizeMatch(match, now))
  .filter((match) => match.deltaHours > 0 && match.homeCode !== "TBD" && match.awayCode !== "TBD")
  .sort((a, b) => a.deltaHours - b.deltaHours);

const eligibleMatches = upcomingMatches
  .filter((match) => match.deltaHours <= upperBound && !sentMatchIds.has(match.matchId))
  .map((match) => ({
    ...match,
    triggerType: match.deltaHours >= lowerBound ? "on-time-24h-window" : "backfill-missed-24h-window",
    scheduledPushBjt: formatBjt(new Date(new Date(match.kickoffUtc).getTime() - WINDOW_HOURS * 36e5))
  }));

const nextMatch = upcomingMatches.find((match) => !sentMatchIds.has(match.matchId)) ?? null;
const note = eligibleMatches.length
  ? `Found ${eligibleMatches.length} unsent match(es) that have entered the ${upperBound}h pre-match reporting threshold, including any missed 24h-window backfills.`
  : nextMatch
    ? `No unsent match is inside the ${lowerBound}-${upperBound} hour window. Nearest future match is ${nextMatch.homeCode} vs ${nextMatch.awayCode} at ${nextMatch.kickoffBjt} BJT (${nextMatch.deltaHours}h away).`
    : "No future matches with confirmed teams are available from the official schedule feed.";

const runSummary = {
  runAtUtc: now.toISOString(),
  runAtBjt: formatBjt(now),
  officialScheduleSource: FIFA_SCHEDULE_URL,
  reliableScoreSource: LIVESCORE_FIXTURES_URL,
  windowHours: {
    target: WINDOW_HOURS,
    toleranceMinutes: WINDOW_MINUTES,
    min: lowerBound,
    max: upperBound
  },
  sentReportCount: sentReports.length,
  eligibleCount: eligibleMatches.length,
  eligibleMatches,
  nextMatch,
  note
};

const history = Array.isArray(statusState?.history) ? statusState.history : [];
history.push(runSummary);

await Promise.all([
  writeJson(SENT_REPORTS_PATH, { reports: sentReports }),
  writeJson(STATUS_PATH, {
    latestRun: runSummary,
    history: history.slice(-HISTORY_LIMIT)
  }),
  writeJson(SNAPSHOT_PATH, {
    generatedAtUtc: now.toISOString(),
    generatedAtBjt: formatBjt(now),
    officialScheduleSource: FIFA_SCHEDULE_URL,
    reliableScoreSource: LIVESCORE_FIXTURES_URL,
    eligibleMatches,
    nextMatches: upcomingMatches.slice(0, 12)
  })
]);

console.log(JSON.stringify(runSummary, null, 2));
