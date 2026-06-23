import fs from "node:fs/promises";

const FIFA_URL = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023";
const generatedAtBjt = bjt(new Date().toISOString());

const reports = [
  {
    matchId: "400021503",
    matchCode: "POR-UZB",
    title: "葡萄牙 vs 乌兹别克斯坦",
    localHtml: "葡萄牙vs乌兹别克斯坦赛前24小时补发报告.html",
    localJson: "portugal_uzbekistan_prematch_snapshot.json",
    publicTarget: "portugal-uzbekistan-prematch.html",
    scheduledPushBjt: "2026-06-23 01:00:00",
    pick: "葡萄牙 2-0 乌兹别克斯坦",
    confidence: "中高",
    probabilities: { home: 74, draw: 17, away: 9 },
    marketNormalized: { home: 72, draw: 18, away: 10 },
    xg: { home: 1.94, away: 0.63 },
    thesis:
      "葡萄牙首轮只和刚果（金）踢成 1 比 1，市场和媒体都把这场看作回正节点。乌兹别克斯坦首轮 1 比 3 负于哥伦比亚，但低位站位和 Fayzullaev 的反击点都证明他们并非送分队。模型倾向葡萄牙通过 Fernandes 的中路出球和边锋一对一拉开局面，优势足以兑现，但若 Ronaldo 继续拖慢前场节奏，比分上限会受限。",
    lineups: {
      home: {
        shape: "4-2-3-1",
        players: "Diogo Costa; Diogo Dalot, Ruben Dias, Renato Veiga, Joao Cancelo; Joao Neves, Vitinha; Francisco Conceicao, Bruno Fernandes, Joao Felix; Cristiano Ronaldo",
        injury: "Ruben Dias 恢复合练后预计回归首发"
      },
      away: {
        shape: "3-4-2-1",
        players: "Utkir Yusupov; Rustamjon Ashurmatov, Abdukodir Khusanov, Abdulla Abdullaev; Bekhruz Karimov, Otabek Shukurov, Akmal Mozgovoy, Sherzod Nasrullayev; Abbosbek Fayzullaev, Oston Urunov; Eldor Shomurodov",
        injury: "Ashurmatov 小腿问题为临场观察点"
      }
    },
    tactics: [
      "葡萄牙最核心的对位是 Bruno Fernandes 在两线之间拿球；若 Uzbek 中场堵不住他，Ronaldo 和两翼会持续得到禁区前传送。",
      "Martinez 大概率继续 4-2-3-1，但会比首轮更强调 Felix/Conceicao 向内收，给 Cancelo 和 Dalot 外线推进空间。",
      "乌兹别克斯坦会用 3-4-2-1 压缩肋部，Fayzullaev 和 Urunov 负责反击第一脚，Shomurodov 负责把葡萄牙中卫拖离原位。",
      "若葡萄牙过度把球送给静态支点，比赛会进入 Uzbek 最喜欢的低位消耗节奏。"
    ],
    risks: [
      "葡萄牙首轮只有 1 次射正的低效如果延续，2 球以上穿盘会落空。",
      "Ashurmatov 若带伤但能坚持，Uzbek 后场高点和解围质量会显著改善。",
      "Houston 场外闷热对替补热身和后程换人强度有影响，若节奏慢，偏向小球。"
    ],
    scores: [["2-0", 18], ["3-0", 14], ["2-1", 13], ["1-0", 12], ["1-1", 8], ["3-1", 8], ["0-0", 4]],
    weather:
      "Houston 当地 6 月 23 日白天 34C 左右、体感更高；比赛在 NRG Stadium 进行，场内气候相对可控，但热环境仍影响赛前负荷和换人节奏。",
    sources: [
      ["FIFA 官方比赛中心", "https://www.fifa.com/en/match-centre/match/17/285023/289273/400021503"],
      ["FIFA 官方赛程 API", FIFA_URL],
      ["RotoWire 赛前预览", "https://www.rotowire.com/soccer/article/portugal-vs-uzbekistan-preview-predicted-lineups-team-news-tactical-analysis-2026-world-cup-group-k-119186"],
      ["Covers 赔率/伤停/天气", "https://www.covers.com/world-cup/portugal-vs-uzbekistan-prediction-picks-odds-tuesday-6-23-2026"]
    ]
  },
  {
    matchId: "400021506",
    matchCode: "ENG-GHA",
    title: "英格兰 vs 加纳",
    localHtml: "英格兰vs加纳赛前24小时补发报告.html",
    localJson: "england_ghana_prematch_snapshot.json",
    publicTarget: "england-ghana-prematch.html",
    scheduledPushBjt: "2026-06-23 04:00:00",
    pick: "英格兰 3-0 加纳",
    confidence: "高",
    probabilities: { home: 76, draw: 16, away: 8 },
    marketNormalized: { home: 74, draw: 17, away: 9 },
    xg: { home: 2.38, away: 0.72 },
    thesis:
      "这是 Group L 的头名争夺战。英格兰首轮 4 比 2 击败克罗地亚，进攻端制造了 20 次射门；加纳则靠补时绝杀 1 比 0 拿下巴拿马。市场把英格兰定价为极强热门，模型同意主胜方向，并且认为 Bellingham 在肋部驱动、Kane 的禁区终结和边路冲击能持续压低加纳的反击回合数。",
    lineups: {
      home: {
        shape: "4-2-3-1",
        players: "Jordan Pickford; Reece James, Ezri Konsa, John Stones, Nico O'Reilly; Declan Rice, Elliot Anderson; Noni Madueke, Jude Bellingham, Anthony Gordon; Harry Kane",
        injury: "Marcus Rashford 紧张腿筋后预计可用；Saka 在市场稿件里被列为疑问"
      },
      away: {
        shape: "4-2-3-1",
        players: "Benjamin Asare; Marvin Senaya, Jonas Adjetey, Jerome Opoku, Gideon Mensah; Thomas Partey, Caleb Yirenkyi, Elisha Owusu; Ernest Nuamah, Jordan Ayew, Antoine Semenyo",
        injury: "Partey 已清出伤停表；Ati-Zigi 大概率缺席，Asare 继续把门"
      }
    },
    tactics: [
      "Bellingham 在中线到禁区弧顶的转身推进，是英格兰最难限制的触发器；Partey 和 Yirenkyi 必须第一时间封转身。",
      "Tuchel 大概率延续 4-2-3-1，高位边后卫会把 Ghana 压进 4-4-1-1 甚至 6 后卫防守状态。",
      "Ghana 的得分路径主要是 Semenyo 或 Nuamah 攻击英格兰边后卫身后，抢转换第一脚。",
      "如果英格兰先手进球，加纳被迫前压后会暴露更多回追空间。"
    ],
    risks: [
      "英格兰首轮也丢了 2 球，说明回防深度和边后卫身后并非无风险。",
      "Foxborough 的轻雨和偏凉环境会把比赛带向更多二点争夺和定位球随机性。",
      "若 Saka/Rashford 其中一人无法出场，英格兰替补冲击力会略降。"
    ],
    scores: [["3-0", 17], ["2-0", 15], ["3-1", 12], ["2-1", 10], ["1-0", 9], ["1-1", 6], ["4-1", 5]],
    weather:
      "Boston/Foxborough 当地 6 月 23 日偏凉并伴随阵雨，白天仅约 20C；湿滑草皮会让直塞和二点球更重要。",
    sources: [
      ["FIFA 官方比赛中心", "https://www.fifa.com/en/match-centre/match/17/285023/289274/400021506"],
      ["FIFA 官方赛程 API", FIFA_URL],
      ["RotoWire 赛前预览", "https://www.rotowire.com/soccer/article/england-vs-ghana-preview-predicted-lineups-team-news-tactical-analysis-2026-world-cup-group-l-119187"],
      ["Covers 赔率/伤停/天气", "https://www.covers.com/world-cup/england-vs-ghana-prediction-picks-odds-tuesday-6-23-2026"]
    ]
  },
  {
    matchId: "400021511",
    matchCode: "PAN-CRO",
    title: "巴拿马 vs 克罗地亚",
    localHtml: "巴拿马vs克罗地亚赛前24小时补发报告.html",
    localJson: "panama_croatia_prematch_snapshot.json",
    publicTarget: "panama-croatia-prematch.html",
    scheduledPushBjt: "2026-06-23 07:00:00",
    pick: "巴拿马 1-2 克罗地亚",
    confidence: "中",
    probabilities: { home: 20, draw: 24, away: 56 },
    marketNormalized: { home: 18, draw: 25, away: 57 },
    xg: { home: 0.97, away: 1.68 },
    thesis:
      "两队首轮都输球，已经接近必须取分。克罗地亚 2 比 4 负于英格兰，进攻效率尚可但防线转身速度被打穿；巴拿马则在长时间不落下风的情况下补时丢给加纳。市场仍把克罗地亚放在明显优势位，模型接受这个结论，但因为克罗地亚后场不稳，所以更偏向 2 比 1 而非大胜。",
    lineups: {
      home: {
        shape: "3-4-3",
        players: "Orlando Mosquera; Cesar Blackman, Jose Cordoba, Jiovany Ramos; Michael Amir Murillo, Carlos Harvey, Cristian Martinez, Andres Andrade; Yoel Barcenas, Cecilio Waterman, Jose Luis Rodriguez",
        injury: "Carrasquilla 腹股沟恢复期，RotoWire 认为本场缺席"
      },
      away: {
        shape: "4-3-3",
        players: "Dominik Livakovic; Josip Stanisic, Josip Sutalo, Duje Caleta-Car, Josko Gvardiol; Mateo Kovacic, Luka Modric, Petar Sucic; Martin Baturina, Petar Musa, Ivan Perisic",
        injury: "无关键新增伤停"
      }
    },
    tactics: [
      "Modric 的纵向调度是克罗地亚压制比赛的核心，Panama 需要 Harvey 和中前场协防去切断他向肋部的直塞。",
      "Dalic 可能从首轮的更保守结构回到更典型的 4 后卫，释放 Perisic 专心参与终结与传中。",
      "巴拿马会坚持 3-4-3 的紧凑防守，再用 Waterman、Rodriguez 的速度打克罗地亚中卫身后。",
      "若 Panama 被迫过早压上，Gvardiol 和 Stanisic 的边后场推进会形成持续压制。"
    ],
    risks: [
      "克罗地亚首轮失 4 球暴露出退防慢，若再次被反击打身后，平局概率会迅速抬升。",
      "Panama 定位球和第二落点强度不差，Toronto 的开放式场地也更容易放大偶发球。",
      "如果 Carrasquilla 意外复出，Panama 中场的持球和推进能力会明显改善。"
    ],
    scores: [["1-2", 18], ["0-2", 14], ["1-1", 12], ["0-1", 11], ["1-3", 9], ["2-2", 6], ["2-1", 5]],
    weather:
      "Toronto 当地傍晚约 20C，风力不大且无明显降雨，属于对开放式场地较友好的天气；更关键的是比赛节奏和克罗地亚退防质量。",
    sources: [
      ["FIFA 官方比赛中心", "https://www.fifa.com/en/match-centre/match/17/285023/289274/400021511"],
      ["FIFA 官方赛程 API", FIFA_URL],
      ["RotoWire 赛前预览", "https://www.rotowire.com/soccer/article/panama-vs-croatia-preview-predicted-lineups-team-news-tactical-analysis-2026-world-cup-group-l-119188"],
      ["Covers 赔率/伤停/天气", "https://www.covers.com/world-cup/croatia-vs-panama-prediction-picks-odds-tuesday-6-23-2026"]
    ]
  },
  {
    matchId: "400021501",
    matchCode: "COL-COD",
    title: "哥伦比亚 vs 刚果（金）",
    localHtml: "哥伦比亚vs刚果金赛前24小时补发报告.html",
    localJson: "colombia_drcongo_prematch_snapshot.json",
    publicTarget: "colombia-drcongo-prematch.html",
    scheduledPushBjt: "2026-06-23 10:00:00",
    pick: "哥伦比亚 2-0 刚果（金）",
    confidence: "中高",
    probabilities: { home: 58, draw: 25, away: 17 },
    marketNormalized: { home: 56, draw: 25, away: 19 },
    xg: { home: 1.72, away: 0.81 },
    thesis:
      "哥伦比亚首轮 3 比 1 击败乌兹别克斯坦，刚果（金）则爆冷 1 比 1 逼平葡萄牙。盘口虽然尊重刚果（金）的首轮表现，但仍站在哥伦比亚一侧。模型认为 Nestor Lorenzo 的 4-3-3 在 James 和 Luis Diaz 的双核带动下更有持续制造机会的能力，而刚果（金）继续深守打反击能把比赛拖紧，却未必能把机会数维持到再爆一次冷门。",
    lineups: {
      home: {
        shape: "4-3-3",
        players: "Camilo Vargas; Daniel Munoz, Jhon Lucumi, Davinson Sanchez, Johan Mojica; Jefferson Lerma, Gustavo Puerta, Jhon Arias; James Rodriguez, Luis Suarez, Luis Diaz",
        injury: "RotoWire 与 Covers 均未列出关键伤停"
      },
      away: {
        shape: "3-5-2",
        players: "Lionel Mpasi; Steve Kapuadi, Chancel Mbemba, Axel Tuanzebe; Aaron Wan-Bissaka, Edo Kayembe, Ngal'ayel Mukau, Samuel Moutoussamy, Arthur Masuaku; Cedric Bakambu, Yoane Wissa",
        injury: "无关键伤停"
      }
    },
    tactics: [
      "James 在肋部的转身和直塞决定哥伦比亚能否把控球优势转化为高质量机会。",
      "Munoz 首轮已经证明自己能从右后卫位置形成后插上终结，这是刚果（金）左翼防守最大的压力点。",
      "Desabre 会继续让刚果（金）压成 5-3-2 / 5-4-1，靠 Wissa、Bakambu 速度打转换。",
      "若哥伦比亚过早压上且 Lerma 保护不到位，刚果（金）两个前锋足以制造单次反击致命球。"
    ],
    risks: [
      "刚果（金）首轮已经证明可以把强队拖进低节奏泥地战，这对主让方向不利。",
      "Guadalajara 夜间局部阵雨和海拔背景会增加体能波动，拖慢哥伦比亚的连续冲击。",
      "James 若被 Kayembe/Moutoussamy 挤掉正面转身空间，哥伦比亚进攻会更依赖边路传中。"
    ],
    scores: [["2-0", 16], ["1-0", 14], ["2-1", 13], ["1-1", 10], ["3-1", 8], ["0-0", 6], ["1-2", 4]],
    weather:
      "Guadalajara 当地晚间预报偏多云并有局部阵雨机会，体感大致在 20C 出头；开放场地下雨并不会毁掉比赛，但会提高守转攻的偶发性。",
    sources: [
      ["FIFA 官方比赛中心", "https://www.fifa.com/en/match-centre/match/17/285023/289273/400021501"],
      ["FIFA 官方赛程 API", FIFA_URL],
      ["RotoWire 赛前预览", "https://www.rotowire.com/soccer/article/colombia-vs-dr-congo-preview-predicted-lineups-team-news-tactical-analysis-2026-world-cup-group-k-119191"],
      ["Covers 赔率/伤停/天气", "https://www.covers.com/world-cup/colombia-vs-congo-prediction-picks-odds-tuesday-6-23-2026"]
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
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
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
  return rows
    .map(
      ([score, pct]) =>
        `<div class="heat-row"><span>${score}</span><i style="width:${Math.round((pct / max) * 100)}%"></i><b>${pct}%</b></div>`
    )
    .join("");
}

function buildTable(matches, groupName) {
  const rows = new Map();
  const get = (code, name) => {
    if (!rows.has(code)) rows.set(code, { code, name, played: 0, gf: 0, ga: 0, gd: 0, points: 0 });
    return rows.get(code);
  };

  for (const item of matches.filter(
    (m) => desc(m.GroupName) === groupName && Number.isFinite(m.Home?.Score) && Number.isFinite(m.Away?.Score)
  )) {
    const h = get(item.Home.Abbreviation, item.Home.ShortClubName);
    const a = get(item.Away.Abbreviation, item.Away.ShortClubName);
    h.played += 1;
    a.played += 1;
    h.gf += item.Home.Score;
    h.ga += item.Away.Score;
    a.gf += item.Away.Score;
    a.ga += item.Home.Score;
    h.gd = h.gf - h.ga;
    a.gd = a.gf - a.ga;
    if (item.Home.Score > item.Away.Score) h.points += 3;
    else if (item.Home.Score < item.Away.Score) a.points += 3;
    else {
      h.points += 1;
      a.points += 1;
    }
  }

  return [...rows.values()].sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf);
}

function tableHtml(rows) {
  return rows
    .map(
      (r) =>
        `<tr><td>${teamChip(r.code, r.name)}</td><td>${r.played}</td><td>${r.gf}:${r.ga}</td><td>${r.gd > 0 ? "+" : ""}${r.gd}</td><td>${r.points}</td></tr>`
    )
    .join("");
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
    *{box-sizing:border-box}body{margin:0;font-family:"Microsoft YaHei","PingFang SC","Segoe UI",Arial,sans-serif;background:linear-gradient(145deg,#071a3a,#0b2f6c 58%,#07111f);color:var(--ink)}
    .deck{width:min(100%,760px);margin:0 auto;background:#f6f9fd}.slide{min-height:100svh;padding:27px 22px 34px;display:flex;flex-direction:column;gap:15px;position:relative;overflow:hidden}.dark{color:#fff;background:linear-gradient(150deg,#071a3a,#0b2f6c)}.dark:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:40px 40px}.slide>*{position:relative}h1,h2,h3,p{margin:0}h1{font-size:42px;line-height:1.04}h2{font-size:29px;line-height:1.15}p,li{font-size:14px;line-height:1.58}.kicker{width:max-content;max-width:100%;padding:7px 11px;border-radius:999px;background:rgba(0,200,200,.18);font-weight:950;font-size:12px}.sub{color:rgba(255,255,255,.78)}
    .teams{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:center}.team-chip{display:inline-flex;align-items:center;gap:9px;min-width:0}.team-chip img{width:36px;height:36px;border-radius:50%;object-fit:cover;box-shadow:0 0 0 2px #fff,0 8px 18px rgba(0,0,0,.2)}.team-chip b{font-size:17px}.team-chip em{font-style:normal;color:var(--muted);font-weight:900}.dark .team-chip em{color:rgba(255,255,255,.64)}.versus{width:60px;height:60px;border-radius:50%;display:grid;place-items:center;background:var(--gold);color:#071a3a;font-weight:950}.panel{background:#fff;border:1px solid var(--line);border-radius:10px;padding:15px;box-shadow:0 15px 34px rgba(2,6,23,.15)}.dark .panel{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2);color:#fff}
    .meta,.grid2,.grid3{display:grid;gap:11px}.meta{grid-template-columns:repeat(2,1fr)}.grid2{grid-template-columns:1fr 1fr}.grid3{grid-template-columns:repeat(3,1fr)}.meta div{padding:11px;border-radius:8px;background:rgba(255,255,255,.12)}.meta b{display:block;font-size:12px;color:rgba(255,255,255,.66)}
    .probbar{display:grid;height:18px;border-radius:999px;overflow:hidden;background:#dce7f1}.probbar i:nth-child(1){background:#4cc9f0}.probbar i:nth-child(2){background:#aab8c8}.probbar i:nth-child(3){background:#bb1234}.labels{display:flex;justify-content:space-between;font-size:12px;font-weight:950;color:var(--muted);gap:8px}.dark .labels{color:rgba(255,255,255,.72)}.big-num{font-size:34px;font-weight:950;line-height:1}.lane{display:grid;grid-template-columns:1fr 1fr;gap:10px}.lane div{min-height:130px;border-radius:10px;padding:12px;background:linear-gradient(180deg,#0d805a,#14996f);color:#fff;border:2px solid rgba(255,255,255,.45)}table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:9px 7px;border-bottom:1px solid var(--line);text-align:left}th{background:#071a3a;color:#fff}td .team-chip img{width:25px;height:25px}td .team-chip b{font-size:13px}.heat{display:grid;gap:8px}.heat-row{display:grid;grid-template-columns:46px 1fr 38px;gap:8px;align-items:center}.heat-row i{display:block;height:18px;border-radius:999px;background:linear-gradient(90deg,var(--cyan),var(--gold))}.source-list a{display:block;color:#071a3a;background:#fff;border-left:6px solid var(--cyan);padding:11px;border-radius:8px;text-decoration:none;font-weight:900;margin-bottom:8px}.page-no{position:absolute;right:20px;bottom:14px;font-size:12px;font-weight:950;opacity:.48}
    @media(max-width:560px){.slide{padding:23px 17px}.teams,.grid2,.grid3,.meta,.lane{grid-template-columns:1fr}h1{font-size:35px}h2{font-size:25px}.versus{width:52px;height:52px}.team-chip b{font-size:16px}}
  </style>
</head>
<body><main class="deck">
  <section class="slide dark">
    <div class="kicker">Backfill · Missed 24h push window</div>
    <h1>${esc(report.title)}<br>赛前预测补发</h1>
    <p class="sub">应推送时间 ${report.scheduledPushBjt} BJT；补发时间 ${generatedAtBjt} BJT。比赛仍未开赛，因此按赛前报告补发。</p>
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
    <div class="lane"><div><h3>${esc(home.name)}</h3><ul>${list(report.tactics.slice(0, 2))}</ul></div><div><h3>${esc(away.name)}</h3><ul>${list(report.tactics.slice(2))}</ul></div></div>
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
    <div class="panel"><p>本场属于错过精确 24 小时节点后的补发。小组赛果和积分均取自当前官方赛程快照，后续不会被赛后信息改写本快照。</p></div>
    <div class="page-no">05 / 小组</div>
  </section>
  <section class="slide">
    <div class="kicker">Score Heat</div><h2>比分分布与市场</h2>
    <div class="panel heat">${scoreHeat(report.scores)}</div>
    <div class="panel"><p>盘口归一化约为：主胜 ${report.marketNormalized.home}% / 平 ${report.marketNormalized.draw}% / 客胜 ${report.marketNormalized.away}%。模型在盘口基础上叠加首轮表现、阵容稳定性、战术对位和场地天气。</p></div>
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
  if (!match) {
    throw new Error(`Missing match ${report.matchId}`);
  }

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
    title: report.title,
    kickoffBjt: snapshot.match.kickoffBjt,
    reportPath: report.localHtml,
    dataPath: report.localJson,
    publicTarget: report.publicTarget,
    pushedAtBjt: generatedAtBjt,
    scheduledPushBjt: report.scheduledPushBjt,
    mode: "backfill-missed-24h-window"
  };
  if (index >= 0) sentReports[index] = sentEntry;
  else sentReports.push(sentEntry);
}

await fs.writeFile("sent_pre_match_reports.json", `${JSON.stringify({ reports: sentReports }, null, 2)}\n`, "utf8");
console.log(`Wrote ${reports.length} June 24 pre-match backfill reports.`);
