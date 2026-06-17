# CI Scripts

> 给 `.github/workflows/ci.yml` 用的辅助脚本
> 单独抽出来避免 YAML 里嵌 Python 的引号嵌套噩梦

## validate-bpmn.py

校验 `infra/flowable/bpmn/*.bpmn20.xml` 的 XML 格式,统计 process/userTask/gateway 数量。

```bash
python3 scripts/ci/validate-bpmn.py
# 输出:OK qc-exception-v1.bpmn20.xml: 1 proc, 3 task, 0 gw, 1 start, 1 end
```

## validate-realm.py

校验 `infra/compose/sso-dev/realm/factory-platform-realm.json` 的 JSON 格式,
统计 clients/users/roles 数量。

```bash
python3 scripts/ci/validate-realm.py
# 输出:OK realm factory-platform: clients: 5 ..., users: 1, roles: 0
```

## 本地预跑 CI 的 e2e

```bash
# 1. 起 docker
docker compose up -d --build

# 2. seed 用户
node apps/factory-api/scripts/role-tests/seed-keycloak-users.mjs

# 3. 跑 e2e
cd apps/factory-api/scripts/role-tests
npx playwright test e2e/role-menu-visibility.spec.js
```

## 加新 CI 脚本

1. 在 `scripts/ci/` 下加新 `.py` 文件
2. 在 `.github/workflows/ci.yml` 的 `infra-validate` job 加一步 `run: python3 scripts/ci/xxx.py`
3. 避免在 YAML 里直接写 Python(引号嵌套会爆)