# 中层 5 角色 · 功能矩阵

> 配套测试:`apps/factory-api/scripts/role-tests/test-mgr-*.sh`(API)+ `e2e/middleground.spec.js`(浏览器)
> 用户 seed 来自 `apps/factory-api/scripts/role-tests/seed-keycloak-users.mjs`
> 密码统一:`Pass1234!`

## 0. 全局前提

- **自动化结果**(2026-06-17 凌晨):
  - 5/5 角色 API smoke 全过
  - 10/10 Playwright e2e 全过(每角色 2 测试)
  - 截图 20 张到 `e2e-screenshots/middleground/`
- **BPMN 部署**:`simple_approval_v1`(candidateGroups=approver,manager)+ `qc_exception_v1`(quality / quality_manager,plant_manager / plant_manager)
- **关键 URL**:
  - 门户 UI:`http://127.0.0.1:33700/portal/`(或 LAN IP)
  - 工厂 API:`http://127.0.0.1:33700/api/`
  - Keycloak:`http://127.0.0.1:18080/`

## 1. 角色:mgr-production(钱经理 · 生产经理)

| 项 | 值 |
|---|---|
| 部门 | 制造中心 |
| position | manager |
| candidateGroups | manager(simple_approval),无 plant_manager(不参与 qc_exception) |
| 业务侧重 | **计划与生产**菜单:排程/工单/派工/报工/晨会 |

### 1.1 业务流

#### 1.1.1 simple_approval_v1(自审自批)
- 提交费用报销(差旅 ¥6666)→ 启动流程
- 自己拉到待办 → 同意 → 流程结束
- 验证:position=manager 在 candidateGroups[approver,manager] 中 → `canAct=true`

#### 1.1.2 生产域菜单可达性
- 拉 `/api/menus/me` → 包含 计划与生产 / 质量与设备 / 工厂总览 / 排程 / 工单
- 业务功能:目前生产域以 mock 数据为主,重点验证"菜单 + 页面加载"

### 1.2 不参与的流程
- `qc_exception_v1`:不参与(无 quality / plant_manager)
- 跨部门合同评审:可以办(approver 组),但不是主要业务

---

## 2. 角色:mgr-quality(孙经理 · 质量经理)

| 项 | 值 |
|---|---|
| 部门 | 质量中心 |
| position | quality_manager |
| candidateGroups | quality_manager(qc_exception review 步骤) |
| 业务侧重 | **质量与设备 → 质量管控**菜单 |

### 2.1 业务流

#### 2.1.1 qc_exception_v1 · review 步骤
- `vp-mfg` 提交质量异常(severity=high, factory=F1)
- 流程走到 isolate → **需要 quality 组用户**(seed 没建 quality 组角色,这里跳过)
- 流程走到 review(candidateGroups=[quality_manager, plant_manager])→ mgr-quality 出现待办
- mgr-quality 点"同意" → 推进到 dispose
- **预期**:因为 quality 步骤无用户,流程卡在 isolate,所以需要先手动将 isolate 步骤完成(用 API 或调 Flowable 直接 complete),或者用 quality 组的 dev-cli 跑通 isolate 步骤
- 实际方案:用 API(ROPC 任意 dev-cli 用户)+ Flowable REST 直接给 isolate 任务委派/完成(开发测试用)

> **重要**:seed 的 15 个用户里没有 quality 组的用户。要测 qc_exception 全流程,需要:
> 方案 A:额外建 `inspector` 用户(quality 组)— 暂未建
> 方案 B:用 Flowable REST API 直接 `complete` isolate 任务(绕过权限)
> 本期采用方案 B,在测试脚本里直接调 Flowable

#### 2.1.2 简单审批(自审自批)
- simple_approval_v1 的 candidateGroups=[approver,manager],**不含 quality_manager** → mgr-quality 看不到简单审批的待办
- 验证:启动 simple_approval 后,mgr-quality 拉待办应为空(因为不在 approver/manager 组)

### 2.2 不参与的流程
- simple_approval_v1(quality_manager 不在 candidateGroups)

---

## 3. 角色:mgr-procurement(周经理 · 采购经理)

| 项 | 值 |
|---|---|
| 部门 | 采购中心 |
| position | approver |
| candidateGroups | approver(simple_approval) |
| 业务侧重 | **采购与供应链**菜单:供应商/采购申请/采购订单 |

### 3.1 业务流

#### 3.1.1 采购 PR 自审自批
- 新建采购 PR(供应商"上海钢联" / 物料 Q235B / 数量 100 / 单价 200)
- 提交 → simple_approval_v1 启动
- 自己拉待办 → 同意 → 流程结束
- 验证:position=approver 在 candidateGroups 中

#### 3.1.2 跨用户协作
- 用 demo 启动一个 PR 流程
- mgr-procurement 登录 → 看到待办 → 批
- 与 vp-finance / mgr-it / ceo 同组,应互相可见

#### 3.1.3 采购域菜单
- 拉菜单 → 包含 采购与供应链 / 供应商管理 / 采购申请 / 采购订单 / 询价 / 招投标
- 验证菜单条数 ≥ 40

### 3.2 不参与的流程
- qc_exception_v1(无 quality_manager / plant_manager)

---

## 4. 角色:mgr-equipment(吴经理 · 设备经理)

| 项 | 值 |
|---|---|
| 部门 | 设备中心 |
| position | plant_manager |
| candidateGroups | plant_manager(qc_exception review + dispose) |
| 业务侧重 | **质量与设备 → 设备运维**菜单 |

### 4.1 业务流

#### 4.1.1 qc_exception_v1 · review + dispose
- `vp-mfg` 提交质量异常
- isolate 步骤 → quality 组(用 Flowable REST 跳过)
- review 步骤(candidateGroups=[quality_manager, plant_manager])→ mgr-equipment 看到待办
- 同意 → 推进到 dispose
- dispose 步骤(candidateGroups=[plant_manager])→ mgr-equipment 看到待办
- 同意 → 流程结束
- **预期**:mgr-equipment 能走完 review + dispose 两步

#### 4.1.2 设备维修工单(数据 mock)
- 设备运维菜单:设备监控 / 维修工单 / 维修看板
- 验证菜单可达(页面加载 OK)

### 4.2 不参与的流程
- simple_approval_v1(plant_manager 不在 candidateGroups)

---

## 5. 角色:mgr-it(郑经理 · IT 经理)

| 项 | 值 |
|---|---|
| 部门 | 信息中心 |
| position | approver |
| candidateGroups | approver(simple_approval) |
| 业务侧重 | **综合管理 → 流程与合规**(审计/权限),以及 IT 资产相关 |

### 5.1 业务流

#### 5.1.1 自审自批 simple_approval
- 提交 IT 资产采购申请 → 启动流程
- 自审自批 → 流程结束
- 验证:position=approver 在 candidateGroups

#### 5.1.2 跨用户协作
- 与 ceo / vp-finance / mgr-procurement 同组(approver)
- 互相可见待办

#### 5.1.3 综合管理菜单
- 拉菜单 → 包含 流程与合规(审批中心/通知中心/审计日志/权限矩阵)
- 验证"审计日志"页加载 OK

### 5.2 不参与的流程
- qc_exception_v1(无 quality_manager / plant_manager)

---

## 6. 跨角色协作验证(综合)

### 6.1 approver 组协作
- 5 个 approver 角色:ceo / ceo-deputy / vp-sales / vp-finance / mgr-procurement / mgr-it(共 6 个)
- 任一启动 simple_approval,其他 5 个都应看到待办
- 每个高层都同意一次 → 同一流程可被 6 个角色依次处理(虽然流程只一个 task)

### 6.2 qc_exception 三角色链
- `vp-mfg`(plant_manager / approver 组)启动
- 跳过 isolate(用 Flowable REST)
- `mgr-quality`(quality_manager)办 review
- `mgr-equipment`(plant_manager)办 review(同组可见)+ dispose

### 6.3 隔离
- `mgr-production`(manager)启动 simple_approval
- `mgr-quality`(quality_manager)拉待办 → 应空(不在 approver/manager 组)
- `mgr-equipment`(plant_manager)拉待办 → 应空

---

## 7. 已知限制

- **没有 quality 组用户**:seed 没建。qc_exception 的 isolate 步骤需要用 Flowable REST 跳过(测试代码里直接调 `complete` API)
- **简单审批只有 1 个 userTask**:5+ 角色都在 approver 组,都能办,流程本身只一个步骤
- **业务域详情页大多为 mock**:重点验证"菜单可见 + 页面加载 + 流程联通",真实业务数据后续接入
- **同一流程多次同意**:简单审批 approve 后流程结束,不会有 6 个角色依次处理的真场景;这仅是验证"candidateGroup 匹配 + canAct"机制
