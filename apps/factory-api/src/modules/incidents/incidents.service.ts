import { Injectable } from '@nestjs/common'
import type { Incident, Prisma } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'
import type { CreateIncidentBody, IncidentDto, IncidentListQuery, IncidentPageResult, UpdateIncidentBody } from './incidents.types'

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function formatAt(now = new Date()) {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())} ${pad2(now.getHours())}:${pad2(
    now.getMinutes(),
  )}`
}

function createId(now = new Date()) {
  const yyyy = now.getFullYear()
  const mm = pad2(now.getMonth() + 1)
  const dd = pad2(now.getDate())
  const hh = pad2(now.getHours())
  const mi = pad2(now.getMinutes())
  const ss = pad2(now.getSeconds())
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `INC-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${rand}`
}

function toDto(row: Incident): IncidentDto {
  return {
    id: row.id,
    occurredAt: row.occurredAt,
    reportedBy: row.reportedBy,
    type: row.type as unknown as IncidentDto['type'],
    severity: row.severity as unknown as IncidentDto['severity'],
    status: row.status as unknown as IncidentDto['status'],
    factoryId: row.factoryId,
    factoryName: row.factoryName,
    line: row.line ?? undefined,
    workOrderId: row.workOrderId ?? undefined,
    orderId: row.orderId ?? undefined,
    equipment: row.equipment ?? undefined,
    material: row.material ?? undefined,
    description: row.description,
    attachments: row.attachments ?? [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<IncidentDto[]> {
    const rows = await this.prisma.incident.findMany({
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    })
    return rows.map(toDto)
  }

  async listPaged(query: IncidentListQuery): Promise<IncidentPageResult> {
    const page = Number.isFinite(query.page) && (query.page as number) > 0 ? (query.page as number) : 1
    const pageSizeRaw =
      Number.isFinite(query.pageSize) && (query.pageSize as number) > 0 ? (query.pageSize as number) : 20
    const pageSize = Math.min(pageSizeRaw, 100)
    const skip = (page - 1) * pageSize

    const where: Prisma.IncidentWhereInput = {}
    if (query.factoryId) where.factoryId = query.factoryId
    if (query.type) where.type = query.type
    if (query.severity) where.severity = query.severity
    if (query.status) where.status = query.status
    if (query.occurredFrom || query.occurredTo) {
      where.occurredAt = {
        ...(query.occurredFrom ? { gte: query.occurredFrom } : {}),
        ...(query.occurredTo ? { lte: query.occurredTo } : {}),
      }
    }
    if (query.keyword) {
      const kw = query.keyword.trim()
      if (kw) {
        where.OR = [
          { id: { contains: kw, mode: 'insensitive' } },
          { factoryName: { contains: kw, mode: 'insensitive' } },
          { line: { contains: kw, mode: 'insensitive' } },
          { workOrderId: { contains: kw, mode: 'insensitive' } },
          { orderId: { contains: kw, mode: 'insensitive' } },
          { equipment: { contains: kw, mode: 'insensitive' } },
          { material: { contains: kw, mode: 'insensitive' } },
          { reportedBy: { contains: kw, mode: 'insensitive' } },
          { description: { contains: kw, mode: 'insensitive' } },
        ]
      }
    }

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.incident.count({ where }),
      this.prisma.incident.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip,
        take: pageSize,
      }),
    ])

    return { page, pageSize, total, items: rows.map(toDto) }
  }

  async getById(id: string): Promise<IncidentDto | null> {
    const row = await this.prisma.incident.findUnique({ where: { id } })
    return row ? toDto(row) : null
  }

  async create(body: CreateIncidentBody): Promise<IncidentDto> {
    const now = new Date()
    const createdAt = formatAt(now)
    const id = createId(now)

    const row = await this.prisma.incident.create({
      data: {
        id,
        occurredAt: body.occurredAt,
        reportedBy: body.reportedBy,
        type: body.type,
        severity: body.severity,
        status: body.status ?? 'recording',
        factoryId: body.factoryId,
        factoryName: body.factoryName,
        line: body.line ?? null,
        workOrderId: body.workOrderId ?? null,
        orderId: body.orderId ?? null,
        equipment: body.equipment ?? null,
        material: body.material ?? null,
        description: body.description,
        attachments: body.attachments ?? [],
        createdAt,
        updatedAt: createdAt,
      },
    })

    return toDto(row)
  }

  async update(id: string, body: UpdateIncidentBody): Promise<IncidentDto> {
    const updatedAt = formatAt()
    const row = await this.prisma.incident.update({
      where: { id },
      data: {
        occurredAt: body.occurredAt ?? undefined,
        reportedBy: body.reportedBy ?? undefined,
        type: body.type ?? undefined,
        severity: body.severity ?? undefined,
        status: body.status ?? undefined,
        factoryId: body.factoryId ?? undefined,
        factoryName: body.factoryName ?? undefined,
        line: body.line === undefined ? undefined : body.line ?? null,
        workOrderId: body.workOrderId === undefined ? undefined : body.workOrderId ?? null,
        orderId: body.orderId === undefined ? undefined : body.orderId ?? null,
        equipment: body.equipment === undefined ? undefined : body.equipment ?? null,
        material: body.material === undefined ? undefined : body.material ?? null,
        description: body.description ?? undefined,
        attachments: body.attachments ?? undefined,
        updatedAt,
      },
    })
    return toDto(row)
  }

  async archive(id: string): Promise<IncidentDto> {
    return this.update(id, { status: 'archived' })
  }
}
