import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Put } from '@nestjs/common'

import type { CreateIncidentBody, IncidentDto, IncidentStatus, IncidentType, Severity, UpdateIncidentBody } from './incidents.types'
import { IncidentsService } from './incidents.service'

const TYPE_SET: ReadonlySet<IncidentType> = new Set(['quality', 'equipment', 'material_shortage', 'plan', 'safety', 'other'])
const SEVERITY_SET: ReadonlySet<Severity> = new Set(['critical', 'high', 'medium', 'low'])
const STATUS_SET: ReadonlySet<IncidentStatus> = new Set(['recording', 'archived'])

function asNonEmptyString(v: unknown, field: string) {
  if (typeof v !== 'string' || v.trim().length === 0) {
    throw new BadRequestException(`${field} is required`)
  }
  return v.trim()
}

function asOptionalString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t.length ? t : undefined
}

function asStringArray(v: unknown, field: string): string[] {
  if (v === undefined) return []
  if (!Array.isArray(v)) {
    throw new BadRequestException(`${field} must be string[]`)
  }
  const arr = v.filter((x): x is string => typeof x === 'string').map((x) => x.trim()).filter(Boolean)
  return arr
}

function parseType(v: unknown): IncidentType {
  if (typeof v !== 'string' || !TYPE_SET.has(v as IncidentType)) {
    throw new BadRequestException('type is invalid')
  }
  return v as IncidentType
}

function parseSeverity(v: unknown): Severity {
  if (typeof v !== 'string' || !SEVERITY_SET.has(v as Severity)) {
    throw new BadRequestException('severity is invalid')
  }
  return v as Severity
}

function parseStatus(v: unknown): IncidentStatus {
  if (typeof v !== 'string' || !STATUS_SET.has(v as IncidentStatus)) {
    throw new BadRequestException('status is invalid')
  }
  return v as IncidentStatus
}

function parseCreateBody(body: unknown): CreateIncidentBody {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('Invalid body')
  }
  const b = body as Record<string, unknown>
  return {
    occurredAt: asNonEmptyString(b.occurredAt, 'occurredAt'),
    reportedBy: asNonEmptyString(b.reportedBy, 'reportedBy'),
    type: parseType(b.type),
    severity: parseSeverity(b.severity),
    status: b.status === undefined ? undefined : parseStatus(b.status),
    factoryId: asNonEmptyString(b.factoryId, 'factoryId'),
    factoryName: asNonEmptyString(b.factoryName, 'factoryName'),
    line: asOptionalString(b.line),
    workOrderId: asOptionalString(b.workOrderId),
    orderId: asOptionalString(b.orderId),
    equipment: asOptionalString(b.equipment),
    material: asOptionalString(b.material),
    description: asNonEmptyString(b.description, 'description'),
    attachments: asStringArray(b.attachments, 'attachments'),
  }
}

function parseUpdateBody(body: unknown): UpdateIncidentBody {
  if (!body || typeof body !== 'object') {
    throw new BadRequestException('Invalid body')
  }
  const b = body as Record<string, unknown>
  const next: UpdateIncidentBody = {}
  if (b.occurredAt !== undefined) next.occurredAt = asNonEmptyString(b.occurredAt, 'occurredAt')
  if (b.reportedBy !== undefined) next.reportedBy = asNonEmptyString(b.reportedBy, 'reportedBy')
  if (b.type !== undefined) next.type = parseType(b.type)
  if (b.severity !== undefined) next.severity = parseSeverity(b.severity)
  if (b.status !== undefined) next.status = parseStatus(b.status)
  if (b.factoryId !== undefined) next.factoryId = asNonEmptyString(b.factoryId, 'factoryId')
  if (b.factoryName !== undefined) next.factoryName = asNonEmptyString(b.factoryName, 'factoryName')
  if (b.line !== undefined) next.line = asOptionalString(b.line)
  if (b.workOrderId !== undefined) next.workOrderId = asOptionalString(b.workOrderId)
  if (b.orderId !== undefined) next.orderId = asOptionalString(b.orderId)
  if (b.equipment !== undefined) next.equipment = asOptionalString(b.equipment)
  if (b.material !== undefined) next.material = asOptionalString(b.material)
  if (b.description !== undefined) next.description = asNonEmptyString(b.description, 'description')
  if (b.attachments !== undefined) next.attachments = asStringArray(b.attachments, 'attachments')
  return next
}

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidents: IncidentsService) {}

  @Get()
  async list(): Promise<IncidentDto[]> {
    return this.incidents.list()
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<IncidentDto> {
    const row = await this.incidents.getById(id)
    if (!row) {
      throw new NotFoundException('Incident not found')
    }
    return row
  }

  @Post()
  async create(@Body() body: unknown): Promise<IncidentDto> {
    const parsed = parseCreateBody(body)
    return this.incidents.create(parsed)
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: unknown): Promise<IncidentDto> {
    const parsed = parseUpdateBody(body)
    return this.incidents.update(id, parsed)
  }

  @Post(':id/archive')
  async archive(@Param('id') id: string): Promise<IncidentDto> {
    return this.incidents.archive(id)
  }
}
