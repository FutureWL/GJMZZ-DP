-- generated from dev database
BEGIN;
--
-- PostgreSQL database dump
--

\restrict UyxVVVLUmpQnZkE041xUO2SNaHtxKwqBH0vc6SZl7yh9bwqLg2wI72ye8StkrtK

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: menu_item; Type: TABLE; Schema: public; Owner: factory
--

CREATE TABLE public.menu_item (
    id text NOT NULL,
    portal_id text DEFAULT 'main'::text NOT NULL,
    parent_id text,
    label text NOT NULL,
    path text,
    icon_name text,
    sort_order integer DEFAULT 0 NOT NULL,
    required_roles text[],
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.menu_item OWNER TO factory;

--
-- Name: menu_item menu_item_pkey; Type: CONSTRAINT; Schema: public; Owner: factory
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT menu_item_pkey PRIMARY KEY (id);


--
-- Name: idx_menu_item_parent; Type: INDEX; Schema: public; Owner: factory
--

CREATE INDEX idx_menu_item_parent ON public.menu_item USING btree (portal_id, parent_id);


--
-- PostgreSQL database dump complete
--

\unrestrict UyxVVVLUmpQnZkE041xUO2SNaHtxKwqBH0vc6SZl7yh9bwqLg2wI72ye8StkrtK

--
-- PostgreSQL database dump
--

\restrict ha8grES0XTxhFaaXbYoNueA8DhOhxgHIdT8rncDJsrisdXh5OB4JpBavy9ISInN

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: menu_item; Type: TABLE DATA; Schema: public; Owner: factory
--

INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('workbench', 'main', NULL, '工作台', NULL, NULL, 10, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/workbench', 'main', 'workbench', '我的工作台', '/workbench', 'LayoutDashboard', 11, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/search', 'main', 'workbench', '全局搜索', '/search', 'Activity', 12, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('warehouse', 'main', NULL, '仓储与物流', NULL, NULL, 50, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/management/erp/inventory', 'main', 'warehouse', '库存台账', '/management/erp/inventory', 'Boxes', 51, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/management/erp/master-data', 'main', 'warehouse', '主数据（占位）', '/management/erp/master-data', 'Database', 52, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('admin', 'main', NULL, '综合管理', NULL, NULL, 70, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('admin.compliance', 'main', 'admin', '流程与合规', NULL, NULL, 71, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/management/approval', 'main', 'admin.compliance', '审批中心', '/management/approval', 'BadgeCheck', 72, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/management/notifications', 'main', 'admin.compliance', '通知中心', '/management/notifications', 'Activity', 73, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/management/audit/log', 'main', 'admin.compliance', '审计日志', '/management/audit/log', 'ClipboardList', 74, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/management/security/permissions', 'main', 'admin.compliance', '权限矩阵', '/management/security/permissions', 'Shield', 75, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('admin.finance', 'main', 'admin', '财务与费控', NULL, NULL, 76, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/management/erp/expenses', 'main', 'admin.finance', '费用报销', '/management/erp/expenses', 'Receipt', 77, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/management/expense/dashboard', 'main', 'admin.finance', '费用流程看板', '/management/expense/dashboard', 'LineChart', 78, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('admin.support', 'main', 'admin', '员工服务与IT', NULL, NULL, 79, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/support/home', 'main', 'admin.support', '员工服务工作台', '/support/home', 'LifeBuoy', 80, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/support/tickets', 'main', 'admin.support', '工单中心', '/support/tickets', 'ClipboardList', 81, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/support/requests', 'main', 'admin.support', '服务请求', '/support/requests', 'FileText', 82, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/support/notices', 'main', 'admin.support', '公告', '/support/notices', 'Activity', 83, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/support/kb', 'main', 'admin.support', '知识库/SOP', '/support/kb', 'FileText', 84, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/support/hr', 'main', 'admin.support', '人事（占位）', '/support/hr', 'Users', 85, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/support/finance', 'main', 'admin.support', '财务（占位）', '/support/finance', 'LineChart', 86, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/support/it/tickets', 'main', 'admin.support', 'IT 工单（原入口）', '/support/it/tickets', 'Wrench', 87, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('admin.additional', 'main', 'admin', '附加与个人', NULL, NULL, 88, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/additional/home', 'main', 'admin.additional', '附加中心', '/additional/home', 'LayoutDashboard', 89, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/additional/requests', 'main', 'admin.additional', '我的申请（附加）', '/additional/requests', 'ClipboardList', 90, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('quality', 'main', NULL, '质量与设备', NULL, NULL, 60, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('supplychain', 'main', NULL, '采购与供应链', NULL, NULL, 40, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/management/procurement/pr', 'main', 'supplychain', '采购 PR/PO', '/management/procurement/pr', 'ShoppingCart', 41, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/management/procurement/pr/new', 'main', 'supplychain', '新增采购PR', '/management/procurement/pr/new', 'ClipboardList', 42, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/management/srm/suppliers', 'main', 'supplychain', '供应商', '/management/srm/suppliers', 'Handshake', 43, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/management/contract/reviews/new', 'main', 'supplychain', '合同评审', '/management/contract/reviews/new', 'FileText', 44, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/management/outsourcing/factories', 'main', 'supplychain', '外协工厂（占位）', '/management/outsourcing/factories', 'Building2', 45, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('crm', 'main', NULL, '营销与客户', NULL, NULL, 20, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/business/crm/customers', 'main', 'crm', '客户', '/business/crm/customers', 'Building2', 21, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/business/crm/opportunities', 'main', 'crm', '机会', '/business/crm/opportunities', 'Target', 22, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/business/crm/contacts', 'main', 'crm', '联系人', '/business/crm/contacts', 'Users', 23, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/business/crm/activities', 'main', 'crm', '跟进记录', '/business/crm/activities', 'Activity', 24, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/business/crm/quotes', 'main', 'crm', '报价', '/business/crm/quotes', 'FileText', 25, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/business/orders', 'main', 'crm', '订单360', '/business/orders', 'ShoppingCart', 26, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/business/dashboard', 'main', 'crm', '经营驾驶舱', '/business/dashboard', 'LineChart', 27, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('production', 'main', NULL, '计划与生产', NULL, NULL, 30, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/overview', 'main', 'production', '工厂总览', '/production/overview', 'LayoutDashboard', 31, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/additional/prototypes', 'main', 'admin.additional', '多端 UI 原型', '/additional/prototypes', 'LayoutDashboard', 91, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/additional/admin', 'main', 'admin.additional', '总后台（附加）', '/additional/admin', 'BadgeCheck', 92, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/account/profile', 'main', 'admin.additional', '个人信息', '/account/profile', 'Users', 93, NULL, true, '2026-06-06 12:11:31.666961+00', '2026-06-06 12:11:31.666961+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/delivery/overview', 'main', 'quality', '交付风险总览', '/production/delivery/overview', 'LayoutDashboard', 61, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/risks', 'main', 'quality', '交付风险池', '/production/risks', 'LayoutDashboard', 62, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/alarms', 'main', 'quality', '告警中心', '/production/alarms', 'Shield', 63, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/incidents', 'main', 'quality', '异常中心', '/production/incidents', 'Activity', 64, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/mes/quality', 'main', 'quality', '检验任务', '/production/mes/quality', 'BadgeCheck', 65, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/trace', 'main', 'quality', '追溯查询', '/production/trace', 'Building2', 66, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/equipment', 'main', 'quality', '设备监控（占位）', '/production/equipment', 'Activity', 67, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/maintenance', 'main', 'quality', '维修工单', '/production/maintenance', 'Wrench', 68, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/maintenance/dashboard', 'main', 'quality', '维修看板', '/production/maintenance/dashboard', 'LineChart', 69, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('quality-equipment', 'main', NULL, '质量与设备', NULL, NULL, 60, '{}', true, '2026-06-06 15:10:51.891863+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('quality-management', 'main', 'quality-equipment', '质量管控', NULL, NULL, 1, '{}', true, '2026-06-06 15:10:51.891863+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/quality/delivery-overview', 'main', 'quality-management', '交付风险总览', '/quality/delivery-overview', 'LayoutGrid', 1, '{}', true, '2026-06-06 15:10:51.891863+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/quality/delivery-pool', 'main', 'quality-management', '交付风险池', '/quality/delivery-pool', 'LayoutList', 2, '{}', true, '2026-06-06 15:10:51.891863+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/quality/alerts', 'main', 'quality-management', '告警中心', '/quality/alerts', 'AlertOctagon', 3, '{}', true, '2026-06-06 15:10:51.891863+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/quality/exceptions', 'main', 'quality-management', '异常中心', '/quality/exceptions', 'Activity', 4, '{}', true, '2026-06-06 15:10:51.891863+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/quality/inspections', 'main', 'quality-management', '检验任务', '/quality/inspections', 'CheckCircle', 5, '{}', true, '2026-06-06 15:10:51.891863+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/quality/traceability', 'main', 'quality-management', '追溯查询', '/quality/traceability', 'Search', 6, '{}', true, '2026-06-06 15:10:51.891863+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('equipment-maintenance', 'main', 'quality-equipment', '设备运维', NULL, NULL, 2, '{}', true, '2026-06-06 15:10:51.891863+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/equipment/monitoring', 'main', 'equipment-maintenance', '设备监控（占位）', '/equipment/monitoring', 'Monitor', 1, '{}', true, '2026-06-06 15:10:51.891863+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/equipment/workorders', 'main', 'equipment-maintenance', '维修工单', '/equipment/workorders', 'Wrench', 2, '{}', true, '2026-06-06 15:10:51.891863+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/equipment/dashboard', 'main', 'equipment-maintenance', '维修看板', '/equipment/dashboard', 'LineChart', 3, '{}', true, '2026-06-06 15:10:51.891863+00', '2026-06-06 15:10:51.891863+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('procurement-supply', 'main', NULL, '采购与供应链', NULL, NULL, 70, '{}', true, '2026-06-06 15:18:42.90372+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('procurement-management', 'main', 'procurement-supply', '采购管理', NULL, NULL, 1, '{}', true, '2026-06-06 15:18:42.90372+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/supply/procurement/orders', 'main', 'procurement-management', '采购 PR/PO', '/supply/procurement/orders', 'ShoppingCart', 1, '{}', true, '2026-06-06 15:18:42.90372+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/supply/procurement/create-pr', 'main', 'procurement-management', '新增采购PR', '/supply/procurement/create-pr', 'FilePlus', 2, '{}', true, '2026-06-06 15:18:42.90372+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('supplier-collaboration', 'main', 'procurement-supply', '供应商协同', NULL, NULL, 2, '{}', true, '2026-06-06 15:18:42.90372+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/supply/suppliers/list', 'main', 'supplier-collaboration', '供应商', '/supply/suppliers/list', 'Handshake', 1, '{}', true, '2026-06-06 15:18:42.90372+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/supply/suppliers/contracts', 'main', 'supplier-collaboration', '合同评审', '/supply/suppliers/contracts', 'FileCheck', 2, '{}', true, '2026-06-06 15:18:42.90372+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/supply/suppliers/outsourcing', 'main', 'supplier-collaboration', '外协工厂（占位）', '/supply/suppliers/outsourcing', 'Factory', 3, '{}', true, '2026-06-06 15:18:42.90372+00', '2026-06-06 15:18:42.90372+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/meeting', 'main', 'production', '晨会总览', '/production/meeting', 'LayoutDashboard', 32, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/workorders', 'main', 'production', '工单', '/production/workorders', 'ClipboardList', 33, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/mes/dispatch', 'main', 'production', '派工任务', '/production/mes/dispatch', 'ClipboardList', 34, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/mes/report', 'main', 'production', '报工', '/production/mes/report', 'FileText', 35, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/schedule', 'main', 'production', '排程（占位）', '/production/schedule', 'LineChart', 36, NULL, false, '2026-06-06 12:11:31.666961+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('sales-customers', 'main', NULL, '营销与客户', NULL, NULL, 20, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('sales-crm', 'main', 'sales-customers', '客户管理', NULL, NULL, 1, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/sales/crm/customers', 'main', 'sales-crm', '客户', '/sales/crm/customers', 'Building2', 1, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/sales/crm/contacts', 'main', 'sales-crm', '联系人', '/sales/crm/contacts', 'Contact', 2, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/sales/crm/activities', 'main', 'sales-crm', '跟进记录', '/sales/crm/activities', 'History', 3, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('sales-business', 'main', 'sales-customers', '销售与订单', NULL, NULL, 2, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/sales/business/opportunities', 'main', 'sales-business', '机会', '/sales/business/opportunities', 'Target', 1, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/sales/business/quotes', 'main', 'sales-business', '报价', '/sales/business/quotes', 'FileSignature', 2, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/sales/business/order360', 'main', 'sales-business', '订单360', '/sales/business/order360', 'PackageSearch', 3, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/sales/business/dashboard', 'main', 'sales-business', '经营驾驶舱', '/sales/business/dashboard', 'BarChart4', 4, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('planning-production', 'main', NULL, '计划与生产', NULL, NULL, 30, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('production-dashboards', 'main', 'planning-production', '生产看板', NULL, NULL, 1, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/dashboards/factory', 'main', 'production-dashboards', '工厂总览', '/production/dashboards/factory', 'LayoutDashboard', 1, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/dashboards/morning-meeting', 'main', 'production-dashboards', '晨会总览', '/production/dashboards/morning-meeting', 'Presentation', 2, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('production-execution', 'main', 'planning-production', '计划与执行', NULL, NULL, 2, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/execution/scheduling', 'main', 'production-execution', '排程（占位）', '/production/execution/scheduling', 'CalendarDays', 1, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/execution/workorders', 'main', 'production-execution', '工单', '/production/execution/workorders', 'ClipboardList', 2, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/execution/dispatch', 'main', 'production-execution', '派工任务', '/production/execution/dispatch', 'UserCog', 3, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');
INSERT INTO public.menu_item (id, portal_id, parent_id, label, path, icon_name, sort_order, required_roles, enabled, created_at, updated_at) VALUES ('/production/execution/reporting', 'main', 'production-execution', '报工', '/production/execution/reporting', 'Hammer', 4, '{}', true, '2026-06-07 02:55:02.719473+00', '2026-06-07 02:55:02.719473+00');


--
-- PostgreSQL database dump complete
--

\unrestrict ha8grES0XTxhFaaXbYoNueA8DhOhxgHIdT8rncDJsrisdXh5OB4JpBavy9ISInN

COMMIT;
