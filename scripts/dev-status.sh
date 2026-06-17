#!/usr/bin/env bash
# =============================================================
#  dev-status.sh  -  一键查看仓库 + 运行时 + 下一步建议
# =============================================================
#  用法:
#    bash scripts/dev-status.sh            # 默认(全量)
#    bash scripts/dev-status.sh quick      # 快速(跳过测试)
#    bash scripts/dev-status.sh urls       # 只看访问地址
#    bash scripts/dev-status.sh creds      # 只看账号密码
#    bash scripts/dev-status.sh next       # 只看"下一步"建议
# =============================================================

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

MODE="${1:-full}"

# ---- 颜色 ----
if [ -t 1 ]; then
  GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[0;33m'
  BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'
  GRAY='\033[0;90m'; NC='\033[0m'
else
  GREEN=''; RED=''; YELLOW=''; BLUE=''; CYAN=''; BOLD=''; GRAY=''; NC=''
fi

ok()   { printf "${GREEN}✓${NC} %s\n" "$*"; }
fail() { printf "${RED}✗${NC} %s\n" "$*"; }
warn() { printf "${YELLOW}!${NC} %s\n" "$*"; }
hdr()  { printf "\n${BOLD}${CYAN}━━━ %s ━━━${NC}\n" "$*"; }
sub()  { printf "  ${GRAY}%-40s${NC} %s\n" "$1" "$2"; }

# 读取 .env 的安全解析(sourcing 在带空格未加引号的值时会报 "command not found")
load_env() {
  if [ ! -f "$REPO_ROOT/.env" ]; then return; fi
  while IFS= read -r line; do
    # 跳过注释/空行
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    # 只接受 KEY=VALUE,VALUE 可有空格(整行除首个 = 后全给 value)
    if [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      k="${BASH_REMATCH[1]}"
      v="${BASH_REMATCH[2]}"
      # 去掉尾随空白
      v="${v%"${v##*[![:space:]]}"}"
      export "$k"="$v"
    fi
  done < "$REPO_ROOT/.env"
}

load_env

# ============================================================
# 1. 仓库状态
# ============================================================
section_git() {
  hdr "1. 仓库状态"

  # 分支
  branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  sub "分支" "$branch"

  # 与远程的差
  ahead=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo 0)
  behind=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo 0)
  if [ "$ahead" -gt 0 ] || [ "$behind" -gt 0 ]; then
    sub "与远程" "↑$ahead ↓$behind (需要 git pull/push)"
    [ "$ahead" -gt 0 ] && warn "本地领先远程 $ahead 个提交,记得 push"
    [ "$behind" -gt 0 ] && warn "远程领先本地 $behind 个提交,记得 pull"
  else
    sub "与远程" "同步"
  fi

  # 工作区状态
  if git diff --quiet HEAD 2>/dev/null && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    ok "工作区干净(无未提交改动)"
  else
    fail "工作区有改动"
    changed=$(git status --short | wc -l | tr -d ' ')
    sub "未提交条目数" "$changed"
    git status --short | head -10 | while IFS= read -r line; do
      printf "    ${GRAY}%s${NC}\n" "$line"
    done
    [ "$changed" -gt 10 ] && printf "    ${GRAY}... 还有 %d 条${NC}\n" "$((changed - 10))"
  fi

  # 最近 3 个提交
  hdr "1.1 最近提交(3 个)"
  git log --oneline -3 --color=never | while IFS= read -r line; do
    printf "    ${GRAY}%s${NC}\n" "$line"
  done
}

# ============================================================
# 2. 运行时状态(Docker + 关键 API)
# ============================================================
section_runtime() {
  hdr "2. 运行时状态"

  if ! command -v docker >/dev/null 2>&1; then
    fail "docker 命令未找到"
    return
  fi

  if ! docker info >/dev/null 2>&1; then
    fail "docker daemon 未运行"
    return
  fi

  # docker compose ps
  if [ -f "$REPO_ROOT/docker-compose.yml" ]; then
    local total up down stopped_names
    total=$(docker compose ps --services 2>/dev/null | grep -c . || true)
    up=$(docker compose ps --status running --services 2>/dev/null | grep -c . || true)
    down=$((total - up))
    sub "服务总数" "$total (运行 $up / 停止 $down)"
    if [ "$down" -gt 0 ]; then
      stopped_names=$(docker compose ps --status stopped --services 2>/dev/null | tr '\n' ',' | sed 's/,$//')
      warn "未运行的服务:$stopped_names"
    fi
  fi

  # 关键 API 健康
  hdr "2.1 关键 API 健康"
  check_http() {
    local label="$1"; local url="$2"; local expect="${3:-200}"
    local code
    code=$(curl -sS -m 3 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo "000")
    if [ "$code" = "$expect" ] || ([ "$expect" = "any" ] && [ "$code" != "000" ]); then
      ok "$label ($code)"
    else
      fail "$label ($code,期望 $expect)"
    fi
  }

  check_http "factory-api  (3001)"    "http://localhost:33704/health" 200
  check_http "keycloak    (18080)"   "http://localhost:18080/realms/factory-platform/.well-known/openid-configuration" 200
  check_http "flowable-rest(33725)"   "http://localhost:33725/flowable-rest/service/repository/process-definitions" "any"
  check_http "portal-ui   (33701)"   "http://localhost:33701/" "any"
  check_http "cockpit-ui  (33703)"   "http://localhost:33703/" "any"
  check_http "gateway     (33700)"   "http://localhost:33700/" "any"
  check_http "cloudbeaver (33706)"   "http://localhost:33706/" "any"
  check_http "minio       (33710)"   "http://localhost:33710/minio/health/live" 200
  check_http "rabbitmq    (33709)"   "http://localhost:33709/" "any"

  # 已部署的 BPMN
  hdr "2.2 已部署的 BPMN"
  local fuser="${FLOWABLE_REST_USER:-rest-admin}"
  local fpass="${FLOWABLE_REST_PASSWORD:-test}"
  local fjson
  fjson=$(curl -sS -m 5 -u "$fuser:$fpass" \
    "http://localhost:33725/flowable-rest/service/repository/process-definitions?latest=true" 2>/dev/null)
  if [ -n "$fjson" ]; then
    FLOWABLE_JSON="$fjson" python3 << 'PYEOF' 2>/dev/null
import json, os
try:
    d = json.loads(os.environ.get("FLOWABLE_JSON", "{}")).get("data", [])
    if not d:
        print("  (无已部署流程)")
    for p in d:
        k = p.get("key", "")
        v = p.get("version", 0)
        n = p.get("name", "")
        print(f"  - {k:30s} v{v}  {n}")
except Exception as e:
    print(f"  解析失败: {e}")
PYEOF
  else
    warn "Flowable 未响应"
  fi
}

# ============================================================
# 3. 测试状态
# ============================================================
section_tests() {
  hdr "3. 测试状态(最近一次 / 可选重跑)"

  # role-tests 目录
  local rt="$REPO_ROOT/apps/factory-api/scripts/role-tests"
  if [ ! -d "$rt" ]; then
    warn "role-tests 目录不存在"
    return
  fi

  # 数脚本
  local n_sh n_spec
  n_sh=$(ls "$rt"/test-*.sh 2>/dev/null | wc -l | tr -d ' ')
  n_spec=$(ls "$rt"/e2e/*.spec.js 2>/dev/null | wc -l | tr -d ' ')
  sub "API smoke 脚本"  "$n_sh 个"
  sub "Playwright 套件" "$n_spec 个"

  # 最近一次结果
  local last_run="$rt/test-results/.last-run.json"
  if [ -f "$last_run" ]; then
    local status
    status=$(python3 -c 'import json;print(json.load(open("'"$last_run"'")).get("status","unknown"))' 2>/dev/null || echo "unknown")
    if [ "$status" = "passed" ]; then
      ok "上次 Playwright 运行: PASSED"
    else
      fail "上次 Playwright 运行: $status"
    fi
  else
    warn "Playwright 还没跑过(无 .last-run.json)"
  fi

  # 是否要建议重跑
  if [ "$MODE" = "quick" ]; then
    sub "模式" "quick(跳过重跑)"
    return
  fi

  # 让用户选择:不直接跑(避免长时间阻塞),只提示
  printf "\n  ${GRAY}重跑全部测试:${NC}\n"
  printf "    bash %s/run-all-highlevel.sh\n" "$rt"
  printf "    bash %s/run-all-middleground.sh\n" "$rt"
  printf "    bash %s/run-all-frontline.sh\n" "$rt"
  printf "    bash %s/run-all.sh  ${GRAY}# 一键跑全部(尚未提供,目前需手跑 3 次)${NC}\n" "$rt"
}

# ============================================================
# 4. 访问地址
# ============================================================
section_urls() {
  hdr "4. 访问地址"
  cat <<EOF
  ${BOLD}门户(用户视角)${NC}
    网关统一入口:    http://localhost:33700/
    Portal UI(PC):   http://localhost:33701/
    Mobile H5:       http://localhost:33702/
    Cockpit 大屏:    http://localhost:33703/

  ${BOLD}后端 API${NC}
    factory-api:     http://localhost:33704/   (Swagger: /docs)
    health:          http://localhost:33704/health

  ${BOLD}基础设施${NC}
    Keycloak SSO:    http://localhost:18080/  (或 http://localhost:18080/admin)
    Postgres:        localhost:33705  (user=factory pass=factory db=factory)
    CloudBeaver:     http://localhost:33706/
    Redis:           localhost:33707
    RabbitMQ AMQP:   localhost:33708  (UI: http://localhost:33709/)
    MinIO S3:        localhost:33710  (Console: http://localhost:33711/)
    TDengine:        localhost:33712 / 33713 / 33714

  ${BOLD}Flowable(流程引擎)${NC}
    Flowable REST:   http://localhost:33725/flowable-rest/service
    Flowable Task:   http://localhost:33722/
    Flowable Modeler:http://localhost:33723/
    Flowable Admin:  http://localhost:33724/
    Flowable IDM:    http://localhost:33721/(已禁用 443)

  ${BOLD}LAN IP 访问${NC}(已在 realm.json 加 192.168.x.x redirect)
    例:http://192.168.3.104:33700/portal/login
EOF
}

# ============================================================
# 5. 账号密码
# ============================================================
section_creds() {
  hdr "5. 账号密码"

  cat <<EOF
  ${BOLD}基础设施管理员${NC}
    Keycloak admin:      ${KC_ADMIN_USERNAME:-admin} / ${KC_ADMIN_PASSWORD:-admin}
    Postgres 业务库:      factory / factory  (db=factory)
    Postgres Keycloak 库: keycloak / keycloak  (db=keycloak,启动时自动建)
    CloudBeaver:         cbadmin / cbadmin
    RabbitMQ:            factory / factory
    MinIO:               minioadmin / minioadmin
    Flowable REST:       ${FLOWABLE_REST_USER:-rest-admin} / ${FLOWABLE_REST_PASSWORD:-test}
    Flowable IDM:        admin / test

  ${BOLD}业务测试用户(15 个,统一密码)${NC}
    seed:  bash apps/factory-api/scripts/role-tests/seed-keycloak-users.mjs
    密码:  Pass1234!
    client:dev-cli  (用 grant_type=password 拿 token)

    高层 5 角色(approver):
      ceo              张总       - 总经办
      ceo-deputy       李副总     - 总经办
      vp-sales         王副总     - 营销中心
      vp-mfg           赵副总     - 制造中心
      vp-finance       陈总监     - 财务中心

    中层 5 角色:
      mgr-production   钱经理     - 制造中心     (manager)
      mgr-quality      孙经理     - 质量中心     (quality_manager)
      mgr-procurement  周经理     - 采购中心     (approver)
      mgr-equipment    吴经理     - 设备中心     (plant_manager)
      mgr-it           郑经理     - 信息中心     (approver)

    基层 5 角色:
      worker-leader    冯班组长   - 生产一部     (approver)
      planner          陈计划员   - 生产计划部   (approver)
      inspector        褚检验员   - 质量中心     (quality)        ⭐
      tech             卫维修     - 设备中心     (plant_manager)
      warehouse        蒋库管     - 仓储中心     (approver)
EOF
}

# ============================================================
# 6. 下一步建议(基于状态自动判断)
# ============================================================
section_next() {
  hdr "6. 下一步建议(自动)"

  local suggestions=()

  # 1) 工作区脏 → 先 commit
  if ! git diff --quiet HEAD 2>/dev/null || [ -n "$(git ls-files --others --exclude-standard)" ]; then
    suggestions+=("工作区有未提交改动 → git add -A && git commit -m '...' (或 git stash)")
  fi

  # 2) 领先远程 → push
  local ahead
  ahead=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo 0)
  if [ "$ahead" -gt 0 ]; then
    suggestions+=("本地领先远程 $ahead 个提交 → git push origin master")
  fi

  # 3) 容器有 down
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    local down
    down=$(docker compose ps --status stopped --services 2>/dev/null | grep -c . || true)
    if [ "$down" -gt 0 ]; then
      stopped=$(docker compose ps --status stopped --services 2>/dev/null | tr '\n' ',' | sed 's/,$//')
      suggestions+=("$down 个服务未运行:$stopped → docker compose up -d --build")
    fi
  fi

  # 4) 关键 API 不通
  local api_ok=1
  for url in "http://localhost:33704/health" "http://localhost:18080/realms/factory-platform/.well-known/openid-configuration"; do
    local code
    code=$(curl -sS -m 3 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo "000")
    if [ "$code" != "200" ]; then api_ok=0; break; fi
  done
  if [ $api_ok -eq 0 ]; then
    suggestions+=("关键 API 不通 → docker compose logs factory-api | tail -100 排查")
  fi

  # 5) CHANGELOG 条目的"下一步/下一阶段"提示 — 取最近一个有该关键字的
  local cl="$REPO_ROOT/requirements/07_changelog/CHANGELOG.md"
  if [ -f "$cl" ]; then
    # 按条目 (## 分割), 顺序遍历取最后一个包含 hint 的
    # 找到含 hint 的行后,跳过标题本身(下一阶段:),取下面 2-3 个 bullet
    local hint
    hint=$(awk '
      /^## / {
        buf = ""
        found = 0
        cnt = 0
        next
      }
      {
        if (!found) {
          if (match($0, /下一阶段|X\+ 待办|下一步\(|可进入/)) {
            found = 1
            # 看这一行后面是否接了项目(如 - **下一阶段**: foo)
            if (match($0, /:[[:space:]]*(.*)$/)) {
              rest = substr($0, RSTART+1)
              gsub(/^[[:space:]]+/, "", rest)
              gsub(/`/, "", rest)
              if (length(rest) > 0 && rest !~ /^$/) {
                print rest
                cnt++
              }
            }
            # 跳到下一行
            buf = "FOUND"
            next
          }
        } else if (buf == "FOUND") {
          # buf 用来存上一次是不是 FOUND
          if ($0 ~ /^[[:space:]]*-/ && $0 !~ /^- \*\*[^*]+\*\*:$/) {
            # 子弹
            line = $0
            sub(/^[[:space:]]*-[[:space:]]*/, "", line)
            gsub(/\*\*/, "", line)
            gsub(/`/, "", line)
            sub(/^[[:space:]]*/, "", line)
            print line
            cnt++
            if (cnt >= 3) exit
          } else if ($0 ~ /^- \*\*[^*]+\*\*:/) {
            # 另一个标题行(如 **验证**:),跳过
            next
          }
        }
      }
    ' "$cl" 2>/dev/null)
    if [ -n "$hint" ]; then
      while IFS= read -r line; do
        [ -n "$line" ] && suggestions+=("CHANGELOG 提示: $line")
      done <<< "$hint"
    fi
  fi

  # 6) Backlog 表(取前 3 行)
  if [ -f "$cl" ]; then
    local backlog
    backlog=$(awk '
      /^## 待评审/ { in_b=1; next }
      in_b && /^## / { exit }
      in_b && /^\| - \|/ {
        gsub(/^\| - \| /,"")
        sub(/\|.*$/,"")
        gsub(/`/,"")
        print
      }
    ' "$cl" 2>/dev/null | head -3)
    if [ -n "$backlog" ]; then
      suggestions+=("Backlog 候选:")
      while IFS= read -r line; do
        suggestions+=("  - $line")
      done <<< "$backlog"
    fi
  fi

  if [ ${#suggestions[@]} -eq 0 ]; then
    ok "一切正常,可进入新功能开发"
    printf "\n  ${GRAY}参考下一阶段选项(看需求文档):${NC}\n"
    printf "    bash %s/requirements/08_role-journeys/*.md  # 角色矩阵\n" "$REPO_ROOT"
    printf "    code %s/requirements/07_changelog/CHANGELOG.md  # 看最近动态\n" "$REPO_ROOT"
  else
    for s in "${suggestions[@]}"; do
      printf "  ${YELLOW}→${NC} %s\n" "$s"
    done
  fi

  printf "\n  ${BOLD}${BLUE}当前阶段:${NC} 业务详情页已切 Flowable(L4)+ LAN IP SSO 已修 + 角色测试 15/15 PASS\n"
  printf "  ${BOLD}${BLUE}候选下一阶段:${NC}\n"
  printf "    A. ${BOLD}角色权限细化${NC}(Backlog):portal-ui 增加'角色 → 菜单可见'映射\n"
  printf "       用例:inspector 登录只见质量相关菜单\n"
  printf "    B. ${BOLD}L5+ 多步审批 BPMN${NC}:部门负责人 → 财务 → 总经理\n"
  printf "       资产:multi_step_approval_v1.bpmn20.xml\n"
  printf "    C. ${BOLD}业务侧状态持久化${NC}:public.workflow_bridge 表已在,接 Flowable 回调\n"
  printf "    D. ${BOLD}Backlog 其他${NC}:WorkOrder 落 Prisma / OpenTelemetry / 移动端 barcode-scanner\n"
}

# ============================================================
# main
# ============================================================
case "$MODE" in
  quick)
    section_git
    section_runtime
    section_next
    ;;
  urls)
    section_urls
    ;;
  creds)
    section_creds
    ;;
  next)
    section_next
    ;;
  full|*)
    section_git
    section_runtime
    section_tests
    section_urls
    section_creds
    section_next
    ;;
esac

# 收尾
printf "\n${GRAY}完整文档:${NC}\n"
printf "  - %s/README.md                          (访问地址 + 启动)\n" "$REPO_ROOT"
printf "  - %s/requirements/README.md             (需求 SSOT)\n" "$REPO_ROOT"
printf "  - %s/requirements/07_changelog/CHANGELOG.md (变更日志)\n" "$REPO_ROOT"
printf "  - %s/requirements/08_role-journeys/     (15 角色矩阵 + 验收清单)\n" "$REPO_ROOT"
printf "\n"