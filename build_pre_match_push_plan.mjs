import fs from "node:fs/promises";

const FIFA_URL = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023";
const NOW_BJT_ISO = "2026-06-21T20:33:17+08:00";
const AUTOMATION_ID = "24";

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

function desc(value, fallback = "") {
  return value?.[0]?.Description ?? fallback;
}

function bjtDate(dateIso) {
  return new Date(new Date(dateIso).getTime() + 8 * 3600e3);
}

function fmtBjt(dateIso) {
  return bjtDate(dateIso).toISOString().replace("T", " ").slice(0, 16);
}

function triggerTime(dateIso) {
  return new Date(bjtDate(dateIso).getTime() - 24 * 3600e3).toISOString().replace("T", " ").slice(0, 16);
}

function label(code, name) {
  return `${teamZh[code] ?? name ?? code} ${code ?? ""}`.trim();
}

function flagUrl(code) {
  if (!code || code === "TBD") return "";
  return `https://api.fifa.com/api/v3/picture/flags-sq-4/${encodeURIComponent(code)}`;
}

function teamChip(code, name) {
  const flag = flagUrl(code);
  const img = flag ? `<img src="${flag}" alt="${esc(label(code, name))} flag" loading="lazy">` : `<span class="flag-fallback">?</span>`;
  return `<span class="team-chip">${img}<b>${esc(label(code, name))}</b></span>`;
}

function stageTone(match, index = 0) {
  if (match.stage !== "First Stage") return "tone-knockout";
  const tones = ["tone-teal", "tone-orange", "tone-magenta", "tone-blue", "tone-green", "tone-gold"];
  return tones[(match.group.charCodeAt(0) + index) % tones.length];
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

const now = new Date(NOW_BJT_ISO);
const payload = await (await fetch(FIFA_URL)).json();
const matches = payload.Results.map(m => ({
  id: m.IdMatch,
  date: new Date(m.Date),
  kickoffBjt: fmtBjt(m.Date),
  triggerBjt: triggerTime(m.Date),
  group: desc(m.GroupName).replace("Group ", ""),
  stage: desc(m.StageName),
  home: m.Home?.Abbreviation || "TBD",
  away: m.Away?.Abbreviation || "TBD",
  homeName: m.Home?.ShortClubName || desc(m.Home?.TeamName) || "TBD",
  awayName: m.Away?.ShortClubName || desc(m.Away?.TeamName) || "TBD",
  venue: desc(m.Stadium?.Name)
})).filter(m => m.date > now).sort((a, b) => a.date - b.date);

const next24Missed = matches.filter(m => new Date(bjtDate(m.date).getTime() - 24 * 3600e3) < now).slice(0, 4);
const upcomingAuto = matches.filter(m => new Date(bjtDate(m.date).getTime() - 24 * 3600e3) >= now);
const byStage = matches.reduce((acc, m) => {
  acc[m.stage] = (acc[m.stage] || 0) + 1;
  return acc;
}, {});

const rows = matches.map((m, i) => {
  const trigger = new Date(bjtDate(m.date).getTime() - 24 * 3600e3);
  const late = trigger < now;
  return `<tr class="${late ? "late" : ""} ${stageTone(m, i)}">
    <td>${i + 1}</td>
    <td>${esc(m.stage === "First Stage" ? `G${m.group}` : m.stage)}</td>
    <td>${teamChip(m.home, m.homeName)}</td>
    <td class="vs">vs</td>
    <td>${teamChip(m.away, m.awayName)}</td>
    <td>${esc(m.kickoffBjt)}</td>
    <td>${esc(m.triggerBjt)}</td>
    <td>${late ? "已过24h窗口" : "自动推送"}</td>
  </tr>`;
}).join("");

const nextCards = matches.slice(0, 8).map((m, i) => `<article class="match-card ${stageTone(m, i)}">
  <div class="stage">${esc(m.stage === "First Stage" ? `Group ${m.group}` : m.stage)}</div>
  <div class="teams">${teamChip(m.home, m.homeName)}<span>vs</span>${teamChip(m.away, m.awayName)}</div>
  <div class="time">开球 ${esc(m.kickoffBjt)}</div>
  <div class="trigger">报告触发 ${esc(m.triggerBjt)}</div>
</article>`).join("");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>世界杯赛前24小时报告推送计划</title>
  <style>
    :root{--bg:#071a3a;--card:#fff;--soft:#f3f7fb;--line:#d9e2ef;--ink:#071a3a;--muted:#657184;--teal:#08d4c7;--mag:#c21771;--gold:#ffd84d;--orange:#ff7a1a;--blue:#246bfe;--green:#19a974}
    *{box-sizing:border-box}body{margin:0;font-family:"Microsoft YaHei","PingFang SC","Segoe UI",Arial,sans-serif;color:var(--ink);background:linear-gradient(145deg,#071a3a,#0b2a66 58%,#07111f)}
    .wrap{width:min(100%,900px);margin:0 auto;background:#eef5fb;min-height:100vh}
    section{padding:32px 26px;border-bottom:1px solid var(--line)}
    .hero{color:#fff;background:linear-gradient(160deg,#071a3a,#0b2a66);position:relative;overflow:hidden}.hero:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:42px 42px}.hero>*{position:relative}
    h1,h2,h3,p{margin:0}h1{font-size:48px;line-height:1.03;letter-spacing:0}h2{font-size:30px;line-height:1.14}h3{font-size:18px}.muted{color:var(--muted)}.hero .muted{color:rgba(255,255,255,.76)}p{font-size:15px;line-height:1.62}
    .kicker{display:inline-block;padding:7px 12px;border-radius:999px;background:rgba(8,212,199,.16);font-size:12px;font-weight:950;letter-spacing:.06em;margin-bottom:16px}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:24px}.stat{background:#fff;color:var(--ink);border-radius:8px;padding:16px;box-shadow:0 16px 42px rgba(2,6,23,.22);border-top:5px solid var(--teal)}.stat:nth-child(2){border-color:var(--orange)}.stat:nth-child(3){border-color:var(--mag)}.stat:nth-child(4){border-color:var(--gold)}.stat b{display:block;font-size:36px;line-height:1}.stat span{font-size:12px;font-weight:900;color:var(--muted)}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.card,.match-card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px;box-shadow:0 10px 28px rgba(7,26,58,.08)}
    .match-card{display:grid;gap:12px;position:relative;overflow:hidden;border-left:7px solid var(--tone,var(--teal))}.match-card:before{content:"";position:absolute;inset:0 0 auto;height:4px;background:linear-gradient(90deg,var(--tone,var(--teal)),transparent);opacity:.9}.stage{width:max-content;padding:5px 9px;border-radius:999px;background:color-mix(in srgb,var(--tone,var(--teal)) 18%,white);color:#0b2a66;font-size:12px;font-weight:950}.teams{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center}.teams > span:not(.team-chip){text-transform:uppercase;color:var(--muted);font-weight:950}.time{font-weight:950}.trigger{color:var(--mag);font-size:13px;font-weight:900}
    .team-chip{display:inline-flex;align-items:center;gap:8px;min-width:0}.team-chip img,.flag-fallback{width:28px;height:28px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 2px #fff,0 2px 8px rgba(7,26,58,.18);background:#d9e2ef;flex:0 0 auto}.team-chip b{font-size:15px;line-height:1.15;min-width:0}.flag-fallback{display:grid;place-items:center;font-weight:950;color:#0b2a66}
    .tone-teal{--tone:var(--teal)}.tone-orange{--tone:var(--orange)}.tone-magenta{--tone:var(--mag)}.tone-blue{--tone:var(--blue)}.tone-green{--tone:var(--green)}.tone-gold{--tone:var(--gold)}.tone-knockout{--tone:#7c3aed}
    .pipeline{display:grid;gap:12px}.step{display:grid;grid-template-columns:42px 1fr;gap:12px;align-items:start}.num{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:var(--bg);color:#fff;font-weight:950}.step:nth-child(1) .num{background:var(--teal);color:#06202d}.step:nth-child(2) .num{background:var(--orange)}.step:nth-child(3) .num{background:var(--mag)}.step:nth-child(4) .num{background:var(--blue)}.step div:last-child{background:#fff;border-radius:8px;padding:13px;border:1px solid var(--line);border-left:5px solid currentColor}.step:nth-child(1) div:last-child{color:var(--teal)}.step:nth-child(2) div:last-child{color:var(--orange)}.step:nth-child(3) div:last-child{color:var(--mag)}.step:nth-child(4) div:last-child{color:var(--blue)}.step p{color:var(--muted)}
    .table-wrap{overflow:auto;background:#fff;border-radius:8px;border:1px solid var(--line)}table{width:100%;min-width:1040px;border-collapse:collapse;font-size:13px}th,td{padding:11px 10px;border-bottom:1px solid var(--line);text-align:left}th{background:#071a3a;color:#fff;position:sticky;top:0}.vs{color:var(--muted);font-weight:950}.late td{background:#fff6e8;color:#805300}tbody tr{border-left:6px solid var(--tone,var(--line))}tbody tr:hover td{background:color-mix(in srgb,var(--tone,var(--teal)) 10%,white)}
    .dimensions{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.dim{background:#fff;border-radius:8px;padding:14px;border:1px solid var(--line);border-top:6px solid var(--tone,var(--teal))}.dim:nth-child(1){--tone:var(--teal)}.dim:nth-child(2){--tone:var(--orange)}.dim:nth-child(3){--tone:var(--mag)}.dim:nth-child(4){--tone:var(--blue)}.dim:nth-child(5){--tone:var(--green)}.dim:nth-child(6){--tone:var(--gold)}.dim b{display:block;margin-bottom:7px;color:#0b2a66}.dim span{font-size:13px;line-height:1.45;color:var(--muted)}
    .warn{border-left:4px solid var(--orange);background:#fff;padding:14px;border-radius:0 8px 8px 0}
    @media(max-width:640px){section{padding:26px 18px}h1{font-size:38px}.stats,.grid,.dimensions{grid-template-columns:1fr}.teams{grid-template-columns:1fr}.teams > span:not(.team-chip){text-align:left}.stat b{font-size:30px}.team-chip b{font-size:14px}}
  </style>
</head>
<body>
<main class="wrap">
  <section class="hero">
    <div class="kicker">Automation Plan · Pre-match 24h</div>
    <h1>世界杯赛前报告推送计划</h1>
    <p class="muted">自动化 ID ${AUTOMATION_ID} 已启用：每小时检查赛程，若比赛距离开球约 24 小时且未推送过，就生成专业版中文 HTML 报告。</p>
    <div class="stats">
      <div class="stat"><b>${matches.length}</b><span>剩余比赛</span></div>
      <div class="stat"><b>${byStage["First Stage"] ?? 0}</b><span>剩余小组赛</span></div>
      <div class="stat"><b>${matches.length - (byStage["First Stage"] ?? 0)}</b><span>淘汰赛/排位赛</span></div>
      <div class="stat"><b>${upcomingAuto.length}</b><span>尚可提前24h触发</span></div>
    </div>
  </section>
  <section>
    <div class="kicker">Next Fixtures</div>
    <h2>接下来 8 场比赛与报告触发时间</h2>
    <div class="grid" style="margin-top:16px">${nextCards}</div>
  </section>
  <section>
    <div class="kicker">Workflow</div>
    <h2>每份报告的生产流程</h2>
    <div class="pipeline" style="margin-top:16px">
      <div class="step"><div class="num">1</div><div><b>赛程与进度锁定</b><p class="muted">官方赛程、最新完赛结果、小组积分、出线压力与轮换动机。</p></div></div>
      <div class="step"><div class="num">2</div><div><b>情报层</b><p class="muted">伤停停赛、预计首发、教练发布会、休息天数、旅途、天气、场地。</p></div></div>
      <div class="step"><div class="num">3</div><div><b>模型层</b><p class="muted">市场概率、Elo/排名先验、近期 xG/射门、泊松比分分布、冷门压力测试。</p></div></div>
      <div class="step"><div class="num">4</div><div><b>视觉层</b><p class="muted">FIFA 官网风格竖版 HTML：总览、对比图、战术图、比分热度、风险矩阵。</p></div></div>
    </div>
  </section>
  <section>
    <div class="kicker">Professional Dimensions</div>
    <h2>后续报告会增加的专业维度</h2>
    <div class="dimensions" style="margin-top:16px">
      <div class="dim"><b>出线博弈</b><span>小组积分、净胜球、第三名水位、同组另一场联动。</span></div>
      <div class="dim"><b>盘口校准</b><span>1X2、大小球、让球、盘口漂移与模型分歧。</span></div>
      <div class="dim"><b>战术对位</b><span>压迫强度、边路人数、转换防守、定位球错位。</span></div>
      <div class="dim"><b>球员状态</b><span>首轮表现、替补深度、体能、伤停与黄牌风险。</span></div>
      <div class="dim"><b>环境变量</b><span>高温、湿度、海拔、草皮、旅行距离、休息天数。</span></div>
      <div class="dim"><b>比分路径</b><span>半场比分、进球时间窗、换人节点、逆风剧本。</span></div>
    </div>
  </section>
  <section>
    <div class="kicker">Full Schedule</div>
    <h2>剩余比赛与推送计划表</h2>
    <p class="warn" style="margin:14px 0">标黄行表示当前已经晚于赛前 24 小时窗口；自动化会从下一次符合窗口的比赛开始常规推送。</p>
    <div class="table-wrap"><table><thead><tr><th>#</th><th>阶段</th><th>主队</th><th></th><th>客队</th><th>开球 北京时间</th><th>报告触发 北京时间</th><th>状态</th></tr></thead><tbody>${rows}</tbody></table></div>
  </section>
</main>
</body>
</html>`;

await fs.writeFile("世界杯赛前24小时报告推送计划.html", html, "utf8");
await fs.writeFile("worldcup_remaining_push_plan.json", JSON.stringify({
  generatedAtBjt: NOW_BJT_ISO,
  automationId: AUTOMATION_ID,
  remainingCount: matches.length,
  stageCounts: byStage,
  upcomingAutoCount: upcomingAuto.length,
  missed24hWindow: next24Missed,
  matches
}, null, 2), "utf8");

console.log(`Wrote push plan for ${matches.length} remaining matches.`);
