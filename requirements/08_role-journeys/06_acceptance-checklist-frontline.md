# 基层 5 角色 · 人工验收清单

> 配套自动化:`apps/factory-api/scripts/role-tests/test-*.sh`(API)+ `e2e/frontline.spec.js`(浏览器)
> 自动化 **5/5 + 10/10 全过**(2026-06-17 凌晨)
> 密码统一:`Pass1234!`

## 0. 准备

### 0.1 一键跑

```bash
# API 5/5
bash /root/DataDisk/workspace/GJMZZ-DP/apps/factory-api/scripts/role-tests/run-all-frontline.sh
# 预期:SUMMARY: pass=5 fail=0

# 浏览器 10/10
cd /root/DataDisk/workspace/GJMZZ-DP/apps/factory-api/scripts/role-tests
npx playwright test e2e/frontline.spec.js --reporter=list
# 预期:10 passed
```

### 0.2 截图位置

`requirements/08_role-journeys/e2e-screenshots/frontline/`
20 张(5 角色 × 4 时刻)

### 0.3 重要里程碑 ⭐

**inspector(quality 组)终于补齐 → qc_exception 完整三步流程可由真实用户跑通,无需 Flowable REST 跳过。**

---

## 1. 角色:worker-leader(冯班组长 · 产线班组长)

> position=approver, simple_approval_v1 可办
> 业务侧重:产线作业(工单/派工/报工)

### 1.1 登录

- `worker-leader` / `Pass1234!`
- **预期**:顶部"冯班组长 / 生产一部"

### 1.2 菜单

- **预期**:计划与生产下含 排程 / 工单 / 派工任务 / 报工 / 工厂总览
- 业务详情页大多为 mock(产线作业功能未实现),重点验证"菜单可见 + 页面加载 OK"

### 1.3 simple_approval 自审自批

- 进 `/portal/management/erp/expenses`(费用报销)
- 新建(差旅 ¥2000, L3 夜班)→ 提交
- 详情页"流程实例"卡片 → 点"同意" → 流程结束

### 1.4 隔离验证

- 启动 qc_exception(用 vp-mfg)
- worker-leader 登录 → 审批中心 → **不应**看到 isolate
- 验证:active-task 的 candidateGroups 只有 `[quality]`,worker-leader 不在内

### 1.5 验收要点 ✅

- [ ] 登录 OK
- [ ] 产线菜单可达
- [ ] simple_approval 自审自批
- [ ] qc_exception 隔离

---

## 2. 角色:planner(陈计划员 · 生产计划员)

> position=approver
> 业务侧重:排程/工单计划

### 2.1 登录 + 自审自批

- `planner` / `Pass1234!`
- **预期**:顶部"陈计划员 / 生产计划部"
- 提交排程变更申请 → 自审自批

### 2.2 验收要点 ✅

- [ ] 登录 OK
- [ ] 排程/工单菜单可达
- [ ] 自审自批

---

## 3. 角色:inspector(褚检验员 · 质量检验员) ⭐

> position=quality, **qc_exception isolate 步骤**可办
> **里程碑**:补齐 qc_exception 完整三步链

### 3.1 登录

- `inspector` / `Pass1234!`
- **预期**:顶部"褚检验员 / 质量中心"

### 3.2 qc_exception isolate 步骤 ⭐ 关键

- **完整流程验证**(首次无需 Flowable REST 跳过):
  1. 退出登录,用 vp-mfg 登录
  2. API 启动 qc_exception:
     ```bash
     TOKEN=$(curl -sS -m 5 -X POST "http://127.0.0.1:18080/realms/factory-platform/protocol/openid-connect/token" \
       -H "Content-Type: application/x-www-form-urlencoded" \
       -d "grant_type=password" -d "client_id=dev-cli" \
       -d "username=vp-mfg" -d "password=Pass1234!" | \
       python3 -c "import json,sys;print(json.load(sys.stdin)['access_token'])")
     curl -sX POST "http://127.0.0.1:33700/api/workflow/instances" \
       -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
       -d '{"businessKey":"QC-INSPECTOR-001","processDefinitionKey":"qc_exception_v1","variables":{"businessType":"incident","severity":"high","factory":"F1"}}'
     ```
  3. 退出,inspector 登录
  4. 进审批中心 → 刷新真实待办 → **应看到 isolate 任务**
  5. 点"办理" → 进任务页 → 同意
  6. 流程推进到 review
- **预期**:inspector 可以直接办 isolate,无需再跳

### 3.3 simple_approval 隔离

- 启动一个 simple_approval(任意 approver)
- inspector 登录 → 审批中心 → **不应**看到(quality 不在 [approver, manager])

### 3.4 验收要点 ✅

- [ ] 登录 OK
- [ ] **qc_exception isolate 步骤可办(关键 ⭐)**
- [ ] 办完后流程推进到 review
- [ ] simple_approval 看不到

---

## 4. 角色:tech(卫维修 · 设备维修)

> position=plant_manager, qc_exception review + dispose 可办

### 4.1 登录

- `tech` / `Pass1234!`
- **预期**:顶部"卫维修 / 设备中心"

### 4.2 qc_exception review + dispose(完整三步链验证)

- 启动 qc_exception(vp-mfg 启动)
- inspector 办 isolate
- tech 登录 → 看到 review 任务 → 同意 → 推进到 dispose
- tech 再看到 dispose 任务 → 同意 → 流程结束
- **预期**:tech 走完 review + dispose 两步,流程历史含 isolate / review / dispose

### 4.3 验收要点 ✅

- [ ] 登录 OK
- [ ] 设备监控/维修工单/维修看板菜单可达
- [ ] qc_exception review + dispose 完整两步
- [ ] simple_approval 看不到

---

## 5. 角色:warehouse(蒋库管 · 仓库管理员)

> position=approver
> 业务侧重:仓储/出入库(mock)

### 5.1 登录 + 自审自批

- `warehouse` / `Pass1234!`
- **预期**:顶部"蒋库管 / 仓储中心"
- 提交入库申请 → 自审自批
- 跨用户:vp-finance 启动 → warehouse 看到(同 approver 组)

### 5.2 验收要点 ✅

- [ ] 登录 OK
- [ ] 采购 PR/PO 菜单可达
- [ ] 入库申请自审自批
- [ ] 跨用户协作 OK

---

## 6. 跨角色综合验证 ⭐

### 6.1 qc_exception 完整三步链(无人跳过)

```
1. vp-mfg 启动 qc_exception
2. inspector 办 isolate(candidateGroups=[quality])
3. mgr-quality / tech 办 review(candidateGroups=[quality_manager, plant_manager])
4. tech / mgr-equipment 办 dispose(candidateGroups=[plant_manager])
5. 流程结束
```

**所有步骤由真实 seed 用户办,无需 Flowable REST 跳过**。

### 6.2 隔离矩阵(完整版)

| 启动流程 \ 角色 | worker-leader/planner/warehouse | inspector | tech |
|---|---|---|---|
| simple_approval | ✅ | ❌ | ❌ |
| qc_exception isolate | ❌ | ✅ | ❌ |
| qc_exception review | ❌ | ❌ | ✅ |
| qc_exception dispose | ❌ | ❌ | ✅ |

### 6.3 approver 组大协作

approver 组共 **10 角色**(5 高层 + 2 中层 + 3 基层)
- ceo / ceo-deputy / vp-sales / vp-finance / mgr-procurement / mgr-it / worker-leader / planner / warehouse
- 任一启动 simple_approval,其他 9 个都应看到待办

### 6.4 全角色 candidateGroup 完整覆盖

| Group | 用户 |
|---|---|
| approver | 5 高层 + 2 中层 + 3 基层 = 10 |
| manager | mgr-production |
| quality | inspector |
| quality_manager | mgr-quality |
| plant_manager | mgr-equipment / tech |

15 个 seed 用户,覆盖所有 5 个 candidateGroup。

---

## 7. 已知限制

- **基层业务详情页是 mock**:工单/派工/维修/出入库等具体业务功能未实现,只验证菜单 + 页面加载
- **worker-line / worker-purchase / worker-it 用户不存在**:seed 里没有 worker- 前缀的用户,用现有的 5 个基层(worker-leader / planner / inspector / tech / warehouse)
- **position=approver 跨多角色**:基层的 worker-leader / planner / warehouse 与高层同组,审批中心互相可见。生产应按职能细分
- **菜单所有用户一致**:本期菜单未做按 position 过滤,所有用户看到 52 个菜单。后续按"角色可访问性"细化

---

## 8. 反馈

跑完后:
- ✅ 全过 → 15 角色测试全部完成,所有文档齐全
- ❌ 有问题 → 把失败的角色 + 步骤 + 截图位置告诉我
