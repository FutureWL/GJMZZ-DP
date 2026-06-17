# 01 portal-ui(PC 总门户)

> 路径:`apps/portal-ui/`
> 端口:容器内 80,主机 33701;统一入口走网关 33700
> 角色:员工日常使用的主入口,覆盖 PC 端全功能

## 1. 技术栈

- React 19.2 + Vite 8
- TypeScript ~6.0.2
- React Router v7(`react-router-dom`)
- Tailwind 3.4 + clsx
- echarts 6 + echarts-for-react(图表)
- recharts 3.8(轻量图表)
- react-hook-form 7 + zod 4 + @hookform/resolvers(表单)
- lucide-react(图标)
- keycloak-js 26.0.5(SSO)
- `@factory/mock-data`(workspace 共享样例数据)

## 2. 目录结构

```
apps/portal-ui/
├── Dockerfile
├── nginx.conf           # SPA fallback 到 index.html
├── index.html
├── public/              # 静态资源
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── app/
│       ├── App.tsx
│       ├── appMeta.ts            # 标题、document.title
│       ├── routes/              # 路由表
│       ├── layout/              # 顶部/侧边栏/全局区
│       ├── pages/
│       │   ├── auth/            # 登录/回调
│       │   ├── business/        # 经营域
│       │   ├── management/      # 管理域
│       │   ├── production/      # 生产域
│       │   ├── support/         # 支持域
│       │   ├── additional/      # 附加域
│       │   ├── workflow/        # 审批中心
│       │   ├── workbench/       # 工作台
│       │   ├── account/         # 个人信息
│       │   ├── prototypes/      # 原型
│       │   ├── SearchPage.tsx
│       │   └── PlaceholderPage.tsx
│       ├── api/                 # axios/请求封装
│       ├── mock/                # 业务 mock(可选,大多走 @factory/mock-data)
│       ├── config/              # 角色/常量
│       ├── state/               # 轻量状态(若需要)
│       ├── ui/                  # 通用 UI
│       ├── utils/
│       └── types.ts
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.{json,app.json,node.json}
└── package.json
```

## 3. 关键页面/模块

详见 `03_modules/0X_*.md` 中每个业务域对应的 portal-ui 页面。本目录只说明"应用形态"。

## 4. 关键约束

- **不直接调用后端业务接口**(本期),业务数据走 `packages/mock-data`;只有登录态、菜单、基础数据(`/api/factories`、`/api/menus`)走 `factory-api`。
- **路由使用 lazy import**,确保首屏只加载当前域。
- **统一 Layout**:顶部全局区(门户切换/组织范围/搜索/消息/用户) + 侧边栏(域菜单) + 内容区。
- **PC UA 优先**:移动 UA 走 mobile-portal-ui。

## 5. 与其他 App 的关系

| 场景 | 跳转 |
|---|---|
| 移动端访问 | 跳到 `/m/`(mobile-portal-ui) |
| 大屏场景 | 跳到 `/c/`(cockpit-ui) |
| 业务 API | 走 `/api/*` → factory-api |
| 共享样例 | 从 `@factory/mock-data` 引入 |
| 原生 APP | 独立登录,暂未与 portal-ui 互通 |

## 6. 构建/运行

```bash
# 容器化(推荐)
docker compose up -d --build portal-ui

# 本地开发
pnpm -C apps/portal-ui dev
# 访问 http://localhost:5173(默认)
```

## 7. 待办(需求侧)

- [ ] 补齐各业务页面的"角色 → 可见"映射(见 `00_overview/03_*`)
- [ ] 接入真实后端(替换 mock)
- [ ] 暗色模式(可选)
- [ ] 国际化(可选)
