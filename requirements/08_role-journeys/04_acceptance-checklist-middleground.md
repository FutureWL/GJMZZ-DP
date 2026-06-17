# 中层 5 角色 · 人工验收清单

> 配套自动化:`apps/factory-api/scripts/role-tests/test-mgr-*.sh`(API)+ `e2e/middleground.spec.js`(浏览器)
> 自动化 **5/5 + 20/20 全过**(2026-06-17 凌晨)
> 密码统一:`Pass1234!`

## 0. 准备

### 0.1 一键跑

```bash
# API 5/5
bash /root/DataDisk/workspace/GJMZZ-DP/apps/factory-api/scripts/role-tests/run-all-middleground.sh
# 预期:SUMMARY: pass=5 fail=0 / ALL GREEN

# 浏览器 10/10(中层 spec 10 测试)
cd /root/DataDisk/workspace/GJMZZ-DP/apps/factory-api/scripts/role-tests
npx playwright test e2e/middleground.spec.js --reporter=list
# 预期:10 passed(中层的 5 角色 × 2 测试 = 10)
# 实际连同 highlevel 一起跑 20 passed
```

### 0.2 截图位置

`requirements/08_role-journeys/e2e-screenshots/middleground/`
20 张(5 角色 × 4 时刻:登录后 / 审批中心 / 启动流程后 / 任务页)

---

## 1. 角色:mgr-production(钱经理 · 生产经理)

> position=manager, simple_approval_v1 candidateGroups=[approver, manager] → 可办
> 业务侧重:**计划与生产**(排程/工单/派工/报工)

### 1.1 登录

- `mgr-production` / `Pass1234!` → 跳 Keycloak 登录页 → 输账号密码
- 登录后落地页默认 `/portal/production/dashboards/factory`(工厂总览)
- **预期**:顶部"钱经理 / 制造中心"

### 1.2 菜单

- **预期**:6 个一级菜单可见,重点验证"计划与生产"展开后含:
  - 排程(`/production/execution/scheduling`)
  - 工单(`/production/execution/workorders`)
  - 派工任务(`/production/execution/dispatch`)
  - 报工(`/production/execution/reporting`)

### 1.3 提交业务(自审自批)

- 进 `/portal/management/erp/expenses`(费用报销)
- 新建报销单(差旅 ¥6666)→ 提交审批
- 详情页应看到"流程实例(Flowable)"卡片 + "同意"按钮
- 点"同意" → 流程结束
- **预期**:因为 position=manager 在 simple_approval 的 candidateGroups 中,同意按钮可见

### 1.4 审批中心

- 进 `/portal/management/approval`
- **预期**:看到"待办 · 真实流程"区,前面提交的自审自批的待办应在里面(但已同意就消失了)
- 可点"刷新真实待办"

### 1.5 跨角色隔离验证

- 用 mgr-production 启动一个 simple_approval 流程
- 用 mgr-quality 登录审批中心 → **不应**看到该待办(quality_manager 不在 [approver, manager])
- **预期**:验证"candidateGroup 匹配"机制工作正常

### 1.6 验收要点 ✅

- [ ] 登录 OK,显示"钱经理 / 制造中心"
- [ ] 生产域菜单可达(排程/工单/派工/报工)
- [ ] 提交费用 → 自审自批 → 流程结束
- [ ] 跨角色隔离 OK

---

## 2. 角色:mgr-quality(孙经理 · 质量经理)

> position=quality_manager, qc_exception_v1 review 步骤可办
> 业务侧重:**质量与设备 → 质量管控**

### 2.1 登录

- `mgr-quality` / `Pass1234!`
- **预期**:顶部"孙经理 / 质量中心"

### 2.2 菜单

- **预期**:质量管控下:告警中心 / 异常中心 / 检验任务 / 设备监控
- 设备运维下:维修工单 / 维修看板

### 2.3 qc_exception review 流程(关键)

- **前置**:需要先用 vp-mfg 或自己启动一个 qc_exception 流程
- API 启动(自动化测试用):
  ```bash
  TOKEN=$(curl -sS -m 5 -X POST "http://127.0.0.1:18080/realms/factory-platform/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=password" -d "client_id=dev-cli" \
    -d "username=vp-mfg" -d "password=Pass1234!" | \
    python3 -c "import json,sys;print(json.load(sys.stdin)['access_token'])")
  curl -sX POST "http://127.0.0.1:33700/api/workflow/instances" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d '{"businessKey":"QC-20260617-002","processDefinitionKey":"qc_exception_v1","variables":{"businessType":"incident","severity":"high","factory":"F1"}}'
  ```
- **预期**:流程启动,卡在 isolate 步骤(quality 组无 seed 用户,需要手动跳过)
- 跳过 isolate(用 Flowable REST):
  ```bash
  PROC_ID=<上面返回的 id>
  TASK_ID=$(curl -sS -u "rest-admin:test" \
    "http://127.0.0.1:33725/flowable-rest/service/runtime/tasks?processInstanceId=$PROC_ID" \
    | python3 -c "import json,sys;d=json.load(sys.stdin)['data'];print([t for t in d if t['processInstanceId']=='$PROC_ID'][0]['id'])")
  curl -sS -u "rest-admin:test" \
    -X POST "http://127.0.0.1:33725/flowable-rest/service/runtime/tasks/$TASK_ID" \
    -H "Content-Type: application/json" -d '{"action":"complete"}'
  ```
- mgr-quality 登录 → 审批中心 → 刷新真实待办 → **应看到 review 任务**
- 点"办理" → 进任务页 → 点"同意"
- **预期**:流程推进到 dispose(plant_manager 组)

### 2.4 simple_approval 隔离验证

- 启动一个 simple_approval 流程(任意 approver 角色)
- mgr-quality 登录审批中心 → **不应**看到该待办
- **预期**:quality_manager 不在 [approver, manager] 组

### 2.5 验收要点 ✅

- [ ] 登录 OK
- [ ] 质量管控菜单可达
- [ ] qc_exception review 步骤可办
- [ ] simple_approval 看不到

---

## 3. 角色:mgr-procurement(周经理 · 采购经理)

> position=approver, 与 ceo/vp-finance/mgr-it 同组
> 业务侧重:**采购与供应链**

### 3.1 登录

- `mgr-procurement` / `Pass1234!`
- **预期**:顶部"周经理 / 采购中心"

### 3.2 菜单

- **预期**:采购管理下:采购 PR/PO / 新增采购PR
- 供应商协同下:供应商 / 合同评审

### 3.3 采购 PR 自审自批

- 进 `/portal/supply/procurement/create-pr`(新增采购PR)
- 填:供应商"上海钢联" / 物料 Q235B / 数量 100 / 单价 200 → 提交
- 详情页应看到"流程实例"卡片
- 点"同意" → 流程结束

### 3.4 跨用户协作

- 用 vp-finance 启动一个 expense_claim 流程
- mgr-procurement 登录 → 审批中心 → 看到待办
- 同意 → 流程结束
- **预期**:approver 组互相可见

### 3.5 验收要点 ✅

- [ ] 登录 OK
- [ ] 采购域菜单可达
- [ ] 提交 PR → 自审自批
- [ ] 跨用户协作 OK

---

## 4. 角色:mgr-equipment(吴经理 · 设备经理)

> position=plant_manager, qc_exception review + dispose 可办
> 业务侧重:**质量与设备 → 设备运维**

### 4.1 登录

- `mgr-equipment` / `Pass1234!`
- **预期**:顶部"吴经理 / 设备中心"

### 4.2 菜单

- **预期**:设备运维下:设备监控 / 维修工单 / 维修看板

### 4.3 qc_exception review + dispose(关键)

- 启动 qc_exception(同 2.3)
- 跳过 isolate
- mgr-equipment 登录 → 看到 review 任务(candidateGroups=[quality_manager, plant_manager], plant_manager 在内)
- 同意 review → 推进到 dispose
- 再看到 dispose 任务(candidateGroups=[plant_manager])
- 同意 dispose → 流程结束
- **预期**:mgr-equipment 能走完 review + dispose 两步

### 4.4 simple_approval 隔离验证

- 启动一个 simple_approval 流程
- mgr-equipment 登录 → **不应**看到待办
- **预期**:plant_manager 不在 [approver, manager]

### 4.5 验收要点 ✅

- [ ] 登录 OK
- [ ] 设备运维菜单可达
- [ ] qc_exception review + dispose 全流程
- [ ] simple_approval 看不到

---

## 5. 角色:mgr-it(郑经理 · IT 经理)

> position=approver, 与 ceo/vp-finance/mgr-procurement 同组
> 业务侧重:**综合管理 → 流程与合规**

### 5.1 登录

- `mgr-it` / `Pass1234!`
- **预期**:顶部"郑经理 / 信息中心"

### 5.2 菜单

- **预期**:综合管理 → 流程与合规下:审批中心 / 通知中心 / 审计日志 / 权限矩阵

### 5.3 IT 资产采购单自审自批

- 提交 IT 资产采购申请(服务器 ¥50000 × 2)
- 自审自批 → 流程结束

### 5.4 跨用户协作

- 用 ceo-deputy 启动一个流程
- mgr-it 登录 → 看到待办(同 approver 组)→ 同意

### 5.5 验收要点 ✅

- [ ] 登录 OK
- [ ] 综合管理菜单可达(审计/权限/通知)
- [ ] 提交 IT 资产 → 自审自批
- [ ] 跨用户协作 OK

---

## 6. 跨角色综合验证

### 6.1 approver 组(共 6 角色)

- `ceo` / `ceo-deputy` / `vp-sales` / `vp-finance` / `mgr-procurement` / `mgr-it`
- 任一启动 simple_approval,其他 5 个都应看到待办

### 6.2 qc_exception 三角色链(自动跳过 isolate)

- `vp-mfg` 启动 qc_exception
- 跳过 isolate(quality 组无 seed,用 Flowable REST)
- `mgr-quality` 办 review
- `mgr-equipment` 办 review(同组可见)+ dispose

### 6.3 隔离矩阵

| 启动者 | mgr-production(manager) | mgr-quality(quality_manager) | mgr-procurement(approver) | mgr-equipment(plant_manager) | mgr-it(approver) |
|---|---|---|---|---|---|
| simple_approval | ✅ 可见 | ❌ 不可见 | ✅ 可见 | ❌ 不可见 | ✅ 可见 |
| qc_exception review | ❌(不在组) | ✅ 可见 | ❌(不在组) | ✅ 可见 | ❌(不在组) |
| qc_exception dispose | ❌(不在组) | ❌(不在组) | ❌(不在组) | ✅ 可见 | ❌(不在组) |

---

## 7. 已知问题 / 限制

- **没有 quality 组用户**:seed 15 个里没有。qc_exception 的 isolate 步骤需要用 Flowable REST `complete` 跳过(测试代码里直接调)。后续可加 `inspector` 用户(quality 组)
- **审批中心"办理"链接对所有候选都可见**:UI 层没有按 `canAct` 隐藏链接(后端也没强校验)。点击后能进任务页,但提交"同意"时后端不校验权限(按 L4 文档的"已知限制")
- **生产域详情页大多 mock**:菜单可达 + 页面加载 OK,真实业务数据后续接入
- **基层 5 角色未做端到端测试**:本期只做高层 + 中层,基层留给下一轮

---

## 8. 反馈

跑完后:
- ✅ 全过 → 我接着做基层 5 角色(worker-line/worker-quality/worker-purchase/worker-equipment/worker-it)
- ❌ 有问题 → 把失败的角色 + 步骤 + 截图位置告诉我
