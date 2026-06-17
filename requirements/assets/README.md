# Assets(资源/截图)

> 存放与需求文档相关的图、表格、截图等二进制资源
> 优先用 Markdown 文本表达(表格、流程图),需要图形时再放本目录

## 目录

```
assets/
├── README.md                 ← 本文件
├── architecture/             ← 架构图(PNG/SVG)
├── flows/                    ← 业务流转图(BPMN/SVG)
├── screenshots/              ← 页面截图(原型评审用)
└── incidents/                ← 故障案例(配合 06_runtime/02_*)
```

## 命名规范

- 架构图:`architecture/<topic>-<version>.svg`
- 流程图:`flows/<business>-<version>.svg|xml`
- 截图:`screenshots/<app>/<page>-<state>.png`
- 故障:`incidents/<YYYY-MM-DD>-<slug>.md`

## 引用方式

在 Markdown 文档中使用相对路径:

```md
![架构图](../assets/architecture/overview-v1.svg)
```

> 大文件(>2MB)请用 Git LFS 或外部链接(飞书/Confluence),避免仓库膨胀。
