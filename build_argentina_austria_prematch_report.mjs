import fs from "node:fs/promises";

const FIFA_URL = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023";
const MATCH_ID = "400021494";
const generatedAtBjt = bjt(new Date().toISOString());
const scheduledPushBjt = "2026-06-22 01:00:00";
const localHtml = "阿根廷vs奥地利赛前24小时补发报告.html";
const localJson = "argentina_austria_prematch_snapshot.json";

const sourceLinks = [
  ["FIFA 官方比赛中心", "https://www.fifa.com/en/match-centre/match/17/285023/289273/400021494"],
  ["FIFA 官方赛程 API", FIFA_URL],
  ["RotoWire 预计阵容/伤停/赔率", "https://www.rotowire.com/soccer/article/argentina-vs-austria-preview-predicted-lineups-team-news-tactical-analysis-2026-world-cup-group-j-119066"],
  ["Sports Illustrated 预计首发", "https://www.si.com/soccer/argentina-vs-austria-world-cup-preview-predictions-lineups-6-22-26"],
  ["Covers 盘口/天气/伤停", "https://www.covers.com/world-cup/argentina-vs-austria-prediction-top-picks-odds-today-6-22-2026"],
  ["Guardian 赛前现场报道", "https://www.theguardian.com/football/2026/jun/22/lionel-messi-argentina-austria-world-cup"],
  ["SB Nation G组/J组出线情景", "https://www.sbnation.com/fifa-world-cup/1119405/world-cup-2026-scenarios-argentina-messi"],
  ["Arlington 官方赛事页", "https://www.arlingtontx.gov/Community-Calendar/World-Cup-Events/Argentina-vs-Austria"],
  ["NWS Arlington 天气", "https://forecast.weather.gov/MapClick.php?lat=32.69&lon=-97.13"]
];

const model = {
  probabilities: { argentina: 64, draw: 21, austria: 15 },
  marketNormalized: { argentina: 62, draw: 23, austria: 15 },
  xg: { argentina: 1.95, austria: 0.88 },
  pick: "阿根廷 2-0 奥地利",
  confidence: "中高",
  scoreDistribution: [
    ["2-0", 17], ["2-1", 15], ["1-0", 13], ["3-1", 10],
    ["1-1", 9], ["3-0", 8], ["0-0", 5], ["1-2", 4]
  ],
  thesis: "补发结论：这场本应在北京时间 6 月 22 日 01:00 推送。阿根廷首轮 3-0 完胜阿尔及利亚，奥地利 3-1 击败约旦，两队同积 3 分；胜者大概率锁定 32 强席位并拿到小组头名主动权。模型倾向阿根廷控球压制，奥地利高压能制造前 25 分钟的不稳定，但高位身后空间会被 Messi、Alvarez 和中场直塞反复利用。",
  risks: [
    "奥地利 PPDA 和前场压迫强度靠前，若抢到高位失误，比赛会从 2-0 变成 2-1 或 1-1。",
    "阿根廷若为了控制体能而降低节奏，进球数会低于市场对大球的预期。",
    "右后卫伤停变量集中：Montiel 缺阵或保护性轮换、Posch 伤情，会改变两队边路对抗。",
    "如果 Jordan vs Algeria 的结果压力被实时传导，本场末段风险偏好可能下降。"
  ]
};

const projectedLineups = {
  argentina: {
    shape: "4-3-3 / 控球时 3-2-5",
    players: ["E. Martinez", "Molina", "Romero", "L. Martinez", "Medina", "De Paul", "Mac Allister", "Enzo Fernandez", "N. Gonzalez", "Messi", "Julian Alvarez"],
    notes: ["Montiel 伤情使 Molina 更可能首发", "Tagliafico 小腿问题偏深度影响", "Alvarez 有机会替代 Lautaro 提供更强冲刺"]
  },
  austria: {
    shape: "4-2-3-1 / 高位压迫",
    players: ["A. Schlager", "Laimer", "Lienhart", "Alaba", "Mwene", "Seiwald", "X. Schlager", "Schmid", "Chukwuemeka", "Sabitzer", "Kalajdzic"],
    notes: ["Posch 下颌伤势存疑，Laimer 可能回撤右后卫", "Sabitzer 和 Schmid 是反击第一传/第二点核心", "Arnautovic 可能作为替补支点改变禁区对抗"]
  }
};

function desc(v, fallback = "") {
  return v?.[0]?.Description ?? fallback;
}

function bjt(iso) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date(iso)).replaceAll("/", "-");
}

function flag(code) {
  return `https://api.fifa.com/api/v3/picture/flags-sq-4/${encodeURIComponent(code)}`;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function teamChip(code, name) {
  return `<span class="team-chip"><img src="${flag(code)}" alt="${esc(name)} flag"><b>${esc(name)}</b><em>${esc(code)}</em></span>`;
}

function probBar(values) {
  return `<div class="probbar" style="grid-template-columns:${values.argentina}fr ${values.draw}fr ${values.austria}fr"><i></i><i></i><i></i></div>`;
}

function list(items) {
  return items.map((item) => `<li>${esc(item)}</li>`).join("");
}

function table(rows) {
  return rows.map((r) => `<tr><td>${teamChip(r.code, r.name)}</td><td>${r.played}</td><td>${r.gf}:${r.ga}</td><td>${r.gd > 0 ? "+" : ""}${r.gd}</td><td>${r.points}</td></tr>`).join("");
}

function scoreHeat(rows) {
  const max = Math.max(...rows.map(([, pct]) => pct));
  return rows.map(([score, pct]) => `<div class="heat-row"><span>${score}</span><i style="width:${Math.round((pct / max) * 100)}%"></i><b>${pct}%</b></div>`).join("");
}

const fifa = await (await fetch(FIFA_URL, {
  headers: { "user-agent": "codex-worldcup-pre-match-monitor/1.0" }
})).json();

const match = fifa.Results.find((item) => String(item.IdMatch) === MATCH_ID);
if (!match) throw new Error(`Missing match ${MATCH_ID} from FIFA feed`);

const completedGroupMatches = fifa.Results
  .filter((item) => desc(item.GroupName) === "Group J")
  .filter((item) => Number.isFinite(item.Home?.Score) && Number.isFinite(item.Away?.Score));

const rows = new Map();
function row(code, name) {
  if (!rows.has(code)) rows.set(code, { code, name, played: 0, gf: 0, ga: 0, gd: 0, points: 0 });
  return rows.get(code);
}

for (const item of completedGroupMatches) {
  const home = row(item.Home.Abbreviation, item.Home.ShortClubName);
  const away = row(item.Away.Abbreviation, item.Away.ShortClubName);
  home.played += 1; away.played += 1;
  home.gf += item.Home.Score; home.ga += item.Away.Score;
  away.gf += item.Away.Score; away.ga += item.Home.Score;
  home.gd = home.gf - home.ga; away.gd = away.gf - away.ga;
  if (item.Home.Score > item.Away.Score) home.points += 3;
  else if (item.Home.Score < item.Away.Score) away.points += 3;
  else { home.points += 1; away.points += 1; }
}

const groupTable = [...rows.values()].sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
const snapshot = {
  generatedAtBjt,
  reportType: "backfill-missed-24h-window",
  scheduledPushBjt,
  match: {
    matchId: MATCH_ID,
    competition: desc(match.CompetitionName),
    stage: desc(match.StageName),
    group: desc(match.GroupName),
    kickoffUtc: match.Date,
    kickoffBjt: bjt(match.Date),
    venue: desc(match.Stadium?.Name),
    city: desc(match.Stadium?.CityName),
    referee: desc(match.Officials?.find((o) => o.OfficialType === 1)?.Name),
    home: { code: match.Home.Abbreviation, name: match.Home.ShortClubName },
    away: { code: match.Away.Abbreviation, name: match.Away.ShortClubName }
  },
  recentResults: completedGroupMatches.map((item) => ({
    matchId: String(item.IdMatch),
    kickoffBjt: bjt(item.Date),
    match: `${item.Home.Abbreviation} ${item.Home.Score}-${item.Away.Score} ${item.Away.Abbreviation}`,
    venue: desc(item.Stadium?.Name)
  })),
  groupTable,
  projectedLineups,
  weatherAndVenue: {
    localWeather: "NWS Arlington morning conditions around 77-83°F, high humidity; AccuWeather June normals/search snippets indicate 92-98°F highs.",
    venueNote: "AT&T/Dallas Stadium venue context reduces open-air weather weighting; verify final roof operation near kickoff."
  },
  market: {
    oddsSample: "RotoWire/Covers samples around Argentina -170 to -223, draw +317 to +340, Austria +567 to +700; total 2.5 near even money.",
    normalizedImplied: model.marketNormalized
  },
  model,
  sources: sourceLinks
};

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>阿根廷 vs 奥地利 赛前24小时补发报告</title>
  <style>
    :root{--navy:#071a3a;--cyan:#00c8c8;--gold:#ffd84d;--red:#bb1234;--sky:#dff4ff;--ink:#071a3a;--muted:#66758c;--line:#d9e5ef}
    *{box-sizing:border-box}html{background:#071a3a;scroll-snap-type:y proximity}body{margin:0;font-family:"Microsoft YaHei","PingFang SC","Segoe UI",Arial,sans-serif;background:linear-gradient(145deg,#071a3a,#0b2f6c 58%,#07111f);color:var(--ink)}
    .deck{width:min(100%,760px);margin:0 auto;background:#f4f8fc}.slide{min-height:100svh;padding:28px 22px 34px;display:flex;flex-direction:column;gap:16px;position:relative;overflow:hidden;scroll-snap-align:start}.dark{color:#fff;background:radial-gradient(circle at 20% 0%,rgba(0,200,200,.32),transparent 34%),linear-gradient(150deg,#071a3a,#0b2f6c)}.dark:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:40px 40px}.slide>*{position:relative}
    h1,h2,h3,p{margin:0}h1{font-size:44px;line-height:1.04}h2{font-size:30px;line-height:1.15}h3{font-size:20px}p,li{font-size:14px;line-height:1.58}.kicker{width:max-content;max-width:100%;padding:7px 11px;border-radius:999px;background:rgba(0,200,200,.18);font-weight:950;font-size:12px;letter-spacing:.04em}.sub{color:rgba(255,255,255,.78)}
    .teams{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center}.team-chip{display:inline-flex;align-items:center;gap:9px;min-width:0}.team-chip img{width:38px;height:38px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 2px #fff,0 8px 18px rgba(0,0,0,.2)}.team-chip b{font-size:18px}.team-chip em{font-style:normal;color:var(--muted);font-weight:900}.dark .team-chip em{color:rgba(255,255,255,.64)}.versus{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:var(--gold);color:#071a3a;font-weight:950}
    .hero-card,.panel{background:#fff;border:1px solid var(--line);border-radius:10px;padding:15px;box-shadow:0 16px 36px rgba(2,6,23,.18)}.dark .hero-card,.dark .panel{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);color:#fff;backdrop-filter:blur(8px)}.meta{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.meta div{padding:11px;border-radius:8px;background:#edf5fb}.dark .meta div{background:rgba(255,255,255,.12)}.meta b{display:block;font-size:12px;color:var(--muted);margin-bottom:4px}.dark .meta b{color:rgba(255,255,255,.66)}
    .probbar{display:grid;height:18px;border-radius:999px;overflow:hidden;background:#dce7f1}.probbar i:nth-child(1){background:#4cc9f0}.probbar i:nth-child(2){background:#aab8c8}.probbar i:nth-child(3){background:#bb1234}.labels{display:flex;justify-content:space-between;font-size:12px;font-weight:950;color:var(--muted);gap:8px}.dark .labels{color:rgba(255,255,255,.72)}.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.big-num{font-size:36px;font-weight:950;line-height:1}.tag{display:inline-block;padding:5px 9px;border-radius:999px;background:var(--gold);font-weight:950;font-size:12px;color:#071a3a}
    .pitch{height:360px;border:2px solid rgba(255,255,255,.48);border-radius:14px;background:linear-gradient(90deg,rgba(16,130,91,.92),rgba(22,154,109,.92));position:relative;overflow:hidden}.pitch:before{content:"";position:absolute;left:50%;top:0;bottom:0;border-left:2px solid rgba(255,255,255,.48)}.circle{position:absolute;left:50%;top:50%;width:106px;height:106px;border:2px solid rgba(255,255,255,.48);border-radius:50%;transform:translate(-50%,-50%)}.player{position:absolute;transform:translate(-50%,-50%);padding:5px 7px;border-radius:999px;background:#fff;color:#071a3a;font-size:11px;font-weight:950;box-shadow:0 6px 14px rgba(0,0,0,.22)}.aut{background:#bb1234;color:#fff}.arrow{position:absolute;height:3px;background:var(--gold);transform-origin:left center}.arrow:after{content:"";position:absolute;right:-1px;top:-4px;border-left:8px solid var(--gold);border-top:5px solid transparent;border-bottom:5px solid transparent}
    table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:9px 7px;border-bottom:1px solid var(--line);text-align:left}th{background:#071a3a;color:#fff}td .team-chip img{width:26px;height:26px}td .team-chip b{font-size:13px}.heat{display:grid;gap:8px}.heat-row{display:grid;grid-template-columns:46px 1fr 38px;gap:8px;align-items:center}.heat-row i{display:block;height:18px;border-radius:999px;background:linear-gradient(90deg,var(--cyan),var(--gold))}.heat-row span,.heat-row b{font-size:13px;font-weight:950}.source-list a{display:block;color:#071a3a;background:#fff;border-left:6px solid var(--cyan);padding:11px;border-radius:8px;text-decoration:none;font-weight:900;margin-bottom:8px}.page-no{position:absolute;right:20px;bottom:14px;font-size:12px;font-weight:950;opacity:.48}
    @media(max-width:560px){.slide{padding:23px 17px}.teams,.grid2,.grid3,.meta{grid-template-columns:1fr}h1{font-size:36px}h2{font-size:26px}.versus{width:52px;height:52px}.pitch{height:320px}.team-chip b{font-size:16px}}
  </style>
</head>
<body>
<main class="deck">
  <section class="slide dark">
    <div class="kicker">Backfill · Missed 24h push window</div>
    <h1>阿根廷 vs 奥地利<br>赛前预测补发</h1>
    <p class="sub">本报告本应在 ${scheduledPushBjt} BJT 推送；当前补发时间 ${generatedAtBjt} BJT。比赛仍未开赛，因此按赛前报告补发。</p>
    <div class="hero-card teams">
      ${teamChip("ARG", "阿根廷")}
      <div class="versus">VS</div>
      ${teamChip("AUT", "奥地利")}
    </div>
    <div class="meta">
      <div><b>开球</b>${esc(snapshot.match.kickoffBjt)} BJT</div>
      <div><b>地点</b>${esc(snapshot.match.venue)} · ${esc(snapshot.match.city)}</div>
      <div><b>裁判</b>${esc(snapshot.match.referee)}</div>
      <div><b>报告类型</b>错过 24 小时窗口补发</div>
    </div>
    <div class="page-no">01 / 结论</div>
  </section>

  <section class="slide">
    <div class="kicker">Clear Call</div>
    <h2>${esc(model.pick)}</h2>
    <p>${esc(model.thesis)}</p>
    <div class="panel">
      <h3>90 分钟概率</h3>
      ${probBar(model.probabilities)}
      <div class="labels"><span>阿根廷 ${model.probabilities.argentina}%</span><span>平局 ${model.probabilities.draw}%</span><span>奥地利 ${model.probabilities.austria}%</span></div>
    </div>
    <div class="grid3">
      <div class="panel"><b class="big-num">${model.xg.argentina}</b><span>阿根廷 xG</span></div>
      <div class="panel"><b class="big-num">${model.xg.austria}</b><span>奥地利 xG</span></div>
      <div class="panel"><b class="big-num">${model.confidence}</b><span>置信度</span></div>
    </div>
    <div class="page-no">02 / 模型</div>
  </section>

  <section class="slide dark">
    <div class="kicker">Tactical Board</div>
    <h2>战术对位：高压身后 vs Messi 接球区</h2>
    <div class="pitch">
      <div class="circle"></div>
      <span class="player" style="left:14%;top:50%">E.Martinez</span>
      <span class="player" style="left:29%;top:24%">Molina</span>
      <span class="player" style="left:28%;top:41%">Romero</span>
      <span class="player" style="left:28%;top:59%">L.Martinez</span>
      <span class="player" style="left:29%;top:76%">Medina</span>
      <span class="player" style="left:43%;top:34%">De Paul</span>
      <span class="player" style="left:43%;top:50%">Enzo</span>
      <span class="player" style="left:43%;top:66%">Mac Allister</span>
      <span class="player" style="left:59%;top:31%">Messi</span>
      <span class="player" style="left:64%;top:50%">Alvarez</span>
      <span class="player" style="left:58%;top:70%">Gonzalez</span>
      <span class="player aut" style="left:85%;top:50%">Schlager</span>
      <span class="player aut" style="left:70%;top:22%">Laimer</span>
      <span class="player aut" style="left:72%;top:40%">Lienhart</span>
      <span class="player aut" style="left:72%;top:60%">Alaba</span>
      <span class="player aut" style="left:70%;top:78%">Mwene</span>
      <span class="player aut" style="left:58%;top:42%">Seiwald</span>
      <span class="player aut" style="left:58%;top:58%">X.Schlager</span>
      <span class="player aut" style="left:45%;top:25%">Schmid</span>
      <span class="player aut" style="left:44%;top:50%">Chukwuemeka</span>
      <span class="player aut" style="left:45%;top:75%">Sabitzer</span>
      <span class="player aut" style="left:31%;top:50%">Kalajdzic</span>
      <span class="arrow" style="left:58%;top:31%;width:90px;transform:rotate(-15deg)"></span>
      <span class="arrow" style="left:45%;top:50%;width:100px;transform:rotate(180deg)"></span>
    </div>
    <div class="grid2">
      <div class="panel"><b>阿根廷进攻钥匙</b><ul>${list(["Messi 回撤吸出 Seiwald/X. Schlager 后，Alvarez 攻击中卫身后。", "Molina 右路推进会测试 Laimer 临时右后卫/边路保护。", "领先后转入控球，降低奥地利二次压迫收益。"])}</ul></div>
      <div class="panel"><b>奥地利反击钥匙</b><ul>${list(["Rangnick 高压要逼迫阿根廷后场向边线出球。", "Sabitzer 与 Schmid 抢到二点后第一时间找中锋。", "定位球由 Sabitzer/Alaba 主罚，是爆冷路径之一。"])}</ul></div>
    </div>
    <div class="page-no">03 / 战术图</div>
  </section>

  <section class="slide">
    <div class="kicker">Lineups & Fitness</div>
    <h2>预计阵容与伤停</h2>
    <div class="grid2">
      <div class="panel"><h3>阿根廷 · ${esc(projectedLineups.argentina.shape)}</h3><p>${esc(projectedLineups.argentina.players.join(" / "))}</p><ul>${list(projectedLineups.argentina.notes)}</ul></div>
      <div class="panel"><h3>奥地利 · ${esc(projectedLineups.austria.shape)}</h3><p>${esc(projectedLineups.austria.players.join(" / "))}</p><ul>${list(projectedLineups.austria.notes)}</ul></div>
    </div>
    <div class="panel"><h3>天气/场地</h3><p>Arlington 早间 NWS 条件约 77-83°F 且湿度高；AccuWeather 月度片段显示 6 月高温常在 92-98°F。Covers 写明比赛在 dome 场馆进行，但 FIFA API 的场馆 roof 字段并不支持强结论；模型只把天气作为到场、热身和补水节奏变量，场内影响权重较低。</p></div>
    <div class="page-no">04 / 阵容</div>
  </section>

  <section class="slide">
    <div class="kicker">Group J</div>
    <h2>小组形势：胜者接近锁定晋级</h2>
    <table><thead><tr><th>球队</th><th>赛</th><th>进失</th><th>净</th><th>分</th></tr></thead><tbody>${table(groupTable)}</tbody></table>
    <div class="panel"><p>首轮结果：阿根廷 3-0 阿尔及利亚，奥地利 3-1 约旦。SB Nation 的出线情景指出，本场胜者将锁定 32 强席位；若另一场 Jordan vs Algeria 结果配合，还可能提前拿到小组第一主动权。</p></div>
    <div class="page-no">05 / 积分</div>
  </section>

  <section class="slide">
    <div class="kicker">Score Heat</div>
    <h2>比分分布与反方风险</h2>
    <div class="panel heat">${scoreHeat(model.scoreDistribution)}</div>
    <div class="panel"><h3>反方风险</h3><ul>${list(model.risks)}</ul></div>
    <div class="panel"><h3>盘口/市场校准</h3><p>赔率样本显示阿根廷约 -170 到 -223，平局约 +317 到 +340，奥地利约 +567 到 +700；归一化后约为阿根廷 62%、平局 23%、奥地利 15%。模型在此基础上略上调阿根廷到 64%，原因是奥地利右路伤情和高位身后空间。</p></div>
    <div class="page-no">06 / 风险</div>
  </section>

  <section class="slide">
    <div class="kicker">Sources</div>
    <h2>来源</h2>
    <p>本报告为补发，不使用赛后信息；所有链接均为赛前或官方赛程/场馆/天气来源。</p>
    <div class="source-list">${sourceLinks.map(([label, url]) => `<a href="${esc(url)}">${esc(label)}</a>`).join("")}</div>
    <div class="page-no">07 / 来源</div>
  </section>
</main>
</body>
</html>`;

await fs.writeFile(localHtml, html, "utf8");
await fs.writeFile(localJson, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

let sent = { reports: [] };
try {
  sent = JSON.parse(await fs.readFile("sent_pre_match_reports.json", "utf8"));
} catch {
  sent = { reports: [] };
}

const reports = Array.isArray(sent.reports) ? sent.reports.filter((item) => String(item.matchId) !== MATCH_ID) : [];
reports.push({
  matchId: MATCH_ID,
  match: "ARG-AUT",
  kickoffBjt: snapshot.match.kickoffBjt,
  reportPath: localHtml,
  dataPath: localJson,
  pushedAtBjt: generatedAtBjt,
  scheduledPushBjt,
  mode: "backfill-missed-24h-window"
});

await fs.writeFile("sent_pre_match_reports.json", `${JSON.stringify({ reports }, null, 2)}\n`, "utf8");
console.log(`Wrote ${localHtml} and ${localJson}`);
