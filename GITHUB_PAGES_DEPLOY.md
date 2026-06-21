# GitHub Pages 发布说明

目标：生成朋友通过微信也能打开的公网链接。

## 已准备好的发布目录

本仓库已经生成 `docs/`，里面有：

- `index.html`：报告站首页
- `four-match-predictions.html`：今日四场预测包
- `prematch-report-plan.html`：赛前 24 小时推送计划
- `progress-2026-06-20-0000-bjt.html`：世界杯进度报告
- `netherlands-sweden-prediction.html`：荷兰 vs 瑞典预测
- `data/`：配套 JSON 数据快照

## GitHub Pages 设置

根据 GitHub Pages 官方文档，纯静态站点可以直接从仓库分支的根目录或 `/docs` 目录发布。

推荐设置：

1. 把本目录推送到 GitHub 仓库。
2. 打开仓库网页。
3. 进入 `Settings`。
4. 左侧进入 `Pages`。
5. `Build and deployment` 选择 `Deploy from a branch`。
6. `Branch` 选择 `main` 或 `master`。
7. 文件夹选择 `/docs`。
8. 保存后等待 GitHub Pages 发布。

发布成功后，公网链接会类似：

```text
https://<你的GitHub用户名>.github.io/<仓库名>/
https://<你的GitHub用户名>.github.io/<仓库名>/four-match-predictions.html
```

## 不能转发的链接

以下链接只在你的电脑上能打开，不能发给朋友：

- `file:///...`
- `C:\...`
- `http://127.0.0.1:...`
- `http://localhost:...`

微信转发必须使用 `https://...` 的公网链接。
