INSERT INTO public.factory (code, name)
VALUES ('F001', '示例工厂')
ON CONFLICT (code) DO NOTHING;

WITH f AS (
  SELECT id FROM public.factory WHERE code = 'F001'
)
INSERT INTO public.workshop (factory_id, code, name)
SELECT f.id, 'W001', '一车间'
FROM f
ON CONFLICT (factory_id, code) DO NOTHING;

WITH w AS (
  SELECT w.id
  FROM public.workshop w
  JOIN public.factory f ON f.id = w.factory_id
  WHERE f.code = 'F001' AND w.code = 'W001'
)
INSERT INTO public.production_line (workshop_id, code, name)
SELECT w.id, 'L001', '一号产线'
FROM w
ON CONFLICT (workshop_id, code) DO NOTHING;

WITH l AS (
  SELECT l.id
  FROM public.production_line l
  JOIN public.workshop w ON w.id = l.workshop_id
  JOIN public.factory f ON f.id = w.factory_id
  WHERE f.code = 'F001' AND w.code = 'W001' AND l.code = 'L001'
)
INSERT INTO public.equipment (production_line_id, code, name, model, vendor)
SELECT l.id, 'EQ001', '示例设备 1', 'MODEL-X', 'VENDOR-A'
FROM l
ON CONFLICT (production_line_id, code) DO NOTHING;

INSERT INTO public.app_user (username, display_name)
VALUES ('admin', '管理员')
ON CONFLICT (username) DO NOTHING;

