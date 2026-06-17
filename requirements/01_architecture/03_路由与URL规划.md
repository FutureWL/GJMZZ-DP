# 03 路由与 URL 规划

> 约定:
> - 域名/路径在**网关**层是稳定的,前端在容器内可使用相对路径。
> - 移动 H5 与 PC 共用业务组件(`packages/mock-data`),但路由结构独立维护。
> - 原生 APP(`mobile-app`)的 WebView 内部路径以 `/`(根)为基准,与 web 版 `/m/app/` 不同。

## 1. 网关层(对外稳定 URL)

| 路径 | 上游 | 备注 |
|---|---|---|
| `/` | portal-ui 或 mobile-portal-ui(按 UA) | 桌面 UA 跳 portal,移动 UA 跳 mobile-portal |
| `/m/` | mobile-portal-ui | 显式移动端入口 |
| `/m/app/` | mobile-portal-ui(子应用,如 mobile-app web 部分) | 留作未来使用 |
| `/c/` | cockpit-ui | 驾驶舱大屏 |
| `/api/` | factory-api | 业务 API |
| `/auth/` | keycloak | 反代 SSO(可选) |
| `/docs/` | factory-api(Swagger) | API 文档 |
| `/tools/minio/` | minio console 重定向 | |
| `/rabbitmq/` | rabbitmq 管理台 | |
| `/cloudbeaver/` | cloudbeaver | 备用,默认走 33706 |

## 2. portal-ui(PC)路由

> 来源:由 `apps/portal-ui/src/app/routes/` 与 `pages/` 目录推导。`PlaceholderPage.tsx` 为通用占位。

```
/login                     登录
/                          首页/工作台(workbench)
/search                    全局搜索
/account                   个人信息
/business                  经营域
  /business/cockpit        经营驾驶舱
/management                管理域
  /management/expense      费用报销
  /management/procurement  采购管理(PR/RFQ/PO)
  /management/supplier     供应商管理
  /management/subcontract  外协工厂
  /management/contract     合同评审
/production                生产域
  /production/overview     工厂总览
  /production/work-orders  工单
  /production/schedule     排程(甘特)
  /production/quality      质量
  /production/equipment    设备
  /production/oee          OEE
  /production/alarm        告警
  /production/trace        追溯
/support                   支持域
  /support/it-tickets      IT 工单
  /support/finance         财务
  /support/hr              人事
/additional                附加域
  /additional/tdc          人才发展中心
  /additional/party        党群
  /additional/union         工会
  /additional/women        妇联
/workflow                  流程中心
  /workflow/inbox          待办
  /workflow/done           已办
  /workflow/cc             抄送
  /workflow/detail/:id     审批详情
/prototypes                原型(视觉稿,可选)
```

## 3. mobile-portal-ui(移动 H5)路由

```
/                  底部 Tab 首页(HomePage)
/crm               客户/CRM
/tasks             待办
/me                我的(MePage)
/auth/*            登录(回调)
```

## 4. cockpit-ui(驾驶舱大屏)路由

```
/                  集团驾驶舱(echarts 大屏)
/management        管理驾驶舱
/production        生产驾驶舱
/auth              登录
```

## 5. mobile-app(原生 APP)路由

```
/                  仪表盘(DashboardTab)
/auth              登录
```

详细页面见 `apps/mobile-app/src/app/pages/`,已知问题见 `06_runtime/02_常见问题与故障.md` 中的"APK 白屏"。

## 6. 跨应用跳转约定

- 网关 33700 顶层是统一入口,登录后默认进 portal-ui。
- 在移动 UA 下访问 33700,网关可改写为 `/m/`(反代 `mobile-portal-ui`)。
- 原生 APK(`mobile-app`)目前不接入门户,独立登录后进 `/`。
- 后续若 mobile-app 复用 mobile-portal-ui 业务,可在 `capacitor.config.ts` 配置 `server.url` 指向开发期 mobile-portal-ui。
