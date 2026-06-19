# GJMZZ-DP 需求文档库

> 高精密制造数字化平台 (Gao Jing Mi Zhizao Digital Platform)
> 仓库:`/root/DataDisk/workspace/GJMZZ-DP`
> 维护者:开发团队
> 状态:随项目持续演进

## 1. 这是什么

本目录是**项目需求与逻辑梳理的单一事实来源(SSOT)**,与代码库 `apps/`、`infra/`、`design/`、`docs/` 互为补充:

| 维度 | 代码/物料 | 需求文档 |
|---|---|---|
| 业务是什么 | `design/Concept`、`design/IA`、`design/Org` | `03_modules/` |
| 怎么设计 | `design/System`、`design/Prototype` | `02_architecture/` |
| 怎么实现 | `apps/*`、`packages/*` | `02_applications/` |
| 怎么运行 | `docker-compose.yml`、`infra/` | `06_runtime/` |
| 怎么变更 | (无统一位置) | `07_changelog/` |
| 谁来建设 | (无统一位置) | `09_team/` |

## 2. 目录结构

```
requirements/
├── README.md                          ← 本文件
├── 00_overview/                       ← 顶层概览(项目一句话、目标、范围)
│   ├── 01_项目概览.md
│   ├── 02_五域业务模型.md
│   ├── 03_三层组织与角色.md
│   └── 04_技术栈与依赖一览.md
│
├── 01_architecture/                   ← 架构设计
│   ├── 01_系统架构总览.md
│   ├── 02_部署架构(Docker).md
│   ├── 03_路由与URL规划.md
│   └── 04_SSO与权限设计.md
│
├── 02_applications/                   ← 应用清单(每个 App 一份)
│   ├── 01_portal-ui(PC总门户).md
│   ├── 02_mobile-portal-ui(移动H5).md
│   ├── 03_cockpit-ui(驾驶舱大屏).md
│   ├── 04_mobile-app(原生Android).md
│   └── 05_factory-api(后端API).md
│
├── 03_modules/                        ← 业务模块需求(按五域+审批中心)
│   ├── 01_经营域_Business.md
│   ├── 02_管理域_Management.md
│   ├── 03_生产域_Production.md
│   ├── 04_支持域_Support.md
│   ├── 05_附加域_Additional.md
│   └── 06_审批中心_Workflow.md
│
├── 04_data/                           ← 数据层
│   ├── 01_数据模型与Mock设计.md
│   └── 02_Prisma与数据库设计.md
│
├── 05_workflow/                       ← 流程引擎(原 docs/workflow 沉淀)
│   └── README.md
│
├── 06_runtime/                        ← 运行时与运维
│   ├── 01_本地开发流程.md
│   └── 02_常见问题与故障.md
│
├── 07_changelog/                      ← 需求/设计变更记录
│   ├── template.md
│   └── CHANGELOG.md
│
├── 08_role-journeys/                  ← 业务角色端到端验收(15 角色)
│   ├── 01_role-matrix-highlevel.md
│   ├── 02_keycloak-users-seed.md
│   ├── 03_role-matrix-middleground.md
│   ├── 04_acceptance-checklist-middleground.md
│   ├── 05_acceptance-checklist.md
│   ├── 05_role-matrix-frontline.md
│   ├── 06_acceptance-checklist-frontline.md
│   ├── 07_role-menu-mapping.md
│   ├── api-tests/                     ← 15 角色 API smoke 脚本
│   ├── e2e-screenshots/               ← Playwright 截图
│   └── ground|highlevel|middle/       ← 验收测试脚本
│
├── 09_team/                           ← 团队组建方案(谁来建设业务能力)
│   ├── README.md                          索引 + 一句话总结
│   ├── 01_团队组建总览.md                 6 个核心问题 + 招聘原则 + 阶段
│   ├── 02_组织架构与岗位体系.md           组织架构图 + 岗位清单 + P4-P7
│   ├── 03_岗位JD_产品.md                  产品经理 / UI/UX / 数据分析师
│   ├── 04_岗位JD_技术.md                  技术负责人 / Flowable BPM / 前后端 / DevOps / QA
│   ├── 05_岗位JD_制造业务.md              制造业务架构师 / 生产/质量/设备域 BA
│   ├── 06_岗位JD_运营与支持.md            实施 / 客户成功 / HR / 法务 / 财务
│   ├── 07_薪酬体系.md                     薪酬结构 + 级别表 + 试用期 + 调薪
│   ├── 08_招聘流程与渠道.md               招聘渠道 + 4 轮面试 + 入职培训
│   ├── 09_绩效晋升与文化.md               绩效考核 + 晋升通道 + 期权 + 文化建设
│   └── 10_预算_风险_行动.md               12 月预算 + 12 风险 + 30 天行动
│
└── assets/                            ← 需求相关图、表格(可选)
```

## 3. 阅读路径建议

| 你是谁 | 从哪开始读 |
|---|---|
| 新加入的开发者 | `00_overview/` → `01_architecture/` → `02_applications/` |
| 做需求评审的产品/业务方 | `00_overview/02_五域业务模型.md` → `03_modules/` |
| 做架构/基建的工程师 | `01_architecture/` → `04_data/` |
| 写某个模块的业务代码 | 对应 `03_modules/0X_*.md` → 对应 `02_applications/0X_*.md` |
| 跑/排障环境 | `06_runtime/` |
| 想知道"为什么这么改" | `07_changelog/` |
| 招人 / 组建团队 | `09_team/` |

## 4. 维护约定

1. **新增模块**:在 `03_modules/` 新增 `0N_<域>_<模块>.md`,并在对应 `02_applications/` 中说明前端落点。
2. **设计/范围变更**:在 `07_changelog/CHANGELOG.md` 顶部追加一条记录(可附 `template.md` 起草)。
3. **与代码同步**:文件名与代码目录保持一致(如 `apps/portal-ui/src/app/pages/management/expense` ↔ `03_modules/02_管理域_Management.md` 内的"费用报销"小节)。
4. **不在本目录写代码**:本目录只承载"是什么/为什么/边界",实现细节放代码注释。
5. **图与原型**:`assets/` 放 PNG/SVG/Figma 截图;`design/` 已有的视觉稿以引用形式链接,不要复制。

## 5. 当前状态

| 模块 | 文档 | 代码 | Mock | 备注 |
|---|---|---|---|---|
| 经营域(驾驶舱) | ✅ | ✅ | ✅ | 仅驾驶舱摘要,其他为占位 |
| 管理域(审批中心) | ✅ | ✅ | ✅ | 已对接 Flowable 雏形 |
| 管理域(采购/供应商) | 🟡 | ✅ | ✅ | 视觉位,后端为占位接口 |
| 生产域(工单/排程/质量) | 🟡 | ✅ | ✅ | 驾驶舱/工单/排程/质量/设备/告警 |
| 支持域(财务/IT) | 🟡 | ✅ | ✅ | 大部分为占位 |
| 附加域(党群/工会/妇联) | 🟡 | ✅ | ✅ | 申请/查询/内容中心 |
| 移动端(Capacitor APK) | 🟡 | ✅ | ✅ | 已知白屏问题,见 `06_runtime/02_*` |
| 移动门户 H5 | ✅ | ✅ | ✅ | 复用 portal-ui 业务组件 |
| 驾驶舱(大屏) | ✅ | ✅ | ✅ | echarts + recharts |

> ✅ 完成  🟡 进行中/P0-P1 部分  ❌ 未开始
