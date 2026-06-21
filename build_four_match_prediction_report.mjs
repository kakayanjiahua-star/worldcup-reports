import fs from "node:fs/promises";

const FIFA_URL = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023";
const generatedAtBjt = "2026-06-22 00:28";

const teamZh = {
  ESP: "西班牙", KSA: "沙特", BEL: "比利时", IRN: "伊朗",
  URU: "乌拉圭", CPV: "佛得角", NZL: "新西兰", EGY: "埃及"
};

const predictions = {
  "ESP-KSA": {
    pick: "西班牙 5-0 沙特",
    short: "5-0",
    half: "3-0",
    probs: [99, 1, 0],
    xg: [4.75, 0.35],
    confidence: "高",
    tone: "teal",
    thesis: "赛中更新：FIFA 官方 API 显示第 25 分钟西班牙已 3-0 领先沙特，赛前 2-0 预测明显保守。现在比赛核心不再是胜负，而是西班牙是否继续扩大净胜球。",
    tactical: ["亚马尔早段进球打开低位防线，沙特 5-4-1 的禁区保护已被打穿", "西班牙边后卫持续压上，肋部传切和二点球会继续制造射门", "沙特若继续低位只能止损，若前压则会给西班牙更多身后空间"],
    risks: ["3-0 后西班牙可能在下半场控制体能，进球速度下降", "沙特若通过定位球或反击追回一球，比分可能变成 4-1/5-1"],
    timeline: ["0-25：官方实时比分西班牙 3-0，比赛已进入大胜轨道", "26-45：西班牙大概率继续控球，沙特目标转为避免半场崩盘", "46-70：若西班牙不大规模收力，第四球概率很高", "71-90：净胜球管理和轮换优先，终场倾向 5-0，防 5-1"],
    sources: ["FIFA 官方 API：25' 西班牙 3-0 沙特，MatchStatus=live", "Guardian 直播确认 Lamine Yamal 早段进球", "赛前 FanDuel/Lineups/NYPost 均显示西班牙为强热门"]
  },
  "BEL-IRN": {
    pick: "比利时 2-1 伊朗",
    short: "2-1",
    half: "1-0",
    probs: [61, 23, 16],
    xg: [1.75, 0.95],
    confidence: "中",
    tone: "orange",
    thesis: "比利时个人能力和边路爆点更强，但伊朗首轮 2-2 展示了韧性，比赛不像赔率那样单向。",
    tactical: ["Doku/边锋一对一会持续制造推进", "伊朗会在中后场保持密度，伺机打反击和二点球", "比利时若领先后退守，伊朗有追回一球的空间"],
    risks: ["比利时首轮 1-1 埃及，防守转换仍有漏洞", "伊朗对抗和定位球能把比赛拖进混战"],
    timeline: ["0-15：比利时边路试探，伊朗压低阵线", "16-45：比利时靠边路爆点或中锋支点领先", "46-65：伊朗提高反击人数，比赛进入对攻片段", "66-90：比利时换人维持冲击，伊朗有晚段进球机会"],
    sources: ["FanDuel 摘要给出 Belgium ML -250", "Kalshi 市场显示比利时约 68% 90 分钟胜出"]
  },
  "URU-CPV": {
    pick: "乌拉圭 1-0 佛得角",
    short: "1-0",
    half: "0-0",
    probs: [58, 27, 15],
    xg: [1.45, 0.60],
    confidence: "中",
    tone: "magenta",
    thesis: "乌拉圭需要从 1-1 沙特的慢热里提速，但佛得角刚 0-0 西班牙，低位质量很硬；更像一场小比分强攻。",
    tactical: ["乌拉圭中前场压迫和二点球是主攻方向", "佛得角会继续用低位+门将表现拖节奏", "定位球和远射可能比阵地战更快破局"],
    risks: ["佛得角已证明能把强队拉进低比分泥潭", "乌拉圭若前 30 分钟效率低，平局概率明显抬升"],
    timeline: ["0-30：乌拉圭控场但破密防困难", "31-60：定位球、二点球和边路传中成为关键", "61-80：乌拉圭靠强度压出制胜球", "81-90：佛得角压上有限，乌拉圭守住小胜"],
    sources: ["FOX 指出双方首次成年国家队交手", "多家预览强调佛得角首轮防守表现"]
  },
  "NZL-EGY": {
    pick: "新西兰 1-2 埃及",
    short: "1-2",
    half: "0-1",
    probs: [22, 27, 51],
    xg: [1.05, 1.65],
    confidence: "中",
    tone: "blue",
    thesis: "新西兰能用身体和直接打法制造进球，但埃及整体攻击质量更高，Salah 牵制会打开第二攻击点。",
    tactical: ["新西兰依赖 Wood 支点、定位球和第二落点", "埃及会寻找右路/半空间提速机会", "两队首轮都能进球，本场双方进球概率最高"],
    risks: ["新西兰首轮 2-2 伊朗，说明其进攻并不低效", "埃及若早早领先，比赛可能变成防反而不是大开大合"],
    timeline: ["0-20：埃及控球更细，新西兰直接找前场支点", "21-45：埃及利用边路或半空间先手", "46-70：新西兰定位球扳回悬念", "71-90：埃及靠反击或二次进攻打入制胜球"],
    sources: ["Yahoo/ESPN odds 显示埃及为热门", "VSiN 看好埃及至少打入两球"]
  }
};

const sourceLinks = [
  ["FIFA 官方赛程", "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures"],
  ["FanDuel 西班牙/沙特", "https://www.fanduel.com/research/spain-vs-saudi-arabia-prediction-preview-picks-lineups-and-best-bets-world-cup-2026"],
  ["FanDuel 比利时/伊朗", "https://www.fanduel.com/research/belgium-vs-iran-world-cup-prediction-best-bets-props-and-picks-for-today-june-21"],
  ["FOX 乌拉圭/佛得角", "https://www.foxsports.com/stories/soccer/2026-world-cup-uruguay-cape-verde-odds-prediction-picks"],
  ["Guardian 今日赛程", "https://www.theguardian.com/football/2026/jun/21/how-to-watch-world-cup-spain-saudi-arabia-tv-streaming"],
  ["Kalshi 比利时/伊朗市场", "https://kalshi.com/markets/kxwcgame/world-cup-game/kxwcgame-26jun21beliri"],
  ["ESPN 新西兰/埃及赔率", "https://www.espn.com/soccer/odds/_/gameId/760452"],
  ["VSiN 新西兰/埃及", "https://vsin.com/soccer/egypt-vs-new-zealand-prediction-2026-fifa-world-cup-preview-and-pick/"]
];

function desc(v, fallback = "") {
  return v?.[0]?.Description ?? fallback;
}

function bjt(iso) {
  return new Date(new Date(iso).getTime() + 8 * 3600e3).toISOString().replace("T", " ").slice(0, 16);
}

function flag(code) {
  return `https://api.fifa.com/api/v3/picture/flags-sq-4/${encodeURIComponent(code)}`;
}

function team(code) {
  return `${teamZh[code] ?? code} ${code}`;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function teamChip(code) {
  return `<span class="team-chip"><img src="${flag(code)}" alt="${esc(team(code))} flag"><b>${esc(team(code))}</b></span>`;
}

function probBar(probs) {
  return `<div class="probbar" style="grid-template-columns:${probs[0]}fr ${probs[1]}fr ${probs[2]}fr"><i></i><i></i><i></i></div>`;
}

function sourceList(items) {
  return items.map(s => `<li>${esc(s)}</li>`).join("");
}

function miniTimeline(items) {
  return items.map((s, i) => `<div class="phase"><span>${i + 1}</span><p>${esc(s)}</p></div>`).join("");
}

const fifa = await (await fetch(FIFA_URL)).json();
const targetIds = new Set(["400021483", "400021477", "400021487", "400021480"]);
const fixtures = fifa.Results
  .map(m => ({
    id: m.IdMatch,
    date: m.Date,
    kickoffBjt: bjt(m.Date),
    group: desc(m.GroupName).replace("Group ", ""),
    home: m.Home?.Abbreviation,
    away: m.Away?.Abbreviation,
    venue: desc(m.Stadium?.Name)
  }))
  .filter(m => targetIds.has(m.id))
  .sort((a, b) => new Date(a.date) - new Date(b.date));

const completed = fifa.Results
  .map(m => ({
    group: desc(m.GroupName).replace("Group ", ""),
    home: m.Home?.Abbreviation,
    away: m.Away?.Abbreviation,
    hs: m.Home?.Score,
    as: m.Away?.Score
  }))
  .filter(m => Number.isFinite(m.hs) && Number.isFinite(m.as));

function table(group) {
  const rows = new Map();
  function get(code) {
    if (!rows.has(code)) rows.set(code, { code, p: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
    return rows.get(code);
  }
  for (const m of completed.filter(x => x.group === group)) {
    const h = get(m.home), a = get(m.away);
    h.p++; a.p++; h.gf += m.hs; h.ga += m.as; a.gf += m.as; a.ga += m.hs;
    h.gd = h.gf - h.ga; a.gd = a.gf - a.ga;
    if (m.hs > m.as) h.pts += 3;
    else if (m.hs < m.as) a.pts += 3;
    else { h.pts++; a.pts++; }
  }
  return [...rows.values()].sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf);
}

const matchCards = fixtures.map(f => {
  const p = predictions[`${f.home}-${f.away}`];
  return `<article class="match-card ${p.tone}">
    <div class="match-meta"><span>Group ${esc(f.group)}</span><span>${esc(f.kickoffBjt)}</span></div>
    <div class="teams">${teamChip(f.home)}<strong>${esc(p.short)}</strong>${teamChip(f.away)}</div>
    ${probBar(p.probs)}
    <div class="prob-labels"><span>${p.probs[0]}% 主胜</span><span>${p.probs[1]}% 平</span><span>${p.probs[2]}% 客胜</span></div>
    <p>${esc(p.thesis)}</p>
  </article>`;
}).join("");

const detailSlides = fixtures.map((f, index) => {
  const p = predictions[`${f.home}-${f.away}`];
  return `<section class="slide detail ${p.tone}">
    <div class="kicker">Match ${index + 1} · Group ${esc(f.group)}</div>
    <h2>${esc(team(f.home))} vs ${esc(team(f.away))}</h2>
    <div class="detail-head">
      ${teamChip(f.home)}
      <div class="score-box"><b>${esc(p.short)}</b><span>预测比分</span></div>
      ${teamChip(f.away)}
    </div>
    <div class="detail-grid">
      <div class="panel"><b>90分钟概率</b>${probBar(p.probs)}<div class="prob-labels"><span>${p.probs[0]}%</span><span>${p.probs[1]}%</span><span>${p.probs[2]}%</span></div></div>
      <div class="panel"><b>预期进球</b><div class="xg"><span>${f.home} ${p.xg[0]}</span><span>${f.away} ${p.xg[1]}</span></div><small>半场倾向：${esc(p.half)} · 置信：${esc(p.confidence)}</small></div>
    </div>
    <div class="panel"><b>战术判断</b><ul>${p.tactical.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="panel"><b>比赛进程</b><div class="timeline">${miniTimeline(p.timeline)}</div></div>
    <div class="panel risk"><b>反方风险</b><ul>${p.risks.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="page-no">${String(index + 2).padStart(2, "0")} / 单场</div>
  </section>`;
}).join("");

const tableHtml = ["G", "H"].map(g => `<div class="table-card"><h3>Group ${g}</h3><table><thead><tr><th>队</th><th>赛</th><th>进失</th><th>净</th><th>分</th></tr></thead><tbody>${table(g).map(r => `<tr><td>${teamChip(r.code)}</td><td>${r.p}</td><td>${r.gf}:${r.ga}</td><td>${r.gd > 0 ? "+" : ""}${r.gd}</td><td>${r.pts}</td></tr>`).join("")}</tbody></table></div>`).join("");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>四场世界杯赛前预测包</title>
  <style>
    :root{--bg:#071a3a;--ink:#071a3a;--muted:#657184;--line:#d9e2ef;--teal:#08d4c7;--orange:#ff7a1a;--magenta:#c21771;--blue:#246bfe;--gold:#ffd84d;--green:#19a974}
    *{box-sizing:border-box}html{scroll-snap-type:y mandatory;background:#071a3a}body{margin:0;font-family:"Microsoft YaHei","PingFang SC","Segoe UI",Arial,sans-serif;color:var(--ink);background:linear-gradient(145deg,#071a3a,#0b2a66 58%,#07111f)}
    .deck{width:min(100%,760px);margin:0 auto;background:#eef5fb}.slide{min-height:100svh;scroll-snap-align:start;padding:30px 24px 36px;display:flex;flex-direction:column;gap:16px;position:relative;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.16)}
    .hero,.detail,.dark{color:#fff;background:linear-gradient(160deg,#071a3a,#0b2a66)}.hero:before,.detail:before,.dark:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:42px 42px}.slide>*{position:relative}
    .light{background:linear-gradient(180deg,#f8fbff,#eef5fb)}h1,h2,h3,p{margin:0}h1{font-size:46px;line-height:1.04}h2{font-size:30px;line-height:1.14}h3{font-size:20px}p{font-size:14px;line-height:1.58}.muted{color:rgba(255,255,255,.76)}
    .kicker{width:max-content;padding:7px 12px;border-radius:999px;background:rgba(8,212,199,.16);font-size:12px;font-weight:950;letter-spacing:.06em}.hero-note{padding:14px;border-left:4px solid var(--teal);background:rgba(255,255,255,.1);border-radius:0 8px 8px 0;color:rgba(255,255,255,.82)}
    .overview{display:grid;grid-template-columns:1fr 1fr;gap:12px}.match-card{background:#fff;color:var(--ink);border-radius:10px;padding:14px;border-left:8px solid var(--tone);box-shadow:0 14px 34px rgba(2,6,23,.24);display:grid;gap:11px}.teal{--tone:var(--teal)}.orange{--tone:var(--orange)}.magenta{--tone:var(--magenta)}.blue{--tone:var(--blue)}
    .match-meta{display:flex;justify-content:space-between;gap:10px;color:var(--muted);font-size:12px;font-weight:900}.teams{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center}.teams strong{font-size:28px;color:var(--ink);text-align:center}.team-chip{display:inline-flex;align-items:center;gap:8px;min-width:0}.team-chip img{width:30px;height:30px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 2px #fff,0 2px 8px rgba(7,26,58,.2)}.team-chip b{font-size:15px;line-height:1.15}
    .probbar{display:grid;height:15px;border-radius:999px;overflow:hidden;background:#dbe6f3}.probbar i:nth-child(1){background:var(--tone)}.probbar i:nth-child(2){background:#a8b6c8}.probbar i:nth-child(3){background:#071a3a}.prob-labels{display:flex;justify-content:space-between;color:var(--muted);font-size:12px;font-weight:900}
    .detail-head{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center;background:#fff;color:var(--ink);border-radius:10px;padding:16px;box-shadow:0 18px 42px rgba(2,6,23,.24)}.score-box{text-align:center}.score-box b{display:block;font-size:44px;line-height:1}.score-box span{display:inline-block;margin-top:6px;padding:6px 9px;border-radius:999px;background:var(--gold);font-size:12px;font-weight:950}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.panel{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:14px;backdrop-filter:blur(8px)}.panel b{display:block;margin-bottom:9px}.panel ul{margin:0;padding-left:18px;color:rgba(255,255,255,.82);font-size:14px;line-height:1.55}.xg{display:grid;gap:8px}.xg span{display:block;padding:10px;border-radius:6px;background:rgba(255,255,255,.12);font-weight:950}.panel small{display:block;margin-top:9px;color:rgba(255,255,255,.72)}
    .timeline{display:grid;gap:8px}.phase{display:grid;grid-template-columns:34px 1fr;gap:9px}.phase span{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--tone);font-weight:950}.phase p{color:rgba(255,255,255,.82)}.risk{border-left:5px solid var(--gold)}
    .tables{display:grid;grid-template-columns:1fr 1fr;gap:12px}.table-card{background:#fff;border-radius:10px;padding:14px;border:1px solid var(--line)}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:9px 7px;border-bottom:1px solid var(--line);text-align:left}th{background:#071a3a;color:#fff}.sources{display:grid;gap:9px}.sources a{display:block;background:#fff;border-left:6px solid var(--teal);border-radius:8px;padding:12px;color:#071a3a;text-decoration:none;font-weight:900}.page-no{position:absolute;right:22px;bottom:16px;font-size:12px;font-weight:900;opacity:.5}
    @media(max-width:560px){.slide{padding:24px 18px}.overview,.detail-grid,.tables{grid-template-columns:1fr}.teams,.detail-head{grid-template-columns:1fr}.teams strong{text-align:left}h1{font-size:38px}h2{font-size:27px}}
  </style>
</head>
<body>
<main class="deck">
  <section class="slide hero">
    <div class="kicker">World Cup · Four-match Prediction Pack</div>
    <h1>今晚四场，可以开始预测了</h1>
    <p class="muted">生成时间：${generatedAtBjt} 北京时间。所有概率均为 90 分钟含伤停补时，不含加时和点球。</p>
    <div class="overview">${matchCards}</div>
    <p class="hero-note">四场共同背景：G/H 两组首轮全部平局，第二轮会直接决定出线主动权。强队不只是要赢，还要争净胜球；弱队拿到 1 分就可能打开第三名通道。</p>
    <div class="page-no">01 / 总览</div>
  </section>
  ${detailSlides}
  <section class="slide light">
    <div class="kicker">Group Context</div>
    <h2>G/H 组形势：全员 1 分，第二轮价值很高</h2>
    <div class="tables">${tableHtml}</div>
    <div class="page-no">06 / 小组形势</div>
  </section>
  <section class="slide light">
    <div class="kicker">Sources</div>
    <h2>信息源与口径</h2>
    <p>本报告综合官方赛程、即时赔率/市场、赛前预览和首轮小组结果；外部赔率用于概率校准，不构成投注建议。</p>
    <div class="sources">${sourceLinks.map(([label, url]) => `<a href="${esc(url)}">${esc(label)}</a>`).join("")}</div>
    <div class="page-no">07 / 来源</div>
  </section>
</main>
</body>
</html>`;

const outHtml = "四场世界杯赛前预测包.html";
const outJson = "four_match_prediction_pack.json";
await fs.writeFile(outHtml, html, "utf8");
await fs.writeFile(outJson, JSON.stringify({ generatedAtBjt, fixtures, predictions, sourceLinks }, null, 2), "utf8");

let sent = {};
try {
  sent = JSON.parse(await fs.readFile("sent_pre_match_reports.json", "utf8"));
} catch {
  sent = {};
}
for (const f of fixtures) {
  sent[f.id] = {
    matchId: f.id,
    match: `${f.home}-${f.away}`,
    kickoffBjt: f.kickoffBjt,
    reportPath: outHtml,
    pushedAtBjt: generatedAtBjt,
    mode: "manual-four-match-pack"
  };
}
await fs.writeFile("sent_pre_match_reports.json", JSON.stringify(sent, null, 2), "utf8");

console.log(`Wrote ${outHtml} for ${fixtures.length} matches.`);
