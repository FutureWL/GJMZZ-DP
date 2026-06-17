# 03 cockpit-ui(驾驶舱大屏)

> 路径:`apps/cockpit-ui/`
> 端口:容器内 80,主机 33703;网关反代在 `/c/`
> 角色:会议室/调度大屏;**KPI 与趋势大数字为主,交互极少**

## 1. 技术栈

- React 19.2 + Vite 8
- TypeScript ~6.0.2
- React Router v7
- Tailwind 3.4 + clsx
- recharts 3.8(轻量图表,优于 echarts 在大屏上的体积/性能比)
- keycloak-js 26.0.5
- lucide-react
- `@factory/mock-data`

> 与 `portal-ui` 的差异:**只装 recharts,不装 echarts/表单库**;首屏"全屏数字"形态。

## 2. 目录结构

```
apps/cockpit-ui/
├── Dockerfile
├── nginx.conf
├── src/
│   ├── main.tsx
│   ├── index.css
│   └── app/
│       ├── App.tsx
│       ├── layout/        # 大屏布局(无侧边栏,顶部窄)
│       ├── pages/
│       │   ├── auth/
│       │   ├── HomePage.tsx           # 集团驾驶舱
│       │   ├── ManagementScreen.tsx
│       │   └── ProductionScreen.tsx
│       ├── routes/
│       ├── shared/        # 卡片/数字/图表组件
│       ├── state/
│       └── ui/
├── vite.config.ts
└── package.json
```

## 3. 路由

- `/` 集团驾驶舱首页
- `/management` 管理驾驶舱
- `/production` 生产驾驶舱
- `/auth` 登录

## 4. 设计目标

- 16:9 / 21:9 / 拼接屏适配(横屏主)
- 字体偏大,KPI 数字建议 ≥ 48px
- 极少交互:自动轮播 + 单点下钻(链接到 portal-ui 对应页)
- 暗色背景 + 高对比度

## 5. 与其他 App 的关系

- 数据来源主要走 `mock-data`(样例),未来对接 `factory-api` 的 `/api/metrics/*`。
- 不做"门户切换",仅展示 1-2 个域,完整业务去 portal-ui。

## 6. 构建/运行

```bash
docker compose up -d --build cockpit-ui
pnpm -C apps/cockpit-ui dev
```

## 7. 待办

- [ ] 大屏数字动画(数字滚动/翻牌器)
- [ ] 自适应拼接屏(2K/4K)
- [ ] 与生产域告警实时联动(WebSocket)
