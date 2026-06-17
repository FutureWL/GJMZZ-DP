# 经营域 Business

> 落地:`apps/portal-ui/src/app/pages/business/`
> 优先级:**P0**(经营驾驶舱)、P1(其他)
> 关键角色:总经理、营销副总、财务/风控

## 1. 目标

- 给**高层**提供"看全局"的入口,聚焦收入、订单、回款、毛利、客户。
- 给**营销/财务**提供日常分析入口(本期多为占位)。

## 2. 页面清单

| 页面 | 路径 | 优先级 | 状态 | 数据 |
|---|---|---|---|---|
| 经营驾驶舱(集团) | `/business/cockpit` | P0 | ✅ | mock 摘要 |
| 经营分析 | `/business/analysis` | P1 | 🟡 | 切片占位 |
| 营销/销售模块入口 | `/business/marketing` | P1 | 🟡 | 占位卡片 |
| 客户与机会 | `/business/customer` | P1 | 🟡 | mock `Customer`、`Opportunity` |
| 订单与合同 | `/business/order` | P1 | 🟡 | mock `Quote`、`QuoteLine` |
| 回款与预测 | `/business/collection` | P1 | 🟡 | 占位 |

## 3. 核心指标(驾驶舱 P0)

- 收入(本月/累计)、订单数、回款率、毛利率
- 客户等级分布(A/B/C)
- 重点客户风险提示
- 营销线索漏斗(占位)
- 经营异常摘要(下钻到生产/支持)

## 4. 业务对象(本期)

- `Customer`:name / industry / level / owner / lastContactAt / status / tags / risk / credit / nextFollowUp
- `Opportunity`:stage(lead/proposal/negotiation/won/lost)/ amount / closeDate
- `Contact`:customer 下的联系人
- `CrmActivity`:call/meeting/email/visit
- `Quote` / `QuoteLine`:报价单及行项

> 模型定义见 `packages/mock-data/src/models.ts`。

## 5. 关键交互

- 顶部全局"组织范围"切换(集团/工厂) → 影响驾驶舱数据范围
- 下钻:大数字 → 详情(本期多为占位,后续接生产/质量)
- 链接到 portal-ui 其他域(管理审批中心、生产告警)

## 6. 与其他域的连接

- **管理**:大额审批、单据回签
- **生产**:订单 → 工单 → 交付 → 回款(全链路)
- **附加**:无直接连接

## 7. 待办

- [ ] 经营驾驶舱接 `factory-api`(`/api/metrics/business`)
- [ ] 客户分级(ABCD)的具体计算口径
- [ ] 回款预测模型(占位先)
