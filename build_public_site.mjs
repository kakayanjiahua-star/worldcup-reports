import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const docs = path.join(root, "docs");
const sentReportsPath = path.join(root, "sent_pre_match_reports.json");

const staticPages = [
  {
    title: "阿根廷 vs 奥地利补发报告",
    subtitle: "错过赛前24小时窗口后的单场预测补发",
    source: "阿根廷vs奥地利赛前24小时补发报告.html",
    target: "argentina-austria-prematch.html",
    tag: "Backfill",
    tone: "teal"
  },
  {
    title: "法国 vs 伊拉克补发报告",
    subtitle: "错过赛前24小时窗口后的单场预测补发",
    source: "法国vs伊拉克赛前24小时补发报告.html",
    target: "france-iraq-prematch.html",
    tag: "Backfill",
    tone: "blue"
  },
  {
    title: "挪威 vs 塞内加尔补发报告",
    subtitle: "错过赛前24小时窗口后的单场预测补发",
    source: "挪威vs塞内加尔赛前24小时补发报告.html",
    target: "norway-senegal-prematch.html",
    tag: "Backfill",
    tone: "magenta"
  },
  {
    title: "约旦 vs 阿尔及利亚补发报告",
    subtitle: "错过赛前24小时窗口后的单场预测补发",
    source: "约旦vs阿尔及利亚赛前24小时补发报告.html",
    target: "jordan-algeria-prematch.html",
    tag: "Backfill",
    tone: "orange"
  },
  {
    title: "今日四场赛前预测包",
    subtitle: "西班牙-沙特、比利时-伊朗、乌拉圭-佛得角、新西兰-埃及",
    source: "四场世界杯赛前预测包.html",
    target: "four-match-predictions.html",
    tag: "Prediction",
    tone: "teal"
  },
  {
    title: "赛前24小时报告推送计划",
    subtitle: "剩余赛程、触发时间、自动化报告维度",
    source: "世界杯赛前24小时报告推送计划.html",
    target: "prematch-report-plan.html",
    tag: "Automation",
    tone: "orange"
  },
  {
    title: "截止6月20日0点整体进度",
    subtitle: "已完赛赛果、积分、进球趋势与小组形势",
    source: "世界杯截止6月20日0点整体进度报告.html",
    target: "progress-2026-06-20-0000-bjt.html",
    tag: "Progress",
    tone: "blue"
  },
  {
    title: "荷兰 vs 瑞典单场预测",
    subtitle: "比分、概率、战术、风险矩阵",
    source: "荷兰vs瑞典竖版图文报告.html",
    target: "netherlands-sweden-prediction.html",
    tag: "Match",
    tone: "magenta"
  }
];

const staticAssets = [
  ["argentina_austria_prematch_snapshot.json", "data/argentina_austria_prematch_snapshot.json"],
  ["france_iraq_prematch_snapshot.json", "data/france_iraq_prematch_snapshot.json"],
  ["norway_senegal_prematch_snapshot.json", "data/norway_senegal_prematch_snapshot.json"],
  ["jordan_algeria_prematch_snapshot.json", "data/jordan_algeria_prematch_snapshot.json"],
  ["four_match_prediction_pack.json", "data/four_match_prediction_pack.json"],
  ["worldcup_remaining_push_plan.json", "data/worldcup_remaining_push_plan.json"],
  ["worldcup_progress_cutoff_20260620_0000_bjt.json", "data/worldcup_progress_cutoff_20260620_0000_bjt.json"],
  ["nl_sweden_research_snapshot.json", "data/nl_sweden_research_snapshot.json"]
];

const fallbackPublicTargets = new Map([
  ["阿根廷vs奥地利赛前24小时补发报告.html", "argentina-austria-prematch.html"],
  ["法国vs伊拉克赛前24小时补发报告.html", "france-iraq-prematch.html"],
  ["挪威vs塞内加尔赛前24小时补发报告.html", "norway-senegal-prematch.html"],
  ["约旦vs阿尔及利亚赛前24小时补发报告.html", "jordan-algeria-prematch.html"],
  ["葡萄牙vs乌兹别克斯坦赛前24小时补发报告.html", "portugal-uzbekistan-prematch.html"],
  ["英格兰vs加纳赛前24小时补发报告.html", "england-ghana-prematch.html"],
  ["巴拿马vs克罗地亚赛前24小时补发报告.html", "panama-croatia-prematch.html"],
  ["哥伦比亚vs刚果金赛前24小时补发报告.html", "colombia-drcongo-prematch.html"]
]);

function titleFromMatchCode(code) {
  const [home = "", away = ""] = String(code || "").split("-");
  return home && away ? `${home} vs ${away} 赛前补发报告` : "赛前补发报告";
}

function subtitleFromEntry(entry) {
  const kickoff = entry.kickoffBjt ? `开球 ${entry.kickoffBjt} BJT` : "赛前 24 小时补发";
  return `${entry.mode === "backfill-missed-24h-window" ? "错过 24 小时窗口后的单场预测补发" : "单场赛前预测"} · ${kickoff}`;
}

let sentState = { reports: [] };
try {
  sentState = JSON.parse(await fs.readFile(sentReportsPath, "utf8"));
} catch {
  sentState = { reports: [] };
}

const sentPages = [];
const sentAssets = [];
const seenTargets = new Set(staticPages.map((page) => page.target));

for (const entry of Array.isArray(sentState.reports) ? sentState.reports : []) {
  if (!entry?.reportPath || !String(entry.reportPath).endsWith(".html")) continue;
  const target = entry.publicTarget ?? fallbackPublicTargets.get(entry.reportPath);
  if (!target || seenTargets.has(target)) continue;
  seenTargets.add(target);
  sentPages.push({
    title: entry.title ?? titleFromMatchCode(entry.match),
    subtitle: subtitleFromEntry(entry),
    source: entry.reportPath,
    target,
    tag: entry.mode === "backfill-missed-24h-window" ? "Backfill" : "Prediction",
    tone: "teal"
  });
  if (entry.dataPath) {
    sentAssets.push([entry.dataPath, `data/${path.basename(entry.dataPath)}`]);
  }
}

const pages = [...sentPages, ...staticPages];
const assets = [...sentAssets, ...staticAssets];

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

await fs.rm(docs, { recursive: true, force: true });
await fs.mkdir(path.join(docs, "data"), { recursive: true });

for (const page of pages) {
  await fs.copyFile(path.join(root, page.source), path.join(docs, page.target));
}

for (const [source, target] of assets) {
  try {
    await fs.copyFile(path.join(root, source), path.join(docs, target));
  } catch {
    // Optional data artifact may not exist yet.
  }
}

await fs.writeFile(path.join(docs, ".nojekyll"), "", "utf8");

const cards = pages.map(page => `
  <a class="card ${page.tone}" href="./${esc(page.target)}">
    <span>${esc(page.tag)}</span>
    <h2>${esc(page.title)}</h2>
    <p>${esc(page.subtitle)}</p>
    <b>打开报告</b>
  </a>
`).join("");

const index = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>2026 世界杯预测报告站</title>
  <meta name="description" content="2026 世界杯赛前预测、进度分析和推送计划。">
  <style>
    :root{--bg:#071a3a;--blue:#246bfe;--teal:#08d4c7;--orange:#ff7a1a;--magenta:#c21771;--gold:#ffd84d;--ink:#071a3a;--muted:#657184;--line:#d9e2ef}
    *{box-sizing:border-box}
    body{margin:0;font-family:"Microsoft YaHei","PingFang SC","Segoe UI",Arial,sans-serif;color:var(--ink);background:linear-gradient(145deg,#071a3a,#0b2a66 62%,#07111f)}
    .hero{min-height:46vh;color:#fff;padding:48px 22px 34px;display:grid;place-items:center;text-align:center;position:relative;overflow:hidden}
    .hero:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:42px 42px}
    .hero>*{position:relative}
    .kicker{display:inline-block;padding:7px 12px;border-radius:999px;background:rgba(8,212,199,.16);font-size:12px;font-weight:950;letter-spacing:.06em;margin-bottom:16px}
    h1{margin:0;font-size:clamp(36px,7vw,68px);line-height:1.02;letter-spacing:0}
    .hero p{max-width:720px;margin:16px auto 0;color:rgba(255,255,255,.76);font-size:17px;line-height:1.65}
    main{width:min(100%,980px);margin:-40px auto 0;padding:0 18px 42px;position:relative}
    .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
    .card{display:grid;gap:12px;min-height:220px;text-decoration:none;color:var(--ink);background:#fff;border:1px solid var(--line);border-left:8px solid var(--tone);border-radius:12px;padding:22px;box-shadow:0 20px 50px rgba(2,6,23,.25);transition:transform .18s ease,box-shadow .18s ease}
    .card:hover{transform:translateY(-3px);box-shadow:0 26px 62px rgba(2,6,23,.32)}
    .card span{width:max-content;padding:6px 10px;border-radius:999px;background:color-mix(in srgb,var(--tone) 16%,white);color:#071a3a;font-size:12px;font-weight:950}
    .card h2{margin:0;font-size:25px;line-height:1.18}
    .card p{margin:0;color:var(--muted);line-height:1.58}
    .card b{margin-top:auto;color:#071a3a}
    .teal{--tone:var(--teal)}.orange{--tone:var(--orange)}.blue{--tone:var(--blue)}.magenta{--tone:var(--magenta)}
    .note{margin-top:20px;padding:16px;border-radius:10px;background:#fff;color:var(--muted);line-height:1.6;border-left:6px solid var(--gold)}
    @media(max-width:720px){.grid{grid-template-columns:1fr}.hero{text-align:left;place-items:start}.hero p{margin-left:0}.card{min-height:0}}
  </style>
</head>
<body>
  <section class="hero">
    <div>
      <div class="kicker">FIFA World Cup 2026 · Reports</div>
      <h1>世界杯预测报告站</h1>
      <p>这里是可发布到 GitHub Pages 的静态站点入口。所有报告使用固定英文文件名，适合微信转发公网链接。</p>
    </div>
  </section>
  <main>
    <div class="grid">${cards}</div>
    <div class="note">发布后，请把浏览器地址栏里的 <b>https://用户名.github.io/仓库名/...</b> 链接发给朋友。不要转发本机的 <b>file://</b>、<b>127.0.0.1</b> 或 <b>localhost</b> 链接。</div>
  </main>
</body>
</html>`;

await fs.writeFile(path.join(docs, "index.html"), index, "utf8");

const readme = `# 2026 World Cup Reports

This folder is the GitHub Pages publishing source.

## Recommended GitHub Pages setting

- Source: Deploy from a branch
- Branch: \`main\` or \`master\`
- Folder: \`/docs\`

Public URLs will look like:

- \`https://<username>.github.io/<repo>/\`
- \`https://<username>.github.io/<repo>/four-match-predictions.html\`

Do not share local URLs such as \`file://\`, \`127.0.0.1\`, or \`localhost\`.
`;

await fs.writeFile(path.join(docs, "README.md"), readme, "utf8");

console.log(`Built public site in ${docs}`);
