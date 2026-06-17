# 需求/设计变更记录(Changelog)

> 按时间倒序记录;每条引用 `template.md` 起草
> 早期历史(仓库 `git log`)由 GitHub/GitLab 自动维护,这里只承载"为什么/影响/回滚"等业务级变更

---

## 2026-06-17  ·  全量回归 + 测试隔离机制

- **类型**:测试质量提升
- **作者**:@dev
- **业务背景**:之前顺序跑 5/5/5 有时只过 2/5/5。问题:简单审批任务跨测试残留(同一 user 还能看到上一轮的 task);`get_my_tasks` 返回全量任务而非按业务隔离;部分测试直接用 unprefixed bk,与 `start_simple_approval` 内部加 prefix 冲突
- **隔离机制**(全部加进 `common.sh`):
  1. **TEST_PREFIX**:全局唯一(`t$$-$(date +%s%N)`),所有 `start_*` 函数自动给 bk 加 prefix
  2. **preflight reset**:每个测试开头 `reset_all_processes` 删所有 active 流程(用 Flowable REST DELETE)
  3. **trap cleanup**:测试退出时 `cleanup_prefix_processes` 只删本测试 prefix 的流程
  4. **active-task by bk**:用 `get_active_task_json "$token" "${TEST_PREFIX}-$BK"` 按 bk 拿,不用 `get_my_tasks`(全量)
  5. **start_*_get_id / start_workflow**:返回 process id,写 `last_bk` 供后续步骤用
- **踩坑记录**:
  - bash `${1:-{}}` 双 `}` 拼接问题 → 改用 `${1-}` + 默认赋值
  - `URLSearchParams` 在 Node 20+ 不会编码 hyphen,正常
  - `get_active_task_json` 在某些时机返回 no_instance(本应是同一 bk)→ 改为存文件读取
  - Flowable REST 返回包在 `{"data":[...]}` 中
- **验证**:
  - 连续 3 轮跑 `run-all-highlevel` + `run-all-middleground` + `run-all-frontline` → **全 ALL GREEN (15/15)**
  - Playwright 30/30 全过
- **交付**:测试代码稳定可重复运行,不再依赖手动清理

---

## 2026-06-17  ·  角色驱动的端到端测试 + 验收(基层 5 角色)

- **类型**:新增测试 + 文档
- **作者**:@dev
- **影响范围**:apps/factory-api/scripts/role-tests/ + requirements/08_role-journeys/
- **业务背景**:基层 5 角色(产线/计划/质量检验/维修/库管)需走各自业务,重点验证** qc_exception 完整三步链可由真实用户跑通**
- **seed 实际用户**(与原计划不同):
  - worker-line → **worker-leader**(冯班组长, approver)
  - (无对应)→ **planner**(陈计划员, approver)
  - worker-quality → **inspector**(褚检验员, **quality**) ⭐
  - worker-equipment → **tech**(卫维修, **plant_manager**)
  - (无对应)→ **warehouse**(蒋库管, approver)
- **重大价值**:
  - **inspector = quality 组** → 补齐 qc_exception 完整三步链(之前中层测试要跳过 isolate)
  - **15 用户覆盖 5 个 candidateGroup**:approver(10) / manager(1) / quality(1) / quality_manager(1) / plant_manager(2)
- **变更内容**:
  - **需求文档**(新建)
    - `requirements/08_role-journeys/05_role-matrix-frontline.md` — 5 角色 × 业务流矩阵
    - `requirements/08_role-journeys/06_acceptance-checklist-frontline.md` — 给用户的人工验收清单
  - **API smoke 脚本**(5 个)
    - `test-worker-leader.sh` / `test-planner.sh` — simple_approval 自审自批 + 隔离
    - `test-inspector.sh` ⭐ — qc_exception isolate 步骤(补齐三步链)
    - `test-tech.sh` — qc_exception review + dispose
    - `test-warehouse.sh` — simple_approval + 跨用户协作
    - `run-all-frontline.sh` — 一键跑全部
    - **结果**:5/5 全过
  - **浏览器 e2e**(`e2e/frontline.spec.js`)
    - 5 角色 × 2 测试 = 10 测试
    - **结果**:10/10 全过
    - 20 张截图到 `e2e-screenshots/frontline/`
  - **踩坑记录**:
    - 多 qc 流程同时存在时,`get_my_tasks` 返回所有任务,需用 active-task API 按 businessKey 过滤
    - Flowable REST `runtime/tasks?processInstanceId=X` 返回 `{"data":[...]}` 包装
- **验收结果**:
  - [x] 5/5 API smoke 全过
  - [x] 10/10 Playwright 全过
  - [x] 20 张截图
  - [x] **qc_exception 完整三步链由真实用户跑通**(inspector isolate → mgr-quality/tech review → tech/mgr-equipment dispose)
  - [ ] 人工验收(你手动跑)
- **下一阶段**:
  - 15 角色测试全完成
  - 文档齐全(`01_role-matrix-highlevel.md` / `03_role-matrix-middleground.md` / `05_role-matrix-frontline.md` + 3 份验收清单)
  - 35+ 自动化测试, 60+ 截图
  - 可进入“业务详情页”真实化或“角色权限细化”下一轮

---

## 2026-06-17  ·  角色驱动的端到端测试 + 验收(中层 5 角色)

- **类型**:新增测试 + 文档
- **作者**:@dev
- **影响范围**:apps/factory-api/scripts/role-tests/ + requirements/08_role-journeys/
- **业务背景**:中层 5 角色(生产/质量/采购/设备/IT 经理)需要走各自业务,重点验证跨 BPMN 协作与 candidateGroup 隔离
- **变更内容**:
  - **需求文档**(新建)
    - `requirements/08_role-journeys/03_role-matrix-middleground.md` — 5 角色 × 业务流矩阵
    - `requirements/08_role-journeys/04_acceptance-checklist-middleground.md` — 给用户的人工验收清单
  - **API smoke 脚本**(5 个)
    - `test-mgr-production.sh` — simple_approval 自审自批 + 隔离验证
    - `test-mgr-quality.sh` — qc_exception review 步骤 + simple_approval 隔离
    - `test-mgr-procurement.sh` — simple_approval + 跨用户协作
    - `test-mgr-equipment.sh` — qc_exception review + dispose 两步
    - `test-mgr-it.sh` — simple_approval + 跨用户协作
    - `run-all-middleground.sh` — 一键跑全部
    - **结果**:5/5 全过
  - **浏览器 e2e**(`e2e/middleground.spec.js`)
    - 5 角色 × 2 测试 = 10 测试
    - **结果**:10/10 全过
    - 20 张截图到 `e2e-screenshots/middleground/`
  - **踩坑记录**:
    - 菜单实际路径是 `/production/execution/scheduling` 而非 `/production/schedule`
    - Flowable REST 返回包装在 `{"data": [...]}` 中,需解析 data 字段
    - 简单审批 isolate 步骤需 quality 组用户,seed 中无 → 走 Flowable REST 跳过
- **验收结果**:
  - [x] 5/5 角色 API smoke 全过
  - [x] 10/10 Playwright 测试全过
  - [x] 20 张截图生成
  - [ ] 人工验收(你手动跑)
- **下一步**(基层 5 角色):
  - worker-line / worker-quality / worker-purchase / worker-equipment / worker-it
  - position 均为 worker,重点验证"只能看自己的数据 + 不能办审批"

---

## 2026-06-17  ·  LAN IP 访问 SSO 登录修复

- **类型**:Bugfix
- **影响范围**:Keycloak 26 + portal-ui (keycloak-js 26) + factory-api 鉴权
- **业务背景**:同网段其他机器通过 `http://192.168.x.x:33700/portal/login` 访问,SSO 跳转报 “Web Crypto API is not available”
- **踩坑记录**:
  1. **keycloak-js 26 在非 secure context 下不可用**:依赖 `crypto.randomUUID()` 和 `crypto.subtle`,仅 localhost/127.0.0.1 或 HTTPS 才是 secure context
  2. **PKCE S256 需 `crypto.subtle.digest`**:不在 secure context 则抛错
  3. **Keycloak `KC_HOSTNAME` 会硬编码登录页 form action**:与不同客户端访问地址(127.0.0.1 vs 192.168.x.x)不一致导致 “Cookie not found”
  4. **factory-api 拿不到 Keycloak**:token 的 `iss` 携带客户端访问地址,服务器不能用它拉 JWKS(服务器不访问该地址)
- **变更内容**:
  - `apps/portal-ui/src/app/state/auth/keycloak.ts`
    - Keycloak URL 动态跟随 `window.location.hostname`
    - polyfill `crypto.randomUUID` (使用 `crypto.getRandomValues`)
    - 导出 `supportsSubtleCrypto` 开关
  - `apps/portal-ui/src/app/state/auth/AuthContext.tsx`
    - init 选项 `pkceMethod`:有 subtle → 'S256'，否则 false
    - init 错误打印 `console.error` 便于调试
  - `apps/portal-ui/src/app/pages/auth/LoginPage.tsx`
    - SSO 失败时显示实际错误信息
  - `apps/factory-api/src/modules/auth/auth.service.ts`
    - JWKS URL 用容器内部地址 `http://keycloak:8080/...`
    - 跳过 `iss` 校验（仅验证签名）
  - `docker-compose.yml`
    - `KC_HOSTNAME` 默认改为空(跟请求地址走)
    - factory-api `AUTH_ISSUER` 指向内部 keycloak
  - `.env` 中 `KC_HOSTNAME=` 留空
  - `infra/compose/sso-dev/realm/factory-platform-realm.json`
    - portal-ui 客户端加 `192.168.3.104` redirect URIs / webOrigins
  - 运行 Keycloak 实例同步加了 `192.168.3.104` 两条重定向 URI
- **验收结果**:
  - `http://127.0.0.1:33700/portal/login` 登录 OK(PKCE S256)
  - `http://192.168.3.104:33700/portal/login` 登录 OK(PKCE false)
  - Playwright 10/10 全过
  - 菜单、业务 API(token)均正常
- **限制**:
  - 未上 HTTPS → Web Crypto 仅在 localhost 可用,LAN IP 走 PKCE 关闭路径
  - 生产环境务必上 HTTPS, 启用 PKCE

---

## 2026-06-17  ·  角色驱动的端到端测试 + 验收(高层 5 角色)

- **类型**:新增测试 + 文档
- **作者**:@dev
- **影响范围**:Keycloak 用户 / public.profile / apps/factory-api/scripts/role-tests / requirements/08_role-journeys
- **业务背景**:
  - 5 域 × 3 层矩阵 高层 5 角色 需要能“走”各自的系统
  - 补齐“自动化验证 + 人工验收”产物,而不是每个角色 “口头走一边”
- **变更内容**:
  - **需求文档**(新建 `requirements/08_role-journeys/`)
    - `01_role-matrix-highlevel.md` — 高层 5 角色 × 功能矩阵(路径/API/验收要点)
    - `02_keycloak-users-seed.md` — 15 角色用户 seed 方案
    - `05_acceptance-checklist.md` — 给用户的手工验收清单(5 角色 + 综合 + 已知限制)
  - **Keycloak 15 用户 seed**(`apps/factory-api/scripts/role-tests/seed-keycloak-users.mjs`)
    - 批量建 15 个用户 + reset-password + profile.position
    - **踩坑**:Keycloak 26 要求 `lastName` 非空,否则登录报 “Account is not fully set up”
  - **API 层 smoke**(5 个脚本 + 1 个总入口)
    - `common.sh` — 共享函数(get_token / get_profile / start_simple_approval / get_my_tasks / complete_task)
    - `test-ceo.sh` / `test-ceo-deputy.sh` / `test-vp-sales.sh` / `test-vp-mfg.sh` / `test-vp-finance.sh`
    - `run-all-highlevel.sh` — 一键跑全部
    - **结果**:5/5 角色 API 测试全过
  - **浏览器层 e2e**(`apps/factory-api/scripts/role-tests/e2e/highlevel.spec.js`)
    - Playwright + chromium headless
    - 每角色 2 个测试:(a) 登录 + 侧边栏 + 审批中心 (b) 提交业务 + 看任务页
    - **结果**:10/10 全过,20 张截图到 `e2e-screenshots/highlevel/`
- **影响面**:
  - Keycloak:新增 15 个用户
  - 业务库:`public.profile` 15 行(position/name/department)
  - 脚手架:`apps/factory-api/scripts/role-tests/` 独立运行(不在主项目 pnpm-workspace)
  - 需求文档:`requirements/08_role-journeys/` 目录新建
- **验收标准**(全已跑通):
  - [x] 15 用户建好(能密码登录)
  - [x] 5 角色 API smoke 5/5 过
  - [x] 5 角色 Playwright 10/10 过
  - [x] 20 张截图生成
  - [ ] 人工验收(你手动跑)
- **踩坑记录**:
  - Keycloak 26 “Account is not fully set up” = lastName 必填
  - portal-ui vite base=`/portal/`,所以 URL 是 `/portal/management/...`
  - gateway nginx 不反代 `/management/...`(只在 portal_ui 的 `^~ /portal/` 规则),需走 `portal/...` 前缀
  - npm install + npx playwright install chromium 需要下 ~150MB
- **下一步**(中层 5 角色):
  - 生产经理(`mgr-production`,position=manager)
  - 质量经理(`mgr-quality`,position=quality_manager)
  - 采购经理(`mgr-procurement`,position=approver)
  - 设备经理(`mgr-equipment`,position=plant_manager)
  - IT 经理(`mgr-it`,position=approver)
  - 复用 `seed-keycloak-users.mjs` 已建账号,只需补充 `02_role-matrix-middleground.md` + 测试

---

## 2026-06-16  ·  业务状态从 mock 切到 Flowable(L4)

- **类型**:重构 + 新增功能
- **作者**:@dev
- **影响范围**:`factory-api` workflow 模块 + 三个业务详情页 + mock context
- **业务背景**:
  - L1-L3 已把"启动流程"和"列待办"走通,但详情页"同意/退回"按钮仍调 mock context
  - 双状态机不一致:Flowable 完事 / mock 状态不更新
  - L4 目标:**Flowable 是单一状态源**;mock 状态机降级为"启动前草稿"
- **变更内容**:
  - **后端**
    - 新增 `WorkflowService.findHistoricProcessInstanceByBusinessKey`(`/history/historic-process-instances?businessKey=`)
    - 新增 `WorkflowService.getTaskIdentityLinks(taskId)`(`/runtime/tasks/{id}/identitylinks`,返回**纯数组**,不是 `{data:[]}`)
    - 新增 `GET /api/workflow/process-instances/by-business-key/:key/active-task`
      - 优先查 runtime instance;查不到查 historic
      - 合并 candidateGroups / candidateUsers 进 task 对象
      - 返回 `{ task, processInstance, isHistoric, reason? }`
  - **前端**
    - 新增 `useBusinessWorkflowStatus(businessKey)` hook
      - 派生 `derivedStatus`: `not_started | in_review | approved | rejected | suspended | unknown`
      - 计算 `canAct`: assignee 直接匹配 / candidateUsers 匹配 / candidateGroups 匹配 user.position
      - 暴露 `approve(comment) / back(comment) / reload()`,内部调 `completeWorkflowTask`
    - 改造三个详情页(`ExpenseClaimDetailPage` / `ProcurementPRDetailPage` / `ContractReviewDetailPage`)
      - 顶部按钮:`showActionButtons = wf.hasProcess && wf.derivedStatus === 'in_review' && wf.canAct`
      - 点击直接调 `wf.approve / wf.back` → `completeWorkflowTask` → Flowable 推进
      - 状态展示:优先用 `wf.derivedStatus`,Flowable 不可用时回退 mock
      - 错误提示:顶部红色错误条(`actionError`)
  - **mock context 变化**(L4 之后)
    - `submit / approve / returnToApplicant / reject` 在详情页不再被调用
    - NewPage 仍调 `submit`(L3 启动流程的副作用),但状态值在 Flowable 完成后被忽略
- **影响面**:
  - 前端:3 详情页重写,1 新 hook(状态源切换)
  - 后端:`workflow.service.ts` / `workflow.controller.ts` 加端点
  - 数据:无(本期末用 `public.workflow_bridge` 表)
  - 基础设施:无
- **验收标准**(已跑通):
  - [x] `pnpm -C apps/portal-ui build` 通过
  - [x] factory-api 重建 + 端点验证(进行中 / 已结束 / 不存在 三种场景)
  - [x] `candidateGroups: ['approver', 'manager']` 正确返回
  - [x] `isHistoric: true` 正确标注已结束实例
  - [x] demo 用户 position=approver 时能调 `wf.approve` 推进流程
  - [ ] 浏览器手动验证(用户手动验)
- **L5+ 待办**:
  - 实现"多步审批" BPMN(部门负责人 → 财务 → 总经理) — `multi_step_approval_v1`
  - 业务侧状态主动持久化(`public.workflow_bridge` 表,L2 已建)以便审计
  - 跨域联动:事故/质量告警触发流程启动(不是从 UI 提交)
  - 移动 APP 集成审批(用 mobile-app / Capacitor 扫码 + 简单审批)
- **风险与回滚**:
  - 风险:portal-ui 用户需 profile.position 与 BPMN candidateGroups 对齐(否则 `canAct=false`,看不到审批按钮)
  - 回滚:revert 详情页 + 端点即可(mock context 仍在)

---

## 2026-06-16  ·  侧边栏菜单数据补全(L1.5 补充)

- **类型**:数据/Seed
- **作者**:@dev
- **影响范围**:`public.menu_item` 表 + db-init 容器
- **业务背景**:
  - 侧边栏(`Sidebar.tsx`)是数据驱动的,调 `useUserMenu` → `GET /api/menus/me` → 查 `public.menu_item` 表
  - 原表不存在 → 后端返回 0 条 → 侧边栏空白
  - 前端 `api/menus.ts` 内置了 41 条 MOCK_MENU_JSON(只在 `useMockOnError=true` 时回退使用)
  - 目标:把 mock 中的菜单作为 seed 写入 `public.menu_item`,让侧边栏真正走数据库
- **变更内容**:
  - **生成器脚本**(`apps/factory-api/scripts/seed-menus.mjs`,新建)
    - 从 `apps/portal-ui/src/app/api/menus.ts` 提取 MOCK_MENU_JSON(用括号深度匹配 + new Function eval,绕过单引号 JS 字面量问题)
    - 生成 `create table / index / truncate / insert` SQL
    - 自动同步到 `infra/db-init/factory-03-menus.sql`供启动自带
    - 验证:select count(*)
  - **`public.menu_item` 表**
    - 主键 `id`(text)
    - `parent_id` 自引用 + on delete cascade
    - `enabled bool` 默认 true
    - `required_roles text[]` 默认 null/空数组(后端 SQL: `required_roles is null or cardinality=0 or && $roles`)
    - 3 个索引(portal_id / parent_id / (portal_id, sort_order))
  - **seed 文件**(`infra/db-init/factory-03-menus.sql`,生成)
    - 52 条菜单覆盖:工作台 / 质量与设备 / 采购与供应链 / 营销与客户 / 计划与生产 / 综合管理
  - **API 验证**
    - `GET /api/menus/me`(带 demo token)返回 200 + 52 条
- **影响面**:
  - 数据:`factory` 库新增 `public.menu_item` 表 + 52 行
  - 后端:无代码改动(原 service 已写好)
  - 前端:无代码改动(原 useUserMenu 流程已正确)
  - 基础设施:`infra/db-init/` 目录新增一个 init SQL
- **验收标准**(已跑通):
  - [x] 脚本 `node apps/factory-api/scripts/seed-menus.mjs` 全绿
  - [x] `public.menu_item` 表存在 + 52 行
  - [x] `GET /api/menus/me` 返回 200 + 52 条
  - [ ] 浏览器侧验证:登录后侧边栏出现五大域菜单(用户手动验)
- **下一步(待做)**:
  - 在 `docker-compose.yml` 加一个 `db-init-business` 一次性容器,启动时跑 `infra/db-init/factory-*.sql`(当前是手工执行,下次起环境会丢)
  - 限制:不实现多语言、不实现"用户角色限制菜单"(目前 `requiredRoles:[]` 都不限制)

---

## 2026-06-16  ·  业务单据提交启动 Flowable(L3)

- **类型**:新增功能
- **作者**:@dev
- **影响范围**:管理域业务 NewPage + 详情页 + UI 组件 + 冒烟脚本
- **业务背景**:
  - L1/L2 已经能列出真实待办 / 部署通用审批 BPMN
  - L3 目标:让"发起报销 / 发起 PR / 发起合同"提交时,真实启动一个 `simple_approval_v1` 流程,`businessKey=业务单据 id`
  - 同时在业务详情页显示"流程实例卡片",让用户看得到 Flowable 在跑
- **变更内容**:
  - **`useStartWorkflow` hook**(`apps/portal-ui/src/app/state/workflow/useStartWorkflow.ts`,新建)
    - 封装 `startProcessInstance(auth.token, { businessKey, processDefinitionKey, variables })`
    - 业务类型 `BusinessType: 'expense_claim' | 'procurement_pr' | 'contract_review' | 'supplier_entry' | 'subcontract_workorder'`
    - 非阻塞、幂等、错误不抛,返回 `{ ok, processInstanceId, error }`
  - **三个 NewPage 接入**
    - `ExpenseClaimNewPage` / `ProcurementPRNewPage` / `ContractReviewNewPage`
    - 提交时:`flow.createDraft` → `flow.submit` → `void startWf.start(...)` → 跳转
    - 提交按钮下加 "启动流程中…" / "启动失败:..." 状态提示
  - **`WorkflowInstanceCard` 组件**(`apps/portal-ui/src/app/ui/WorkflowInstanceCard.tsx`,新建)
    - 输入 `businessKey` + 可选 `businessType`
    - 拉取 `/api/workflow/instances/by-business-key/<key>` 展示流程实例(状态、定义、起止时间、变量)
    - 拉取 `/api/workflow/process-instances/<id>/history` 展示历史节点轨迹
    - 接入三个详情页(底部全宽卡片):`ExpenseClaimDetailPage` / `ProcurementPRDetailPage` / `ContractReviewDetailPage`
  - **端到端冒烟脚本**(`apps/factory-api/scripts/smoke-workflow-l3.sh`,新建)
    - 9 步:token → profile → deploy → 启动(businessType=expense_claim)→ 待办 → 业务侧查流程实例 → 历史 → 完成任务 → 验证历史 endTime
    - 全部通过
- **影响面**:
  - 前端:`ExpenseClaimNewPage` / `ProcurementPRNewPage` / `ContractReviewNewPage` / 3 个 DetailPage;新增 2 个文件(hook + UI)
  - 后端:无
  - 数据:无
  - 基础设施:无
- **验收标准**(已跑通):
  - [x] portal-ui `tsc -b` + `vite build` 通过(2.44MB JS)
  - [x] portal-ui 容器重建并启动
  - [x] `smoke-workflow-l3.sh` 9 步全绿
  - [x] 浏览器手动验证入口(见下)
- **L4 待办(下次)**:
  - 业务状态从"前端状态机"切到"以 Flowable 为准" — 监听 Flowable 任务完成事件,回调业务侧更新 `ExpenseClaim.status`
  - `public.workflow_bridge` 表(L2 已建)用作回调状态镜像
  - 审批动作(同意/退回/驳回)改为调 `/api/workflow/tasks/:id/complete`,不再走 context
- **风险与回滚**:
  - 风险:失败时仅 console.warn,不阻塞 UI 跳转(因业务侧状态机已切,若需回滚可手动 `reject` mock)
  - 回滚:revert 5 个前端文件 + 删除 2 个新文件

---

## 2026-06-16  ·  审批中心接 Flowable(L1 + L2)

- **类型**:新增功能 + 架构调整
- **作者**:@dev
- **影响范围**:管理域审批中心 + factory-api workflow 模块 + 部署拓扑
- **业务背景**:
  - 现状:`/management/approval` 页面完全走 `useExpenseFlow/ProcurementFlow/ContractFlow` Context(mock);`/api/workflow/*` 已经存在但只被 `IncidentDetailPage` 使用(质量异常)。
  - 目标:让"审批中心"能看到真实 Flowable 待办;为业务单据提供通用审批 BPMN 部署能力,为 L3 接入打基础。
- **变更内容**:
  - **L1 — 审批中心接入真实待办**(`apps/portal-ui/src/app/pages/management/ApprovalCenterPage.tsx`)
    - 顶部增加"待办 · 真实流程(Flowable)"区,调 `/api/workflow/tasks/me`
    - 真实待办点"办理"跳 `/workflow/tasks/:id`(已存在的 Flowable 真实办理页)
    - 加载/错误/空态/profile.position 缺失提示
    - 保留 mock 待办(降级为"演示/待业务接入")
  - **L2 — 通用审批 BPMN + 部署能力**(`apps/factory-api/src/modules/workflow/*`)
    - 新增 `WorkflowService.listProcessDefinitions` / `deployProcessDefinition` / `getLatestProcessDefinitionByKey`
    - 新增端点 `GET /api/workflow/process-definitions` / `POST /api/workflow/process-definitions`
    - 重构 `POST /api/workflow/instances`(支持任意 `processDefinitionKey`,默认 `simple_approval_v1`)
    - 修复 Flowable `complete` 返回 204 空 body 导致的 500
    - 给所有端点补 Swagger 注解
  - **BPMN 资产**(`infra/flowable/bpmn/`)
    - `simple-approval-v1.bpmn20.xml`:单步审批 user task,candidateGroups=`approver,manager`
    - `qc-exception-v1.bpmn20.xml`:质量异常三步流程(隔离→评审→处置),从文档中补齐可用资产
  - **工具脚本**(`apps/factory-api/scripts/`)
    - `seed-flowable-definitions.mjs`:部署 BPMN 到 Flowable REST(独立 Node 脚本,不需 token)
    - `smoke-workflow.sh`:端到端冒烟测试脚本(deploy → start → list → complete → re-list → history)
  - **部署调整**(`docker-compose.yml` / `infra/nginx/gateway.conf`)
    - `factory-api.environment` 显式给 `FLOWABLE_REST_BASE_URL=http://flowable-rest:8080/flowable-rest/service`(原本默认 `localhost:33725`,容器内不通)
    - `gateway` 加 `dns: 127.0.0.11`(alpine 默认 `127.0.0.53` 不可用,导致 upstream 解析失败)
    - `gateway.conf` 暂时注释 HTTPS 监听(自签证书未生成);`docker-compose.yml` 同步注释 33721→443
  - **数据**(`infra/db-init/factory-01-profile.sql` / `factory-02-workflow-bridge.sql`)
    - 建 `public.profile` 表(原代码已依赖但 schema 缺失)
    - 建 `public.workflow_bridge` 表(L4 业务侧状态同步用,先建表)
  - **文档**(`requirements/05_workflow/bpmn/README.md`)
    - BPMN 资产说明、部署方式、演示路径(L1 怎么看到真实待办)
- **影响面**:
  - 前端:`ApprovalCenterPage` 重写,新增"真实待办"区
  - 后端:`workflow.controller.ts` / `workflow.service.ts` / `workflow.types.ts` 改动
  - 数据:`factory` 库新增 `public.profile` 和 `public.workflow_bridge` 表
  - 基础设施:`docker-compose.yml` 改 factory-api 环境和 gateway dns;`infra/nginx/gateway.conf` 改 HTTPS
  - 流程资产:`infra/flowable/bpmn/*.bpmn20.xml`(新增)
- **验收标准**(已在本地跑通):
  - [x] `simple_approval_v1` BPMN 成功部署到 Flowable
  - [x] 启动流程(businessKey=test-bk-xxx)返回 process instance id
  - [x] `/api/workflow/tasks/me` 返回该 user task
  - [x] `POST /api/workflow/tasks/{id}/complete` 返回 `{ok:true}`
  - [x] 完成后待办清空
  - [x] `/api/workflow/process-instances/{id}/history` 返回 historic-task `approve_task`
  - [x] portal-ui `tsc -b` + `vite build` 通过
  - [x] 端到端冒烟脚本两次连续运行通过
- **风险与回滚**:
  - 风险:网关去掉了 HTTPS(暂时),生产环境需要恢复;`db-init/*.sql` 需在启动时跑(本期手工执行,需后续加 db-init 容器)
  - 回滚:revert PR 即可;Flowable 部署的 BPMN 不影响启动,需手动 DELETE
- **L3 待办(下次)**:
  - 费用报销提交时调 `/api/workflow/instances` 启动 simple_approval_v1
  - 采购 PR / 合同评审同上
  - BPMN 增加多步(部门负责人 → 财务复核 → 总经理)

---

## 待评审(Backlog)

| 日期 | 主题 | 状态 | 提议人 |
|---|---|---|---|
| - | 把 `packages/mock-data` 中的 `WorkOrder` 落 Prisma,接 `factory-api` | 提议 | - |
| - | 引入 OpenTelemetry 追踪 | 提议 | - |
| - | portal-ui 增加"角色 → 菜单可见"映射 | 提议 | - |
| - | 移动端集成 `@capacitor/barcode-scanner` 用于追溯扫码 | 提议 | - |

---

## 2026-06-16  ·  初始化需求文档体系

- **类型**:新增(基础设施)
- **作者**:@dev
- **影响范围**:仓库根 `requirements/` 全新创建,无代码/接口变更
- **变更内容**:
  - 新建 `requirements/README.md` 作为需求 SSOT 入口
  - 新建 `00_overview/`:`01_项目概览`、`02_五域业务模型`、`03_三层组织与角色`、`04_技术栈与依赖一览`
  - 新建 `01_architecture/`:`01_系统架构总览`、`02_部署架构(Docker)`、`03_路由与URL规划`、`04_SSO与权限设计`
  - 新建 `02_applications/` × 5(portal-ui、mobile-portal-ui、cockpit-ui、mobile-app、factory-api)
  - 新建 `03_modules/` × 6(五域 + 审批中心)
  - 新建 `04_data/`:`01_数据模型与Mock设计`、`02_Prisma与数据库设计`
  - 新建 `05_workflow/`:`README`、`flowable-qc-exception.md`(沉淀原 `docs/workflow/`)
  - 新建 `06_runtime/`:`01_本地开发流程`、`02_常见问题与故障`
  - 新建 `07_changelog/`:`template`、`CHANGELOG.md`
- **影响面**:
  - 文档:`requirements/`(新)
  - 业务代码:无
  - 基础设施:无
- **验收标准**:
  - [x] 目录结构与 `README.md` 中的"目录结构"一致
  - [x] 每个 App 都有对应的 `02_applications/0X_*.md`
  - [x] 每个域都有 `03_modules/0X_*.md`,且引用回 `packages/mock-data/src/models.ts`
  - [x] `05_workflow/flowable-qc-exception.md` 完整迁移自 `docs/workflow/flowable-qc-exception.md`(逻辑/范围不缩水)
- **风险与回滚**:
  - 风险:与 `design/IA/*.md` 内容漂移(由维护人定期对齐)
  - 回滚:`rm -rf requirements/` 即可
- **参考**:`design/IA/`、`design/Org/`、`packages/mock-data/src/models.ts`、根 `docker-compose.yml`

---

## 模板

复制 `07_changelog/template.md` 到本文件顶部,补充具体内容,保留标题与字段顺序。
