# 01 Design Tokens（色彩/字体/间距/圆角/阴影）

## 1. 命名规则（建议）
- Token 分层：Base → Semantic → Component
- 形式示例（可用于 Figma Variables / CSS Variables）
  - Base：`--color-gray-100`
  - Semantic：`--color-bg-page`、`--color-text-primary`、`--color-status-running`
  - Component：`--button-primary-bg`

## 2. 色彩（Base Palette）
### 2.1 Neutral（中性色）
| Token | HEX（建议） | 说明 |
|---|---:|---|
| gray-0 | #FFFFFF | 纯白（尽量少用大面积） |
| gray-25 | #FAFAFB | 超浅背景 |
| gray-50 | #F5F6F8 | 页面底色（浅色主题） |
| gray-100 | #ECEEF2 | 分割/描边/弱底 |
| gray-200 | #D8DCE3 | 描边/禁用态 |
| gray-300 | #C3C9D4 | 次级文字/图标 |
| gray-500 | #8B95A7 | 辅助文字 |
| gray-700 | #4A5568 | 正文（浅色主题） |
| gray-900 | #1B2430 | 标题/高强调文字（浅色主题） |

### 2.2 Brand（品牌主色：稳重蓝）
| Token | HEX（建议） | 说明 |
|---|---:|---|
| blue-50 | #EAF2FF | 浅底高亮 |
| blue-200 | #9FC2FF | 浅交互态 |
| blue-500 | #2F6BFF | 主色（按钮/高亮） |
| blue-600 | #2457D6 | 主色 Hover/Active |
| blue-700 | #1E46AD | 深色强调 |

### 2.3 Semantic（语义色）
| 语义 | Token | HEX（建议） | 说明 |
|---|---|---:|---|
| Success | green-500 | #22C55E | 正常/成功/运行（可复用） |
| Warning | amber-500 | #F59E0B | 警告/风险 |
| Error | red-500 | #EF4444 | 错误/告警 |
| Info | cyan-500 | #06B6D4 | 信息/提示 |

## 3. 状态语义（制造场景）
建议所有“状态”同时提供：颜色 + 图标 + 文本（避免仅靠颜色）。

| 状态 | Token | 浅色 HEX | 深色 HEX | 说明 |
|---|---|---:|---:|---|
| 运行 | status-running | #22C55E | #34D399 | 正常生产 |
| 待机 | status-idle | #64748B | #94A3B8 | 有电但不生产 |
| 停机 | status-stopped | #F59E0B | #FBBF24 | 计划/非计划停机可用标签区分 |
| 故障 | status-fault | #EF4444 | #FB7185 | 设备故障 |
| 离线 | status-offline | #94A3B8 | #64748B | 断联/无数据 |
| 维护中 | status-maintenance | #8B5CF6 | #A78BFA | 维护窗口 |
| 告警 | status-alarm | #DC2626 | #FF4D4F | 严重告警（可提高饱和与亮度） |

## 3.1 流程状态语义（审批/招采/准入/招聘）
| 状态 | Token | 浅色 HEX | 深色 HEX | 说明 |
|---|---|---:|---:|---|
| 草稿 | flow-draft | #64748B | #94A3B8 | 未提交 |
| 审批中 | flow-in-review | #2F6BFF | #4C7DFF | 流程进行中 |
| 已通过 | flow-approved | #22C55E | #34D399 | 审批通过/生效 |
| 已驳回 | flow-rejected | #EF4444 | #FB7185 | 退回/拒绝 |
| 已取消 | flow-cancelled | #94A3B8 | #64748B | 主动撤销/作废 |
| 超时 | flow-overdue | #F59E0B | #FBBF24 | SLA 超时（建议配合“超时标签”） |

## 3.2 风险等级语义（供应商/外协）
| 等级 | Token | 浅色 HEX | 深色 HEX | 说明 |
|---|---|---:|---:|---|
| 低 | risk-low | #22C55E | #34D399 | 正常 |
| 中 | risk-medium | #F59E0B | #FBBF24 | 关注 |
| 高 | risk-high | #EF4444 | #FB7185 | 风险 |
| 严重 | risk-critical | #DC2626 | #FF4D4F | 红色预警 |

## 3.3 合规提醒语义（证照到期/黑名单/违规）
| 类型 | Token | 浅色 HEX | 深色 HEX | 说明 |
|---|---|---:|---:|---|
| 证照到期 | compliance-expiring | #F59E0B | #FBBF24 | 临近到期（建议同时显示“剩余天数”） |
| 黑名单 | compliance-blacklist | #DC2626 | #FF4D4F | 禁止合作（强制置顶提示） |
| 违规 | compliance-violation | #EF4444 | #FB7185 | 违规事件/审计问题 |

## 3.4 域色（Domain Tokens：五域门户）
用于门户切换、导航徽标、搜索结果分组标题、域标签（chip）。域色强调“可识别”，但不建议用于大面积背景（保持企业中性风）。

| 域 | Token | 浅色 HEX | 深色 HEX | 说明 |
|---|---|---:|---:|---|
| 经营 | domain-business | #2F6BFF | #4C7DFF | 与品牌主色一致，强调“结果/增长” |
| 管理 | domain-management | #6366F1 | #818CF8 | 区分于维护紫，偏蓝紫更克制 |
| 生产 | domain-production | #22C55E | #34D399 | 强现场执行与状态联想 |
| 支持 | domain-support | #F59E0B | #FBBF24 | 与“风险/提醒”关联更强 |
| 附加 | domain-additional | #06B6D4 | #22D3EE | 文化与专项机构更轻量 |

## 3.5 域标签（Chip）样式规则（视觉）
- 背景：使用对应域色的 8%–12% 透明度底色（或使用浅色主题的 `bg-surface` + 1px 域色描边）
- 文本：`text-secondary`，必要时使用域色作为小图标/小圆点
- 形态：`radius-2`，高度建议 24px，左右内边距 8–10px
- 用途：仅用于“归类/分组/识别”，不要替代按钮与主导航高亮

## 4. 主题映射（Light / Dark）
### 4.1 Light（办公）
| Token | HEX（建议） | 说明 |
|---|---:|---|
| bg-page | #F5F6F8 | 页面底 |
| bg-surface | #FFFFFF | 卡片/面板 |
| border-subtle | #ECEEF2 | 细分割线 |
| text-primary | #1B2430 | 主文本 |
| text-secondary | #4A5568 | 次文本 |
| text-tertiary | #8B95A7 | 辅助 |
| icon-primary | #4A5568 | 主图标 |
| primary | #2F6BFF | 主色 |
| primary-hover | #2457D6 | 主色交互 |
| focus | #9FC2FF | 焦点描边 |

### 4.2 Dark（大屏/夜班）
| Token | HEX（建议） | 说明 |
|---|---:|---|
| bg-page | #0B1220 | 页面底（深灰蓝，避免纯黑） |
| bg-surface | #111B2E | 卡片/面板 |
| border-subtle | #1E2A44 | 细分割线 |
| text-primary | #E6EAF2 | 主文本（避免纯白） |
| text-secondary | #B7C0D6 | 次文本 |
| text-tertiary | #8A96B2 | 辅助 |
| icon-primary | #B7C0D6 | 主图标 |
| primary | #4C7DFF | 主色（深色下提高亮度） |
| primary-hover | #6A93FF | 主色交互 |
| focus | #9FC2FF | 焦点描边 |

## 5. 字体（Typography）
### 5.1 字体栈（建议）
- 中文：`PingFang SC` / `Microsoft YaHei` / `Noto Sans SC`
- 英文与数字：`Inter` / `Segoe UI`（如不可用则使用系统默认）
- 数值对齐：KPI 与表格数值建议使用等宽数字（OpenType：tabular nums）

### 5.2 字号阶梯（PC）
| 用途 | Size | Weight | 行高 |
|---|---:|---:|---:|
| 页面标题 | 20 | 600 | 28 |
| 区块标题 | 16 | 600 | 24 |
| 正文/表格 | 14 | 400/500 | 22 |
| 辅助/说明 | 12 | 400 | 18 |

### 5.3 大屏字号阶梯（1920×1080 基准）
| 用途 | Size | 说明 |
|---|---:|---|
| 总标题 | 32–40 | 远距可读 |
| KPI 数值 | 48–72 | 关键指标 |
| 模块标题 | 20–24 | 区块标题 |
| 告警列表 | 18–22 | 严重告警可更大 |

## 6. 间距与密度（Spacing）
| Token | px | 说明 |
|---|---:|---|
| space-2 | 8 | 元素间最小间距 |
| space-3 | 12 | 表单控件间 |
| space-4 | 16 | 卡片内边距 |
| space-6 | 24 | 区块间距 |
| space-8 | 32 | 页面主区块间距 |

## 7. 圆角、描边、阴影
### 7.1 圆角（Radius）
| Token | px | 说明 |
|---|---:|---|
| radius-2 | 6 | 输入框/按钮 |
| radius-3 | 10 | 卡片 |

### 7.2 描边（Border）
- 普通描边：1px `border-subtle`
- 强调描边：1px `focus`（仅用于聚焦/选中）

### 7.3 阴影（Shadow）
浅色主题建议低对比阴影；深色主题更多用“亮边/分割线”而不是强阴影。

| Token | 建议 |
|---|---|
| shadow-1 | 0 1px 2px rgba(16,24,40,0.06) |
| shadow-2 | 0 4px 12px rgba(16,24,40,0.10) |

