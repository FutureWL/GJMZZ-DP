# 高层角色 · 人工验收清单

> 配套自动化测试:`apps/factory-api/scripts/role-tests/test-*.sh`(API 层)+ `e2e/highlevel.spec.js`(浏览器层)
> 自动化测试已 **10/10 通过**(2026-06-17 凌晨)
> **你来操作的部分**:按下面的步骤,跑完每个角色,核对结果

## 0. 准备

### 0.1 系统状态确认

```bash
cd /root/DataDisk/workspace/GJMZZ-DP

# 1) 容器都跑着
docker compose ps --format "{{.Service}} {{.Status}}" | grep -E "portal-ui|factory-api|keycloak|flowable"

# 2) 关键服务可达
curl -sS -m 3 http://localhost:33700/portal/        # → 200
curl -sS -m 3 http://localhost:33704/health          # → {"ok":true}
curl -sS -m 3 http://localhost:18080/realms/factory-platform/.well-known/openid-configuration | head -1  # → JSON

# 3) LAN IP 访问也能通(如果你从其他机器过来)
curl -sS -m 3 http://192.168.x.x:33700/portal/      # 200
curl -sS -m 3 http://192.168.x.x:18080/realms/factory-platform/.well-known/openid-configuration | python3 -c "import json,sys;print(json.load(sys.stdin)['issuer'])"  # → http://192.168.x.x:18080/...
```

> **LAN IP 访问 SSO 修复说明**(2026-06-17):
> - `http://非 localhost` 不是 secure context,keycloak-js 26 的 PKCE + randomUUID 不可用
> - 代码已 polyfill `crypto.randomUUID`,PKCE 在 LAN IP 走 false
> - Keycloak `KC_HOSTNAME` 留空 → login 页 form action 跟随请求地址
> - factory-api 用容器内部 `http://keycloak:8080` 拉 JWKS,跳过 iss 校验
> - 如需更换 LAN IP,改 `infra/compose/sso-dev/realm/factory-platform-realm.json` 中 portal-ui 客户端的 redirectUris/webOrigins,然后在 Keycloak 管理后台手动更新(import-realm 只在首次启动生效)

### 0.2 浏览器前置

- 用 `127.0.0.1` 或 `localhost`(本机 hosts 已加 `sso.corp.aygjm.lan`)
- 浏览器隐身模式(避免 cookie 干扰)
- 测试用户密码统一:`Pass1234!`

### 0.3 自动化测试结果速查

```bash
# 一键跑全部 5 角色 API 测试
bash /root/DataDisk/workspace/GJMZZ-DP/apps/factory-api/scripts/role-tests/run-all-highlevel.sh
# 预期:SUMMARY: pass=5 fail=0 / ALL GREEN

# 一键跑全部 5 角色 Playwright 测试
cd /root/DataDisk/workspace/GJMZZ-DP/apps/factory-api/scripts/role-tests
npx playwright test --reporter=list
# 预期:10 passed
```

### 0.4 截图位置

`requirements/08_role-journeys/e2e-screenshots/highlevel/`(20 张,5 角色 × 4 时刻)

---

## 1. 角色:ceo(张总 · 总经理)

> 默认落地页:`/portal/production/dashboards/factory`(集团 → 工厂总览)
> candidateGroup: `approver`(终审,可批所有 simple_approval_v1 流程)

### 1.1 登录

- 打开 `http://127.0.0.1:33700/portal/`
- 跳到自建 login 页 → 点 **"SSO 登录"** 按钮
- 跳到 Keycloak → 输 `ceo` / `Pass1234!` → 点 **Sign In**
- **预期**:回到 portal-ui,顶部看到用户名"张总",组织范围/时间范围 combobox 显示

### 1.2 查看侧边栏

- **预期**:左侧看到 6 个一级菜单:**工作台 / 营销与客户 / 计划与生产 / 质量与设备 / 采购与供应链 / 综合管理**

### 1.3 经营驾驶舱

- URL 输 `http://127.0.0.1:33700/portal/sales/business/dashboard`
- **预期**:看到经营驾驶舱的 KPI 卡(收入/订单/回款/毛利占位)

### 1.4 审批中心

- URL 输 `http://127.0.0.1:33700/portal/management/approval`
- **预期**:看到两个区:**待办 · 真实流程(Flowable)** + **待办 · 演示(mock)**
- 顶部"刷新真实待办"按钮可点
- 如果之前测试残留了 approver 组的待办(看截图 `ceo-02-approval-center.png`),会列出"办理"链接

### 1.5 提交业务单据(模拟下属提交,自己审批)

```bash
# 1) 用 demo(下属)登录
# 2) 进费用报销,提交一个 ¥1234 报销单
# 3) 用 ceo 登录
# 4) 进审批中心,点"刷新真实待办" → 应看到该报销的待办
# 5) 点"办理" → 同意 → 流程结束
```

### 1.6 验收要点 ✅

- [ ] SSO 登录 OK
- [ ] 6 个侧边栏菜单全可见
- [ ] 经营驾驶舱有内容(占位)
- [ ] 审批中心真实待办区可刷新
- [ ] 提交业务 → 自己看到待办 → 同意 → 流程结束

---

## 2. 角色:ceo-deputy(李副总 · 常务副总)

> 与 ceo 路径一致(共用 approver)
> 截图:`ceo-deputy-01..04.png`

### 2.1 登录

- `ceo-deputy` / `Pass1234!`
- 预期:顶部用户名"李副总",部门"总经办"

### 2.2 跨用户协作验证

- 用 demo 启动一个 expense_claim 流程
- 用 ceo-deputy 登录 → 审批中心 → 应看到该待办(因为都在 approver 组)
- 点"办理" → 同意 → 流程结束
- **预期**:ceode-puty 能看到并处理 demo 提交的待办

### 2.3 验收要点 ✅

- [ ] 登录 OK,显示"李副总 / 总经办"
- [ ] 跨用户流程协作 OK(ceode-puty 批 demo 提交)

---

## 3. 角色:vp-sales(王副总 · 营销副总)

> 自审自批演示:营销副总提交合同,自己也批
> 业务侧重:CRM 菜单(客户/机会/报价)

### 3.1 登录

- `vp-sales` / `Pass1234!`
- **预期**:顶部"王副总 / 营销中心"

### 3.2 营销域菜单

- **预期**:左侧展开 **营销与客户** → 应看到子菜单:**客户管理(客户/联系人/跟进记录)+ 销售与订单(机会/报价/销售订单/订单360/经营驾驶舱)**

### 3.3 提交合同评审(走 Flowable)

- 进 `http://127.0.0.1:33700/portal/supply/suppliers/contracts`
- 填一份合同(对方"ACME Inc.",金额 10 万,riskLevel medium)
- 点"提交评审"
- **预期**:
  - 状态变 `in_review`
  - 详情页底部"流程实例(Flowable)"卡片显示 `Simple Approval` 进行中
  - 审批中心"真实待办"区出现该待办(因为 vp-sales position=approver)
- 点"办理" → 同意
- **预期**:流程变 `已通过`,状态变 `approved`

### 3.4 验收要点 ✅

- [ ] CRM 菜单可见
- [ ] 提交合同 → 流程启动 → 自审自批 → 流程结束全流程

---

## 4. 角色:vp-mfg(赵副总 · 制造副总)

> 跨角色协作演示:vp-mfg 提交质量异常 → mgr-quality 完成 isolate → vp-mfg 完成 review
> 业务侧重:生产/质量菜单

### 4.1 登录

- `vp-mfg` / `Pass1234!`
- **预期**:顶部"赵副总 / 制造中心"

### 4.2 生产域菜单

- **预期**:展开 **计划与生产** → 应见:**生产看板(工厂总览/晨会总览)+ 计划与执行(排程/工单/派工任务/报工)**
- 展开 **质量与设备** → **质量管控(交付风险总览/交付风险池/告警中心/异常中心/检验任务/追溯查询)+ 设备运维(设备监控/维修工单/维修看板)**

### 4.3 走 qc_exception_v1 多步流程(用 API 模拟,UI 上生产域异常中心可触发)

```bash
# 用 vp-mfg 启动一个质量异常流程
TOKEN=$(curl -sX POST http://localhost:18080/realms/factory-platform/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" -d "client_id=dev-cli" -d "username=vp-mfg" -d "password=Pass1234!" | \
  python3 -c "import json,sys;print(json.load(sys.stdin)['access_token'])")

curl -sX POST http://localhost:33700/api/workflow/instances \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "businessKey": "QC-20260617-001",
    "processDefinitionKey": "qc_exception_v1",
    "variables": {"businessType": "incident", "severity": "high", "factory": "F1"}
  }'
```

- 然后**退出登录**,用 `mgr-quality` / `Pass1234!` 登录
- 进审批中心 → 应看到 isolate 任务(quality 组)
- 点"办理" → 同意
- 流程推进到 review(quality_manager / plant_manager 组)
- **退出登录**,用 `vp-mfg` 重新登录(plant_manager 组)
- 审批中心 → 应看到 review 任务
- 点"办理" → 同意
- 流程推进到 dispose(plant_manager 组)
- vp-mfg 办 dispose → 流程结束

### 4.4 验收要点 ✅

- [ ] 生产/质量菜单可见
- [ ] qc_exception_v1 三步流程跨角色协作 OK
- [ ] 截图 `vp-mfg-04-task-page.png` 显示 Flowable 任务页

---

## 5. 角色:vp-finance(陈总监 · 财务/风控)

> 默认落地页:审批中心(风险/超时)
> 自审自批演示:提交费用 + 提交 PR + 自己批

### 5.1 登录

- `vp-finance` / `Pass1234!`
- **预期**:顶部"陈总监 / 财务中心"

### 5.2 综合管理菜单

- **预期**:展开 **综合管理** → **流程与合规(审批中心/通知中心/审计日志/权限矩阵)+ 财务与费控(费用报销/费用流程看板)**

### 5.3 提交费用报销 + 采购 PR

- 进 `http://127.0.0.1:33700/portal/management/erp/expenses` → 新建报销(¥8888.50 差旅)
- 点"提交审批" → 跳详情页 → 看到"流程实例(Flowable)"卡片
- **预期**:
  - 状态:`审批中`
  - 流程实例卡片显示 simple_approval_v1 进行中
  - 业务详情页"同意"按钮可见(因为 vp-finance position=approver 在 candidateGroups)
- 点"同意" → 流程结束

- 进 `http://127.0.0.1:33700/portal/supply/procurement/create-pr` → 新建 PR
- 同样提交 → 应看到"流程实例"卡片

### 5.4 验收要点 ✅

- [ ] 财务/费控菜单可见
- [ ] 提交费用 → 流程启动 → 自审自批
- [ ] 提交 PR → 流程启动 → 自审自批

---

## 6. 综合验收(跨角色)

### 6.1 多人协作

- 用 demo 启动一个流程
- 用 ceo 登录 → 看到待办
- 用 ceo-deputy 登录 → **不应**看到(ceode-puty 不在 demo 流程的 candidateGroup 吗?—— 都在 approver 组,应该看到)

**实际**:所有高层 position=approver,都应在对方待办中可见。验证:
- 启动 5 个流程(每个 ceo 启动一个)
- 4 个其他高层登录 → 都应看到 5 条待办
- 5 个高层逐个同意 → 流程结束

### 6.2 截图核对

打开 `requirements/08_role-journeys/e2e-screenshots/highlevel/`,确认:
- 5 个角色各自的 `01-after-login.png` 顶部名字、菜单正常
- `02-approval-center.png` 看到"待办 · 真实流程"区
- `03-after-start-process.png` 看到"办理"链接
- `04-task-page.png` 看到 Flowable 任务页(任务名"审批"、候选人/组)

---

## 7. 已知问题 / 限制

- **demo 单点验证**:所有高层 `position=approver`,所以他们看到相同的待办。后续需要让 BPMN 加更多 group(如 finance / risk),让财务副总看财务复核单
- **后端不校验权限**:`POST /api/workflow/tasks/:id/complete` 不校验用户是否在 candidateGroups。所以即使你不在 group 也能完成。前端 `canAct` 在 UI 层挡住
- **qc_exception_v1 isolate 步骤需要 quality 角色**(`mgr-quality` / `inspector`),不是高层。vp-mfg 在 review 步骤才能办
- **mobile-app / mobile-portal-ui 未测**:本期只测 PC 端 portal-ui
- **浏览器缓存**:强制刷新(Ctrl+Shift+R 或 Cmd+Shift+R)避免旧菜单

---

## 8. 反馈

跑完后:
- ✅ 全过 → 我接着做中层(中层 5 角色:生产/质量/采购/设备/IT 经理)
- ❌ 有问题 → 把失败的角色 + 步骤 + 截图位置告诉我
