# 附加域 Additional

> 落地:`apps/portal-ui/src/app/pages/additional/`
> 关键角色:全员(申请/查询),党群/工会/妇联/人才发展中心负责人(审批/内容)
> 性质:文化与专项服务;**不参与生产经营决策**

## 1. 四个子中心

| 中心 | 路径 | 说明 |
|---|---|---|
| 人才发展中心 TDC | `/additional/tdc` | 培训/发展/活动 |
| 党群 Party | `/additional/party` | 党建/群团活动 |
| 工会 Union | `/additional/union` | 职工权益/福利 |
| 妇联 Women | `/additional/women` | 女职工专项 |

## 2. 业务对象(`packages/mock-data/src/models.ts`)

- `AdditionalCenter`(`tdc|party|union|women`):name / description / contactName / contactEmail
- `AdditionalService`:服务项
  - `type:'apply' | 'enroll' | 'query'`
  - `enabled` / `requireApproval` / `formSchema`(动态表单字段)
- `AdditionalRequest`:申请单
  - `status:'draft' | 'submitted' | 'accepted' | 'in_progress' | 'done' | 'rejected' | 'canceled'`
  - `formData:Record<string,string>` + `timeline`
- `AdditionalContent`:内容(通知/制度/FAQ)
  - `type:'notice' | 'policy' | 'faq'` / `pinned?`
- `AdditionalRole` / `AdditionalRoleBinding` / `AdditionalMember`:中心内 RBAC
  - 角色:`additional:global_admin` / `additional:center_admin` / `additional:center_agent` / `additional:viewer`

## 3. 关键交互

- **普通用户**:浏览内容(notice/policy/faq) + 提交申请/报名/查询
- **中心管理员**(`additional:center_admin`):审批 + 内容发布 + 服务配置
- **全局管理员**(`additional:global_admin`):跨中心 + 成员/角色管理

## 4. 与"支持域-人事/培训"的边界

- **附加域 - TDC**:聚焦"组织文化与发展"专项(讲座/读书会/师徒制等)
- **支持域 - HR/培训**:聚焦"通用培训/招聘/绩效/人事流程"
- 数据互通:用户在 HR 的"学习记录"可作为 TDC 的推荐依据(本期不实现)

## 5. 待办

- [ ] 表单引擎(`formSchema` 的动态渲染)
- [ ] 内容中心 CMS(发布/置顶/分类)
- [ ] 中心的 KPI(参与率、满意度)
- [ ] 与 Keycloak 角色映射
