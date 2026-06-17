# 基层 5 角色 · 功能矩阵

> 配套测试:`apps/factory-api/scripts/role-tests/test-worker-*.sh`(API)+ `e2e/frontline.spec.js`(浏览器)
> 用户 seed 来自 `apps/factory-api/scripts/role-tests/seed-keycloak-users.mjs`
> 密码统一:`Pass1234!`

## 0. 全局前提

- **自动化结果**:
  - 5/5 角色 API smoke 全过
  - 10/10 Playwright e2e 全过
  - 截图 20 张到 `e2e-screenshots/frontline/`
- **重大价值**:inspector(quality 组)终于补齐 → **qc_exception 三步流程可完整跑通**,无需再跳过 isolate

## 1. 角色:worker-leader(冯班组长 · 产线班组长)

| 项 | 值 |
|---|---|
| 部门 | 生产一部 |
| position | approver |
| candidateGroups | approver(simple_approval_v1) |
| 业务侧重 | 产线作业:工单/派工/报工(自己的工单) |

### 1.1 业务流
- simple_approval 自审自批:提交生产异常报告 → 自批
- 拉菜单:含产线相关(排程/工单/派工/报工/工厂总览/告警中心)
- 隔离验证:qc_exception 看不到(不在 quality/plant_manager 组)

---

## 2. 角色:planner(陈计划员 · 生产计划员)

| 项 | 值 |
|---|---|
| 部门 | 生产计划部 |
| position | approver |
| candidateGroups | approver(simple_approval) |
| 业务侧重 | 排程/工单计划 |

### 2.1 业务流
- simple_approval 自审自批(排程变更申请)
- 拉菜单:同 worker-leader
- 隔离验证:同

---

## 3. 角色:inspector(褚检验员 · 质量检验员) ⭐

| 项 | 值 |
|---|---|
| 部门 | 质量中心 |
| position | **quality** |
| candidateGroups | **quality**(qc_exception_v1 **isolate 步骤**) |
| 业务侧重 | 质量检验/异常隔离 |

### 3.1 业务流
- **qc_exception isolate 步骤** ⭐ 关键:
  - vp-mfg 提交质量异常
  - **inspector 登录** → 审批中心 → 看到 isolate 任务(这是之前用 Flowable REST 跳过的步骤)
  - 同意 → 推进到 review
- 隔离验证:
  - simple_approval 看不到(quality 不在 [approver, manager])
  - qc_exception review 看不到(quality 不在 [quality_manager, plant_manager])
  - qc_exception dispose 看不到(quality 不在 [plant_manager])

### 3.2 价值
- 补齐 qc_exception 完整三步链:vp-mfg 启动 → **inspector 办 isolate** → mgr-quality/tech 办 review → tech/mgr-equipment 办 dispose
- 之前中层测试要跳过 isolate,现在不需要了

---

## 4. 角色:tech(卫维修 · 设备维修)

| 项 | 值 |
|---|---|
| 部门 | 设备中心 |
| position | **plant_manager** |
| candidateGroups | plant_manager(qc_exception review + dispose) |
| 业务侧重 | 设备维修/工单 |

### 4.1 业务流
- **qc_exception review + dispose**(同 mgr-equipment,但 tech 也是 plant_manager)
  - 走完 review → dispose 两步
- 隔离验证:simple_approval 看不到

### 4.2 与 mgr-equipment 区别
- mgr-equipment 是"设备经理"(管理层),tech 是"维修"(执行层)
- 两者都在 plant_manager 组,对 qc_exception 权限完全一样
- 业务侧重不同:tech 主要看维修工单/设备监控

---

## 5. 角色:warehouse(蒋库管 · 仓库管理员)

| 项 | 值 |
|---|---|
| 部门 | 仓储中心 |
| position | approver |
| candidateGroups | approver(simple_approval) |
| 业务侧重 | 仓储/出入库(目前 mock) |

### 5.1 业务流
- simple_approval 自审自批(入库申请/调拨申请)
- 拉菜单:含采购 PR/PO / 供应商 / 经营驾驶舱
- 隔离验证:同 worker-leader

---

## 6. 跨角色协作(关键 ⭐)

### 6.1 qc_exception 完整三步链(无人跳过)

```
1. vp-mfg 启动 qc_exception
2. inspector 办 isolate 步骤(candidateGroups=[quality])
3. mgr-quality 或 tech 办 review 步骤(candidateGroups=[quality_manager, plant_manager])
4. tech 或 mgr-equipment 办 dispose 步骤(candidateGroups=[plant_manager])
5. 流程结束
```

这是**真正的端到端 qc_exception 流程**,从启动到结束,所有步骤都有人办。

### 6.2 simple_approval 跨用户协作

- approver 组共 10 角色(5 高层 + 2 中层 approver + 3 基层 approver)
- 任一启动,其他 9 个都应看到待办

### 6.3 隔离矩阵(完整版)

| 启动流程 \ 角色 | worker-leader/planner/warehouse | inspector | tech |
|---|---|---|---|
| simple_approval | ✅ | ❌ | ❌ |
| qc_exception isolate | ❌ | ✅ | ❌ |
| qc_exception review | ❌ | ❌ | ✅ |
| qc_exception dispose | ❌ | ❌ | ✅ |

## 7. 已知限制

- **基层业务详情页大多是 mock**:产线作业/维修工单/出入库等具体业务功能未实现,只验证菜单可达 + 页面加载
- **worker-line / worker-purchase / worker-it 用户不存在**:seed 里没有,用现有的 5 个基层用户(worker-leader / planner / inspector / tech / warehouse)
- **position=approver 的基层与高层同组**:审批中心互相可见。这是 dev 简化,生产应按职能细分
