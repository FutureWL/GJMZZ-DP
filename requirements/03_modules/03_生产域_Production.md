# 生产域 Production

> 落地:`apps/portal-ui/src/app/pages/production/`
> 后端:`apps/factory-api/src/modules/{incidents,factories}/`(Incident 已落库)
> 关键角色:制造副总、生产经理、质量经理、设备经理、班组长/计划员/检验员/维修技师

## 1. 子模块清单

| 子模块 | 路径 | 优先级 | 状态 | 关键对象 |
|---|---|---|---|---|
| 工厂总览 Overview | `/production/overview` | P0 | ✅ | `Factory`、`WorkOrder` |
| 工单 WorkOrder | `/production/work-orders` | P0 | ✅ | `WorkOrder` |
| 排程 Schedule | `/production/schedule` | P0 | ✅ | 甘特(产线/工序切换) |
| 质量 Quality | `/production/quality` | P0 | ✅ | `QualityTask` |
| 设备 Equipment | `/production/equipment` | P0 | ✅ | `EquipmentAsset`、`MaintenanceTicket` |
| OEE | `/production/oee` | P0 | ✅ | 可用率/性能/质量 |
| 告警 Alarm | `/production/alarm` | P0 | ✅ | `Alarm`、`DeliveryRisk`、`Incident` |
| 追溯 Trace | `/production/trace` | P0 | ✅ | `TraceRecord` |
| 订单 Order | `/production/order` | P1 | 🟡 | mock |
| 异常/停线 | `/production/incident` | P0 | ✅ | `Incident`(已落库) |
| SPC 看板 | `/production/spc` | P0 | ✅ | 趋势/控制图 |
| 报工/进度 | `/production/reporting` | P1 | 🟡 | 移动端优先 |

## 2. 关键对象

- `Factory`:工厂
- `WorkOrder`:工单(product/line/status/progress/planStart/planEnd)
- `TraceRecord`:批次/序列追溯(type='batch'|'serial')
- `QualityTask`:检验任务(incoming/process/final + ok/ng/hold)
- `MesDispatch`:派工(workOrderId/line/station/assignee/planQty/doneQty)
- `EquipmentAsset`:设备台账
- `MaintenanceTicket`:维修工单(状态机:reported→dispatched→accepted→on_site→repairing→done→verified→closed,见 `models.ts`)
- `Alarm`:告警(severity:critical/high/medium/low)
- `DeliveryRisk`:交付风险(material_shortage / bottleneck / quality)
- `Incident`:事故(已落库,见 `apps/factory-api/prisma/schema.prisma`)

## 3. 告警中心(高优先级)

- 统一入口:列表(按严重度/状态/工厂/产线筛选) + 详情抽屉
- 来源:
  - 设备告警(可与 OEE、TDengine 时序数据联动)
  - 质量异常(质量任务的 NG/Hold)
  - 交付风险(订单交期风险,见 `DeliveryRisk`)
  - 事故(Incident,已落库)
- 处理流程:确认 → 派工 → 处理 → 留痕 → 关闭(走 `MaintenanceTicket` 的状态机)

## 4. 排程(甘特)

- 维度:产线 / 工序(切换)
- 字段:工单/计划起止/进度/瓶颈标识
- 交互:拖拽改期(本期视觉位,后续接排产算法)

## 5. 质量

- 检验任务列表 + 详情(结果、图片/附件位、判定)
- SPC 趋势/控制图 + 规则触发提示
- 追溯:输入/扫码位 + 链路详情
- 不良/缺陷分析(Pareto/分布/TopN,P1)

## 6. 设备与 OEE

- 设备台账、状态、关键点位、事件时间轴(位)
- OEE 看板:Availability / Performance / Quality 三大要素

## 7. 晨会(Morning Meeting)

- `MorningMeetingKpi`(good/warn/bad)、`MorningRisk` 列表
- 跨域:把生产/管理/支持的当日要点汇总给高层

## 8. 与后端的连接

- `GET/POST /api/incidents` → Prisma `incident` 表
- `GET /api/factories` → 工厂主数据
- 其他(工单/质量/设备/告警)目前走 mock-data,后续逐个接入

## 9. 待办

- [ ] 排程算法(拖拽改期、瓶颈识别)
- [ ] SPC 规则引擎
- [ ] 与 TDengine 时序数据集成
- [ ] 移动端报工/维修闭环(接 mobile-app)
- [ ] 事故类型的 SLA 配置
