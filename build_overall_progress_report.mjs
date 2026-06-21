import fs from "node:fs/promises";

const FIFA_URL = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023";
const CUTOFF_UTC = new Date("2026-06-19T16:00:00Z");
const CUTOFF_BJT = "2026-06-20 00:00";

const teamZh = {
  MEX: "墨西哥", RSA: "南非", KOR: "韩国", CZE: "捷克",
  CAN: "加拿大", BIH: "波黑", QAT: "卡塔尔", SUI: "瑞士",
  BRA: "巴西", MAR: "摩洛哥", HAI: "海地", SCO: "苏格兰",
  USA: "美国", PAR: "巴拉圭", AUS: "澳大利亚", TUR: "土耳其",
  GER: "德国", CUW: "库拉索", CIV: "科特迪瓦", ECU: "厄瓜多尔",
  NED: "荷兰", JPN: "日本", SWE: "瑞典", TUN: "突尼斯",
  BEL: "比利时", EGY: "埃及", IRN: "伊朗", NZL: "新西兰",
  ESP: "西班牙", CPV: "佛得角", KSA: "沙特", URU: "乌拉圭",
  FRA: "法国", SEN: "塞内加尔", IRQ: "伊拉克", NOR: "挪威",
  ARG: "阿根廷", ALG: "阿尔及利亚", AUT: "奥地利", JOR: "约旦",
  POR: "葡萄牙", COD: "刚果（金）", UZB: "乌兹别克斯坦", COL: "哥伦比亚",
  ENG: "英格兰", CRO: "克罗地亚", GHA: "加纳", PAN: "巴拿马"
};

const groupNames = [..."ABCDEFGHIJKL"];

function desc(value, fallback = "") {
  return value?.[0]?.Description ?? fallback;
}

function bjt(dateIso) {
  const d = new Date(new Date(dateIso).getTime() + 8 * 3600e3);
  return d.toISOString().replace("T", " ").slice(0, 16);
}

function teamLabel(code) {
  return `${teamZh[code] ?? code} ${code}`;
}

function outcome(match) {
  if (match.hs > match.as) return "home";
  if (match.hs < match.as) return "away";
  return "draw";
}

function ensureTeam(table, group, code, name) {
  if (!table[group]) table[group] = new Map();
  if (!table[group].has(code)) {
    table[group].set(code, {
      group, code, name,
      p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0
    });
  }
  return table[group].get(code);
}

function rankRows(rows) {
  return rows.slice().sort((a, b) =>
    b.pts - a.pts ||
    b.gd - a.gd ||
    b.gf - a.gf ||
    a.code.localeCompare(b.code)
  );
}

function pct(n, d) {
  return d ? `${Math.round((n / d) * 100)}%` : "0%";
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

const response = await fetch(FIFA_URL);
if (!response.ok) throw new Error(`FIFA API failed: ${response.status}`);
const payload = await response.json();

const matches = payload.Results
  .map(m => ({
    id: m.IdMatch,
    date: m.Date,
    bjt: bjt(m.Date),
    group: desc(m.GroupName).replace("Group ", ""),
    stage: desc(m.StageName),
    home: m.Home?.Abbreviation,
    homeName: m.Home?.ShortClubName || desc(m.Home?.TeamName),
    hs: m.Home?.Score,
    away: m.Away?.Abbreviation,
    awayName: m.Away?.ShortClubName || desc(m.Away?.TeamName),
    as: m.Away?.Score,
    venue: desc(m.Stadium?.Name),
    attendance: Number(m.Attendance || 0)
  }))
  .filter(m => new Date(m.date) < CUTOFF_UTC && Number.isFinite(m.hs) && Number.isFinite(m.as))
  .sort((a, b) => new Date(a.date) - new Date(b.date));

const table = {};
for (const m of matches) {
  const h = ensureTeam(table, m.group, m.home, m.homeName);
  const a = ensureTeam(table, m.group, m.away, m.awayName);
  h.p += 1; a.p += 1;
  h.gf += m.hs; h.ga += m.as; h.gd = h.gf - h.ga;
  a.gf += m.as; a.ga += m.hs; a.gd = a.gf - a.ga;
  if (m.hs > m.as) { h.w += 1; a.l += 1; h.pts += 3; }
  else if (m.hs < m.as) { a.w += 1; h.l += 1; a.pts += 3; }
  else { h.d += 1; a.d += 1; h.pts += 1; a.pts += 1; }
}

const groupTables = Object.fromEntries(
  groupNames.map(g => [g, rankRows([...table[g]?.values() ?? []])])
);

const totalGoals = matches.reduce((sum, m) => sum + m.hs + m.as, 0);
const draws = matches.filter(m => m.hs === m.as).length;
const oneGoal = matches.filter(m => Math.abs(m.hs - m.as) === 1).length;
const cleanSheets = matches.filter(m => m.hs === 0 || m.as === 0).length;
const biggestWins = matches
  .map(m => ({ ...m, margin: Math.abs(m.hs - m.as), goals: m.hs + m.as }))
  .sort((a, b) => b.margin - a.margin || b.goals - a.goals)
  .slice(0, 5);
const highScoring = matches
  .map(m => ({ ...m, goals: m.hs + m.as }))
  .sort((a, b) => b.goals - a.goals || b.attendance - a.attendance)
  .slice(0, 6);
const groupProgress = groupNames.map(g => ({
  group: g,
  played: matches.filter(m => m.group === g).length,
  goals: matches.filter(m => m.group === g).reduce((sum, m) => sum + m.hs + m.as, 0),
  leader: groupTables[g]?.[0]
}));

const leaders = groupNames.map(g => groupTables[g]?.[0]).filter(Boolean);
const thirdRows = groupNames.map(g => groupTables[g]?.[2]).filter(Boolean).sort((a, b) =>
  b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.code.localeCompare(b.code)
);

const matchRows = matches.map((m, index) => `
  <tr>
    <td>${index + 1}</td>
    <td>${esc(m.bjt)}</td>
    <td><span class="badge">G${esc(m.group)}</span></td>
    <td><b>${esc(teamLabel(m.home))}</b></td>
    <td class="score">${m.hs}-${m.as}</td>
    <td><b>${esc(teamLabel(m.away))}</b></td>
    <td>${esc(m.venue)}</td>
  </tr>`).join("");

const groupCards = groupNames.map(g => {
  const rows = groupTables[g] ?? [];
  const played = matches.filter(m => m.group === g).length;
  const leader = rows[0];
  return `
    <article class="group-card">
      <div class="group-head">
        <b>Group ${g}</b>
        <span>${played}/6 场</span>
      </div>
      <table>
        <thead><tr><th>队</th><th>赛</th><th>净</th><th>分</th></tr></thead>
        <tbody>
          ${rows.map((r, i) => `
          <tr class="${i < 2 ? "qual" : i === 2 ? "third" : ""}">
            <td>${esc(teamLabel(r.code))}</td><td>${r.p}</td><td>${r.gd > 0 ? "+" : ""}${r.gd}</td><td>${r.pts}</td>
          </tr>`).join("") || `<tr><td colspan="4">暂无完赛</td></tr>`}
        </tbody>
      </table>
      <p>${leader ? `领跑：${esc(teamLabel(leader.code))}，${leader.pts} 分，净胜球 ${leader.gd > 0 ? "+" : ""}${leader.gd}` : "尚无积分"}</p>
    </article>`;
}).join("");

const leaderRows = leaders.map((r, i) => `
  <tr><td>${i + 1}</td><td>G${r.group}</td><td>${esc(teamLabel(r.code))}</td><td>${r.p}</td><td>${r.gf}:${r.ga}</td><td>${r.gd > 0 ? "+" : ""}${r.gd}</td><td>${r.pts}</td></tr>
`).join("");

const thirdRowsHtml = thirdRows.map((r, i) => `
  <tr><td>${i + 1}</td><td>G${r.group}</td><td>${esc(teamLabel(r.code))}</td><td>${r.p}</td><td>${r.gf}:${r.ga}</td><td>${r.gd > 0 ? "+" : ""}${r.gd}</td><td>${r.pts}</td></tr>
`).join("");

const progressBars = groupProgress.map(g => `
  <div class="progress-row">
    <span>G${g.group}</span>
    <div class="track"><i style="width:${(g.played / 6) * 100}%"></i></div>
    <b>${g.played}/6</b>
  </div>
`).join("");

const biggestWinRows = biggestWins.map(m => `
  <li><b>${esc(teamLabel(m.home))} ${m.hs}-${m.as} ${esc(teamLabel(m.away))}</b><span>净胜 ${m.margin} 球 · G${m.group}</span></li>
`).join("");

const highScoreRows = highScoring.map(m => `
  <li><b>${esc(teamLabel(m.home))} ${m.hs}-${m.as} ${esc(teamLabel(m.away))}</b><span>${m.goals} 球 · ${esc(m.venue)}</span></li>
`).join("");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>世界杯截止 ${CUTOFF_BJT} 整体进度网页版</title>
  <style>
    :root {
      --bg:#07111f; --ink:#101828; --muted:#64748b; --paper:#fff7ed;
      --orange:#ff7a00; --blue:#1d4ed8; --green:#16a34a; --red:#ef4444; --yellow:#ffd23f;
      --cyan:#25d0c8; --line:rgba(15,23,42,.14); --shadow:0 18px 55px rgba(2,6,23,.22);
    }
    *{box-sizing:border-box}
    html{scroll-snap-type:y mandatory;background:var(--bg)}
    body{margin:0;font-family:"Microsoft YaHei","PingFang SC","Segoe UI",Arial,sans-serif;color:var(--ink);background:
      radial-gradient(circle at 12% 5%,rgba(255,122,0,.42),transparent 28%),
      radial-gradient(circle at 86% 14%,rgba(37,208,200,.30),transparent 30%),
      linear-gradient(145deg,#07111f,#10213f 58%,#0b1220)}
    .deck{width:min(100%,720px);margin:0 auto;background:#0b1220}
    .slide{min-height:100svh;scroll-snap-align:start;padding:30px 26px;display:flex;flex-direction:column;gap:18px;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.15);position:relative}
    .hero{color:#fff;background:linear-gradient(155deg,#ff7a00 0%,#f97316 36%,#10213f 100%)}
    .light{background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(255,247,237,.98))}
    .dark{color:#fff;background:linear-gradient(160deg,#0b1220,#10213f)}
    .blue{color:#fff;background:linear-gradient(160deg,#1d4ed8,#10213f 70%,#07111f)}
    .kicker{width:max-content;border:1px solid currentColor;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;opacity:.88}
    h1,h2,h3,p{margin:0} h1{font-size:56px;line-height:.96;letter-spacing:0;max-width:10ch} h2{font-size:33px;line-height:1.08;letter-spacing:0} h3{font-size:18px}
    p{font-size:15px;line-height:1.55}.muted{color:var(--muted)}.dark .muted,.blue .muted,.hero .muted{color:rgba(255,255,255,.76)}
    .hero-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:auto}
    .metric{border-radius:8px;padding:18px;background:rgba(255,255,255,.92);color:var(--ink);box-shadow:var(--shadow);min-height:118px}
    .metric b{display:block;font-size:42px;line-height:1}.metric span{font-size:13px;font-weight:900;color:#475569}.metric.darkbox{background:#111827;color:#fff;outline:4px solid var(--yellow)}.metric.darkbox span{color:rgba(255,255,255,.72)}
    .cards{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.card{border:1px solid var(--line);background:rgba(255,255,255,.86);border-radius:8px;padding:14px;box-shadow:0 10px 28px rgba(15,23,42,.08)}
    .dark .card,.blue .card{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.22)}
    .big{font-size:30px;font-weight:950;line-height:1;color:var(--orange)}.blue .big,.dark .big{color:var(--yellow)}
    .progress-row{display:grid;grid-template-columns:44px 1fr 42px;gap:10px;align-items:center;font-weight:900;font-size:13px}.track{height:18px;background:rgba(15,23,42,.13);border-radius:999px;overflow:hidden}.track i{display:block;height:100%;background:linear-gradient(90deg,var(--orange),var(--yellow))}
    .group-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;overflow:auto;padding-bottom:4px}.group-card{background:#fff;border-radius:8px;padding:10px;border:1px solid var(--line)}
    .group-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.group-head b{font-size:16px}.group-head span{font-size:12px;font-weight:900;color:#475569}
    table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:7px 6px;border-bottom:1px solid rgba(15,23,42,.1);text-align:left}th{background:#10213f;color:#fff}.qual td{background:rgba(22,163,74,.13)}.third td{background:rgba(255,210,63,.18)}
    .wide-table{overflow:auto;border-radius:8px;background:#fff;box-shadow:var(--shadow)}.wide-table table{min-width:780px;font-size:13px}.score{font-size:18px;font-weight:950;color:var(--orange);white-space:nowrap}.badge{display:inline-block;background:#10213f;color:#fff;border-radius:999px;padding:4px 8px;font-weight:900}
    .rank-wrap{display:grid;grid-template-columns:1fr;gap:12px;overflow:auto}.rank-table{background:#fff;border-radius:8px;overflow:auto}.rank-table table{min-width:610px}
    .viz{display:grid;grid-template-columns:1fr 1fr;gap:12px}.donut{width:100%;aspect-ratio:1;border-radius:50%;background:conic-gradient(var(--orange) 0 50%,#94a3b8 50% 82%,var(--blue) 82% 100%);display:grid;place-items:center;box-shadow:var(--shadow)}.donut div{width:54%;height:54%;border-radius:50%;background:#fff;display:grid;place-items:center;text-align:center;font-weight:950}
    .list{display:grid;gap:10px;margin:0;padding:0;list-style:none}.list li{border-radius:8px;padding:12px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22)}.list b{display:block}.list span{display:block;font-size:12px;opacity:.76;margin-top:3px}
    .source-grid{display:grid;gap:10px}.source{display:grid;grid-template-columns:46px 1fr;gap:10px;align-items:center;border-radius:8px;background:#fff;padding:12px;border:1px solid var(--line)}.source i{display:grid;place-items:center;width:46px;height:46px;background:var(--blue);color:#fff;font-weight:950;font-style:normal}.source:nth-child(2) i{background:var(--orange)}.source:nth-child(3) i{background:var(--green)}
    .page-no{position:absolute;right:22px;bottom:16px;font-size:12px;font-weight:900;opacity:.46}
    @media(max-width:520px){.slide{padding:24px 18px}.cards,.group-grid,.viz{grid-template-columns:1fr}h1{font-size:46px}h2{font-size:28px}.metric b{font-size:34px}.group-grid{max-height:66svh}.wide-table{max-height:76svh}.rank-table{max-height:38svh}}
    @media print{html{scroll-snap-type:none}.slide{page-break-after:always;min-height:100vh}}
  </style>
</head>
<body>
<main class="deck">
  <section class="slide hero">
    <div class="kicker">World Cup 2026 Progress Board</div>
    <h1>世界杯进度总览</h1>
    <p class="muted">严格截止：北京时间 ${CUTOFF_BJT} 前；对应 UTC 2026-06-19 16:00 前。美国当地 6月19日晚赛果未计入严格口径。</p>
    <div class="hero-grid">
      <div class="metric darkbox"><b>${matches.length}</b><span>已完赛</span></div>
      <div class="metric"><b>${totalGoals}</b><span>总进球 · 场均 ${(totalGoals / matches.length).toFixed(2)}</span></div>
      <div class="metric"><b>${draws}</b><span>平局 · ${pct(draws, matches.length)}</span></div>
      <div class="metric"><b>${cleanSheets}</b><span>零封场次 · ${pct(cleanSheets, matches.length)}</span></div>
    </div>
    <div class="page-no">01 / 总览</div>
  </section>

  <section class="slide light">
    <div class="kicker">Tournament Pulse</div>
    <h2>前 28 场的主线：进球多、强队有闪光，也有明显冷门和平局潮。</h2>
    <div class="cards">
      <div class="card"><span class="big">${(totalGoals / matches.length).toFixed(2)}</span><p>场均进球高于传统大赛保守开局，德国 7-1、加拿大 6-0、瑞典 5-1 拉高均值。</p></div>
      <div class="card"><span class="big">${pct(oneGoal, matches.length)}</span><p>一球差比赛占比，说明很多小组仍处于胶着区，第三名竞争会很复杂。</p></div>
      <div class="card"><span class="big">A/B</span><p>A、B 两组已进入第二轮深水区，墨西哥和加拿大暂时最有主动权。</p></div>
      <div class="card"><span class="big">8/12</span><p>12 个小组已有全部亮相；前两轮未全面展开，很多榜首还只是第一轮领先。</p></div>
    </div>
  <div class="page-no">02 / 趋势</div>
  </section>

  <section class="slide dark">
    <div class="kicker">Group Progress</div>
    <h2>各组进度条：A 组最快，B 组紧随，其余多数刚完成首轮。</h2>
    <div class="cards">
      ${progressBars}
    </div>
    <p class="muted">2026 赛制：12 组前二 + 8 个成绩最好的小组第三进入 32 强。当前第三名榜会随着第二轮密集变动，不宜过早下结论。</p>
    <div class="page-no">03 / 小组进度</div>
  </section>

  <section class="slide light">
    <div class="kicker">All Results</div>
    <h2>截止点前全部已完赛清单</h2>
    <div class="wide-table">
      <table>
        <thead><tr><th>#</th><th>北京时间</th><th>组</th><th>主队</th><th>比分</th><th>客队</th><th>场地</th></tr></thead>
        <tbody>${matchRows}</tbody>
      </table>
    </div>
    <div class="page-no">04 / 赛果</div>
  </section>

  <section class="slide light">
    <div class="kicker">Group Tables</div>
    <h2>12 组实时积分表</h2>
    <div class="group-grid">${groupCards}</div>
    <div class="page-no">05 / 积分</div>
  </section>

  <section class="slide blue">
    <div class="kicker">Leaders & Thirds</div>
    <h2>榜首稳定性与第三名水位</h2>
    <div class="rank-wrap">
      <div class="rank-table">
        <table><thead><tr><th>#</th><th>组</th><th>榜首</th><th>赛</th><th>进失</th><th>净</th><th>分</th></tr></thead><tbody>${leaderRows}</tbody></table>
      </div>
      <div class="rank-table">
        <table><thead><tr><th>#</th><th>组</th><th>暂列第三</th><th>赛</th><th>进失</th><th>净</th><th>分</th></tr></thead><tbody>${thirdRowsHtml}</tbody></table>
      </div>
    </div>
    <div class="page-no">06 / 出线水位</div>
  </section>

  <section class="slide dark">
    <div class="kicker">Goals & Surprises</div>
    <h2>进球爆点与最大分差</h2>
    <div class="viz">
      <div class="donut"><div>${matches.length} 场<br><small>${totalGoals} 球</small></div></div>
      <div class="card">
        <h3>结果结构</h3>
        <p class="muted">平局 ${draws} 场；零封 ${cleanSheets} 场；一球差 ${oneGoal} 场。强队一旦打开局面，比分会迅速拉大。</p>
      </div>
    </div>
    <h3>最大分差</h3>
    <ul class="list">${biggestWinRows}</ul>
    <h3>最高进球战</h3>
    <ul class="list">${highScoreRows}</ul>
    <div class="page-no">07 / 爆点</div>
  </section>

  <section class="slide light">
    <div class="kicker">Sources & Notes</div>
    <h2>数据口径与分析结论</h2>
    <div class="source-grid">
      <div class="source"><i>FIFA</i><div><b>官方赛程/赛果 API</b><p class="muted">用于生成全部 28 场严格截止赛果与积分。</p></div></div>
      <div class="source"><i>ESPN</i><div><b>赛程结果交叉核验</b><p class="muted">用于核对中文/英文媒体口径，特别是 6月19日之后的当地时间报道。</p></div></div>
      <div class="source"><i>Yahoo</i><div><b>实时比分与小组更新</b><p class="muted">用于识别哪些赛果属于截止点后，避免混入口径。</p></div></div>
    </div>
    <div class="card">
      <h3>总判断</h3>
      <p>到北京时间 6月20日 0 点前，本届世界杯呈现“强队能大胜，但中上游对话平局偏多”的形态。A/B 组因第二轮提前展开，出线形势更清晰；其余小组多数只是首轮样本，榜首更多代表开局状态，不代表稳出线。第三名通道会让 3 分、净胜球和纪律分都变得很贵。</p>
    </div>
    <div class="page-no">08 / 来源与结论</div>
  </section>
</main>
</body>
</html>`;

await fs.writeFile("世界杯截止6月20日0点整体进度报告.html", html, "utf8");
await fs.writeFile("worldcup_progress_cutoff_20260620_0000_bjt.json", JSON.stringify({ cutoffBjt: CUTOFF_BJT, cutoffUtc: CUTOFF_UTC.toISOString(), matches, groupTables }, null, 2), "utf8");

console.log(`Wrote ${matches.length} matches to report.`);
