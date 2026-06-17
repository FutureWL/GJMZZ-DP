# 02 mobile-portal-ui(移动 H5)

> 路径:`apps/mobile-portal-ui/`
> 端口:容器内 80,主机 33702;网关反代在 `/m/`
> 角色:手机浏览器访问的入口;**比原生 APP 更轻**,无 Android 依赖

## 1. 技术栈

- React 19.2 + Vite 8(开发期端口 5180,`vite --host 0.0.0.0 --port 5180`)
- TypeScript ~6.0.2
- React Router v7
- Tailwind 3.4 + clsx
- keycloak-js 26.0.5
- lucide-react
- `@factory/mock-data`(共享样例)

> 与 `portal-ui` 的差异:**不引入 echarts/recharts、react-hook-form/zod**,保持 H5 包体小、加载快。

## 2. 目录结构

```
apps/mobile-portal-ui/
├── Dockerfile
├── nginx.conf
├── index.html
├── src/
│   ├── main.tsx
│   ├── index.css
│   └── app/
│       ├── App.tsx
│       ├── routes/
│       ├── pages/
│       │   ├── auth/        # 登录/OIDC 回调
│       │   ├── crm/         # 客户与机会(简化版)
│       │   ├── HomePage.tsx
│       │   ├── MePage.tsx
│       │   └── TasksPage.tsx
│       ├── state/           # 状态(简单 store)
│       └── ui/              # 移动端 UI 组件
├── vite.config.ts
└── package.json
```

## 3. 路由

- `/` 首页(Tab 容器)
- `/crm` 客户与机会
- `/tasks` 待办
- `/me` 我的
- `/auth/*` 登录与回调

## 4. 与其他 App 的关系

- 共享 `mobile-portal-ui` 的设计语言(底部 Tab + 卡片),不复用 portal-ui 全部业务页。
- 与 `mobile-app`(Capacitor)的区别:本应用是"可被 WebView / 浏览器直接打开",后者是"安装到 Android 的独立 APP"。

## 5. 关键约束

- 移动 UA 走 `mobile-portal-ui`,由网关根据 UA 重写。
- H5 不强制 Keycloak;`AUTH_ENABLED=false` 时可匿名访问 mock。
- 性能优先:首屏 < 200KB JS(粗略目标),关闭大型图表库。

## 6. 构建/运行

```bash
# 容器化
docker compose up -d --build mobile-portal-ui

# 本地开发
pnpm -C apps/mobile-portal-ui dev
# 访问 http://localhost:5180
```

## 7. 待办

- [ ] 接入真实审批中心 API(目前走 mock)
- [ ] 底部 Tab 持久化(记忆上次停留)
- [ ] 推送通道(Web Push)
