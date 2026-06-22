import fs from "node:fs/promises";

const FIFA_URL = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023";
const generatedAtBjt = bjt(new Date().toISOString());

const reports = [
  {
    matchId: "400021492",
    matchCode: "FRA-IRQ",
    title: "法国 vs 伊拉克",
    localHtml: "法国vs伊拉克赛前24小时补发报告.html",
    localJson: "france_iraq_prematch_snapshot.json",
    publicTarget: "france-iraq-prematch.html",
    scheduledPushBjt: "2026-06-22 05:00:00",
    pick: "法国 4-1 伊拉克",
    confidence: "高",
    probabilities: { home: 84, draw: 10, away: 6 },
    marketNormalized: { home: 86, draw: 8, away: 6 },
    xg: { home: 3.05, away: 0.78 },
    thesis: "法国首轮 3-1 击败塞内加尔，伊拉克 1-4 不敌挪威。盘口样本给到法国 -1200、总进球 3.5 附近，说明市场已经把这场定价成强弱分明。模型同意法国大胜方向，但保留伊拉克通过反击或法国边后卫身后拿到一球的风险。",
    lineups: {
      home: { shape: "4-2-3-1", players: "Maignan; Kounde, Upamecano, Saliba, Digne; Kone, Rabiot; Dembele, Olise, Barcola; Mbappe", injury: "无关键伤停" },
      away: { shape: "4-4-2", players: "Jalal Hassan; Ali, Hashim, Tahseen, Doski; Bayesh, Alammari, Ismail, Jasim; Alhamadi, Hussein", injury: "Alhamadi 存疑" }
    },
    tactics: ["法国左路 Barcola/Digne 与中路 Mbappe 的换位会持续冲击伊拉克低位。", "Olise 在 10 号位接二点球，能把伊拉克防线压在禁区前沿。", "伊拉克需要 Hussein 支点和 Jasim 反击第一脚，目标是偷到一次转换。"],
    risks: ["费城天气预报有雷暴风险，若节奏被中断，会压低法国连续进攻收益。", "法国首轮边路防守并非无懈可击，伊拉克若先进球会显著改变大胜盘口。"],
    scores: [["4-0", 15], ["3-0", 14], ["4-1", 13], ["3-1", 12], ["2-0", 10], ["5-1", 7], ["2-1", 6]],
    weather: "Covers 预告费城 80-84°F，并有赛前/赛中雷暴可能。",
    sources: [
      ["FIFA 官方比赛中心", "https://www.fifa.com/en/match-centre/match/17/285023/289273/400021492"],
      ["Covers 法国 vs 伊拉克", "https://www.covers.com/world-cup/france-vs-iraq-prediction-picks-odds-monday-6-22-2026"],
      ["SBG 盘口预览", "https://www.sbgglobal.eu/football-soccer/france-vs-iraq-2026-fifa-world-cup-betting-preview-best-bets/"],
      ["SB Nation Group I 情景", "https://www.sbnation.com/fifa-world-cup/1119397/world-cup-2026-france-norway-group-i-scenarios"]
    ]
  },
  {
    matchId: "400021491",
    matchCode: "NOR-SEN",
    title: "挪威 vs 塞内加尔",
    localHtml: "挪威vs塞内加尔赛前24小时补发报告.html",
    localJson: "norway_senegal_prematch_snapshot.json",
    publicTarget: "norway-senegal-prematch.html",
    scheduledPushBjt: "2026-06-22 08:00:00",
    pick: "挪威 1-1 塞内加尔",
    confidence: "中",
    probabilities: { home: 39, draw: 30, away: 31 },
    marketNormalized: { home: 40, draw: 28, away: 32 },
    xg: { home: 1.25, away: 1.18 },
    thesis: "挪威首轮 4-1 伊拉克，塞内加尔 1-3 法国。市场只给挪威小幅优势，Covers 直接看平局和小球。模型认为 Haaland 仍是最大单点，但 Koulibaly、Gueye 双后腰和 Senegal 的边路速度能显著降低挪威连续喂球质量。",
    lineups: {
      home: { shape: "4-3-3", players: "Nyland; Ryerson, Ajer, Heggem, Moller Wolfe; Aursnes, Berge, Odegaard; Nusa, Haaland, Sorloth", injury: "Moller Wolfe 大概率可出战" },
      away: { shape: "4-2-3-1", players: "Mendy; Diatta, Koulibaly, Niakhate, Diouf; P. Gueye, I. Gueye; Sarr, Camara, Mane; Jackson", injury: "无关键伤停" }
    },
    tactics: ["挪威会通过 Odegaard 左右转移，寻找 Haaland 与 Sorloth 的禁区对抗。", "塞内加尔中场人数更足，目标是切断 Odegaard 到 Haaland 的最后一传。", "Mane/Sarr 对挪威边后卫身后冲刺，是塞内加尔最稳定的反击出口。"],
    risks: ["Haaland 早早破门会迫使塞内加尔提高风险，比赛从小球变大球。", "雨战会降低地面推进质量，定位球和二点球权重上升。"],
    scores: [["1-1", 17], ["1-0", 12], ["0-1", 11], ["2-1", 10], ["0-0", 9], ["1-2", 8], ["2-2", 7]],
    weather: "Covers 预告 MetLife Stadium 有雨，开球时温度低于 70°F。",
    sources: [
      ["FIFA 官方比赛中心", "https://www.fifa.com/en/match-centre/match/17/285023/289273/400021491"],
      ["RotoWire 挪威 vs 塞内加尔", "https://www.rotowire.com/soccer/article/norway-vs-senegal-preview-predicted-lineups-team-news-tactical-analysis-2026-world-cup-group-i-119063"],
      ["Covers 挪威 vs 塞内加尔", "https://www.covers.com/world-cup/norway-vs-senegal-prediction-picks-odds-monday-6-22-2026"],
      ["SB Nation Group I 情景", "https://www.sbnation.com/fifa-world-cup/1119397/world-cup-2026-france-norway-group-i-scenarios"]
    ]
  },
  {
    matchId: "400021499",
    matchCode: "JOR-ALG",
    title: "约旦 vs 阿尔及利亚",
    localHtml: "约旦vs阿尔及利亚赛前24小时补发报告.html",
    localJson: "jordan_algeria_prematch_snapshot.json",
    publicTarget: "jordan-algeria-prematch.html",
    scheduledPushBjt: "2026-06-22 11:00:00",
    pick: "约旦 1-2 阿尔及利亚",
    confidence: "中",
    probabilities: { home: 19, draw: 24, away: 57 },
    marketNormalized: { home: 17, draw: 25, away: 58 },
    xg: { home: 0.92, away: 1.72 },
    thesis: "两队首轮都输球，约旦 1-3 奥地利，阿尔及利亚 0-3 阿根廷。市场给阿尔及利亚约 58-65% 胜率，模型略保守到 57%，因为约旦的 3-4-2-1 可以拖节奏，但 Algeria 的 Mahrez、Gouiri、Ait-Nouri 和中场推进质量更高。",
    lineups: {
      home: { shape: "3-4-2-1", players: "Abulaila; Abualnadi, Al-Arab, Nasib; Haddad, Al Rashdan, Al Rawabdeh, Abu Taha; Olwan, Fakhoury; Al Tamari", injury: "无关键伤停" },
      away: { shape: "3-4-2-1", players: "L. Zidane; Bensebaini, Mandi, Belaid; Belghali, Boudaoui, Zerrouki, Ait-Nouri; Mahrez, Gouiri, Maza", injury: "无关键伤停" }
    },
    tactics: ["约旦会压缩中路，把 Al Tamari 留作反击第一出口。", "阿尔及利亚三中卫能释放 Ait-Nouri 前插，左路传中和倒三角是主攻方向。", "Mahrez 内收后与 Gouiri/Maza 的小范围配合，是破密防关键。"],
    risks: ["阿尔及利亚若延续对阿根廷时的低效，比赛会被拖成 0-0/1-1。", "约旦定位球和 Tamari 单点突破足以制造冷门进球。"],
    scores: [["1-2", 16], ["0-2", 14], ["0-1", 12], ["1-1", 11], ["1-3", 9], ["0-0", 6], ["2-1", 5]],
    weather: "官方赛程显示 San Francisco Bay Area Stadium；湾区晚间条件通常比内陆温和，天气权重低于阵地战效率。",
    sources: [
      ["FIFA 官方比赛中心", "https://www.fifa.com/en/match-centre/match/17/285023/289273/400021499"],
      ["RotoWire 约旦 vs 阿尔及利亚", "https://www.rotowire.com/soccer/article/jordan-vs-algeria-preview-predicted-lineups-team-news-tactical-analysis-2026-world-cup-group-j-119061"],
      ["Covers 约旦 vs 阿尔及利亚", "https://www.covers.com/world-cup/jordan-vs-algeria-prediction-picks-odds-monday-6-22-2026"],
      ["SportsGambler 赔率", "https://www.sportsgambler.com/betting-tips/football/jordan-vs-algeria-prediction-lineups-odds-2026-06-22/"],
      ["SB Nation Group J 情景", "https://www.sbnation.com/fifa-world-cup/1119405/world-cup-2026-scenarios-argentina-messi"]
    ]
  }
];

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

function probBar(p) {
  return `<div class="probbar" style="grid-template-columns:${p.home}fr ${p.draw}fr ${p.away}fr"><i></i><i></i><i></i></div>`;
}

function list(items) {
  return items.map((item) => `<li>${esc(item)}</li>`).join("");
}

function scoreHeat(rows) {
  const max = Math.max(...rows.map(([, pct]) => pct));
  return rows.map(([score, pct]) => `<div class="heat-row"><span>${score}</span><i style="width:${Math.round((pct / max) * 100)}%"></i><b>${pct}%</b></div>`).join("");
}

function buildTable(matches, groupName) {
  const rows = new Map();
  const get = (code, name) => {
    if (!rows.has(code)) rows.set(code, { code, name, played: 0, gf: 0, ga: 0, gd: 0, points: 0 });
    return rows.get(code);
  };
  for (const item of matches.filter((m) => desc(m.GroupName) === groupName && Number.isFinite(m.Home?.Score) && Number.isFinite(m.Away?.Score))) {
    const h = get(item.Home.Abbreviation, item.Home.ShortClubName);
    const a = get(item.Away.Abbreviation, item.Away.ShortClubName);
    h.played += 1; a.played += 1;
    h.gf += item.Home.Score; h.ga += item.Away.Score;
    a.gf += item.Away.Score; a.ga += item.Home.Score;
    h.gd = h.gf - h.ga; a.gd = a.gf - a.ga;
    if (item.Home.Score > item.Away.Score) h.points += 3;
    else if (item.Home.Score < item.Away.Score) a.points += 3;
    else { h.points += 1; a.points += 1; }
  }
  return [...rows.values()].sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
}

function tableHtml(rows) {
  return rows.map((r) => `<tr><td>${teamChip(r.code, r.name)}</td><td>${r.played}</td><td>${r.gf}:${r.ga}</td><td>${r.gd > 0 ? "+" : ""}${r.gd}</td><td>${r.points}</td></tr>`).join("");
}

function htmlFor(report, snapshot) {
  const home = snapshot.match.home;
  const away = snapshot.match.away;
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(report.title)} 赛前24小时补发报告</title>
  <style>
    :root{--navy:#071a3a;--cyan:#00c8c8;--gold:#ffd84d;--red:#bb1234;--ink:#071a3a;--muted:#66758c;--line:#d9e5ef}
    *{box-sizing:border-box}body{margin:0;font-family:"Microsoft YaHei","PingFang SC","Segoe UI",Arial,sans-serif;background:linear-gradient(145deg,#071a3a,#0b2f6c 58%,#07111f);color:var(--ink)}.deck{width:min(100%,760px);margin:0 auto;background:#f6f9fd}.slide{min-height:100svh;padding:27px 22px 34px;display:flex;flex-direction:column;gap:15px;position:relative;overflow:hidden}.dark{color:#fff;background:linear-gradient(150deg,#071a3a,#0b2f6c)}.dark:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:40px 40px}.slide>*{position:relative}h1,h2,h3,p{margin:0}h1{font-size:42px;line-height:1.04}h2{font-size:29px;line-height:1.15}p,li{font-size:14px;line-height:1.58}.kicker{width:max-content;max-width:100%;padding:7px 11px;border-radius:999px;background:rgba(0,200,200,.18);font-weight:950;font-size:12px}.sub{color:rgba(255,255,255,.78)}
    .teams{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center}.team-chip{display:inline-flex;align-items:center;gap:9px;min-width:0}.team-chip img{width:36px;height:36px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 2px #fff,0 8px 18px rgba(0,0,0,.2)}.team-chip b{font-size:17px}.team-chip em{font-style:normal;color:var(--muted);font-weight:900}.dark .team-chip em{color:rgba(255,255,255,.64)}.versus{width:60px;height:60px;border-radius:50%;display:grid;place-items:center;background:var(--gold);color:#071a3a;font-weight:950}.panel{background:#fff;border:1px solid var(--line);border-radius:10px;padding:15px;box-shadow:0 15px 34px rgba(2,6,23,.15)}.dark .panel{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);color:#fff}.meta,.grid2,.grid3{display:grid;gap:11px}.meta{grid-template-columns:repeat(2,1fr)}.grid2{grid-template-columns:1fr 1fr}.grid3{grid-template-columns:repeat(3,1fr)}.meta div{padding:11px;border-radius:8px;background:rgba(255,255,255,.12)}.meta b{display:block;font-size:12px;color:rgba(255,255,255,.66)}
    .probbar{display:grid;height:18px;border-radius:999px;overflow:hidden;background:#dce7f1}.probbar i:nth-child(1){background:#4cc9f0}.probbar i:nth-child(2){background:#aab8c8}.probbar i:nth-child(3){background:#bb1234}.labels{display:flex;justify-content:space-between;font-size:12px;font-weight:950;color:var(--muted);gap:8px}.dark .labels{color:rgba(255,255,255,.72)}.big-num{font-size:34px;font-weight:950;line-height:1}.lane{display:grid;grid-template-columns:1fr 1fr;gap:10px}.lane div{min-height:130px;border-radius:10px;padding:12px;background:linear-gradient(180deg,#0d805a,#14996f);color:#fff;border:2px solid rgba(255,255,255,.45)}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:9px 7px;border-bottom:1px solid var(--line);text-align:left}th{background:#071a3a;color:#fff}td .team-chip img{width:25px;height:25px}td .team-chip b{font-size:13px}.heat{display:grid;gap:8px}.heat-row{display:grid;grid-template-columns:46px 1fr 38px;gap:8px;align-items:center}.heat-row i{display:block;height:18px;border-radius:999px;background:linear-gradient(90deg,var(--cyan),var(--gold))}.source-list a{display:block;color:#071a3a;background:#fff;border-left:6px solid var(--cyan);padding:11px;border-radius:8px;text-decoration:none;font-weight:900;margin-bottom:8px}.page-no{position:absolute;right:20px;bottom:14px;font-size:12px;font-weight:950;opacity:.48}
    @media(max-width:560px){.slide{padding:23px 17px}.teams,.grid2,.grid3,.meta,.lane{grid-template-columns:1fr}h1{font-size:35px}h2{font-size:25px}.versus{width:52px;height:52px}.team-chip b{font-size:16px}}
  </style>
</head>
<body><main class="deck">
  <section class="slide dark">
    <div class="kicker">Backfill · Missed 24h push window</div>
    <h1>${esc(report.title)}<br>赛前预测补发</h1>
    <p class="sub">应推送时间 ${report.scheduledPushBjt} BJT；补发时间 ${generatedAtBjt} BJT。比赛尚未开赛，按赛前报告补发。</p>
    <div class="panel teams">${teamChip(home.code, home.name)}<div class="versus">VS</div>${teamChip(away.code, away.name)}</div>
    <div class="meta"><div><b>开球</b>${esc(snapshot.match.kickoffBjt)} BJT</div><div><b>场地</b>${esc(snapshot.match.venue)}</div><div><b>小组</b>${esc(snapshot.match.group)}</div><div><b>预测</b>${esc(report.pick)}</div></div>
    <div class="page-no">01 / 结论</div>
  </section>
  <section class="slide">
    <div class="kicker">Model</div><h2>${esc(report.pick)}</h2><p>${esc(report.thesis)}</p>
    <div class="panel"><h3>90 分钟概率</h3>${probBar(report.probabilities)}<div class="labels"><span>${home.name} ${report.probabilities.home}%</span><span>平 ${report.probabilities.draw}%</span><span>${away.name} ${report.probabilities.away}%</span></div></div>
    <div class="grid3"><div class="panel"><b class="big-num">${report.xg.home}</b><span>${home.code} xG</span></div><div class="panel"><b class="big-num">${report.xg.away}</b><span>${away.code} xG</span></div><div class="panel"><b class="big-num">${report.confidence}</b><span>置信度</span></div></div>
    <div class="page-no">02 / 概率</div>
  </section>
  <section class="slide dark">
    <div class="kicker">Tactical Matchup</div><h2>战术对位</h2>
    <div class="lane"><div><h3>${esc(home.name)}</h3><ul>${list(report.tactics.slice(0,2))}</ul></div><div><h3>${esc(away.name)}</h3><ul>${list(report.tactics.slice(1))}</ul></div></div>
    <div class="panel"><h3>反方风险</h3><ul>${list(report.risks)}</ul></div>
    <div class="page-no">03 / 战术</div>
  </section>
  <section class="slide">
    <div class="kicker">Lineups</div><h2>预计阵容与伤停</h2>
    <div class="grid2"><div class="panel"><h3>${esc(home.name)} · ${esc(report.lineups.home.shape)}</h3><p>${esc(report.lineups.home.players)}</p><p><b>伤停：</b>${esc(report.lineups.home.injury)}</p></div><div class="panel"><h3>${esc(away.name)} · ${esc(report.lineups.away.shape)}</h3><p>${esc(report.lineups.away.players)}</p><p><b>伤停：</b>${esc(report.lineups.away.injury)}</p></div></div>
    <div class="panel"><h3>天气/场地</h3><p>${esc(report.weather)}</p></div>
    <div class="page-no">04 / 阵容</div>
  </section>
  <section class="slide">
    <div class="kicker">Group Context</div><h2>${esc(snapshot.match.group)} 形势</h2>
    <table><thead><tr><th>球队</th><th>赛</th><th>进失</th><th>净</th><th>分</th></tr></thead><tbody>${tableHtml(snapshot.groupTable)}</tbody></table>
    <div class="panel"><p>本场属于已错过 24 小时窗口的补发。小组结果和晋级情景按赛前可得信息记录，后续不以赛后比分覆盖本快照。</p></div>
    <div class="page-no">05 / 小组</div>
  </section>
  <section class="slide">
    <div class="kicker">Score Heat</div><h2>比分分布与市场</h2>
    <div class="panel heat">${scoreHeat(report.scores)}</div>
    <div class="panel"><p>盘口归一化约为：主胜 ${report.marketNormalized.home}% / 平 ${report.marketNormalized.draw}% / 客胜 ${report.marketNormalized.away}%。模型在盘口基础上叠加首轮表现、阵容和战术对位。</p></div>
    <div class="page-no">06 / 比分</div>
  </section>
  <section class="slide">
    <div class="kicker">Sources</div><h2>来源</h2>
    <div class="source-list">${report.sources.map(([label, url]) => `<a href="${esc(url)}">${esc(label)}</a>`).join("")}</div>
    <div class="page-no">07 / 来源</div>
  </section>
</main></body></html>`;
}

const fifa = await (await fetch(FIFA_URL, {
  headers: { "user-agent": "codex-worldcup-pre-match-monitor/1.0" }
})).json();

let sent = { reports: [] };
try {
  sent = JSON.parse(await fs.readFile("sent_pre_match_reports.json", "utf8"));
} catch {
  sent = { reports: [] };
}

const sentReports = Array.isArray(sent.reports) ? [...sent.reports] : [];

for (const report of reports) {
  const match = fifa.Results.find((item) => String(item.IdMatch) === report.matchId);
  if (!match) throw new Error(`Missing match ${report.matchId}`);
  const groupName = desc(match.GroupName);
  const snapshot = {
    generatedAtBjt,
    reportType: "backfill-missed-24h-window",
    scheduledPushBjt: report.scheduledPushBjt,
    match: {
      matchId: report.matchId,
      matchCode: report.matchCode,
      competition: desc(match.CompetitionName),
      stage: desc(match.StageName),
      group: groupName,
      kickoffUtc: match.Date,
      kickoffBjt: bjt(match.Date),
      venue: desc(match.Stadium?.Name),
      city: desc(match.Stadium?.CityName),
      home: { code: match.Home.Abbreviation, name: match.Home.ShortClubName },
      away: { code: match.Away.Abbreviation, name: match.Away.ShortClubName }
    },
    recentResults: fifa.Results
      .filter((item) => desc(item.GroupName) === groupName && Number.isFinite(item.Home?.Score) && Number.isFinite(item.Away?.Score))
      .map((item) => ({
        matchId: String(item.IdMatch),
        kickoffBjt: bjt(item.Date),
        match: `${item.Home.Abbreviation} ${item.Home.Score}-${item.Away.Score} ${item.Away.Abbreviation}`,
        venue: desc(item.Stadium?.Name)
      })),
    groupTable: buildTable(fifa.Results, groupName),
    forecast: report
  };

  await fs.writeFile(report.localHtml, htmlFor(report, snapshot), "utf8");
  await fs.writeFile(report.localJson, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  const index = sentReports.findIndex((item) => String(item.matchId) === report.matchId);
  const sentEntry = {
    matchId: report.matchId,
    match: report.matchCode,
    kickoffBjt: snapshot.match.kickoffBjt,
    reportPath: report.localHtml,
    dataPath: report.localJson,
    pushedAtBjt: generatedAtBjt,
    scheduledPushBjt: report.scheduledPushBjt,
    mode: "backfill-missed-24h-window"
  };
  if (index >= 0) sentReports[index] = sentEntry;
  else sentReports.push(sentEntry);
}

await fs.writeFile("sent_pre_match_reports.json", `${JSON.stringify({ reports: sentReports }, null, 2)}\n`, "utf8");
console.log(`Wrote ${reports.length} missed pre-match backfill reports.`);
