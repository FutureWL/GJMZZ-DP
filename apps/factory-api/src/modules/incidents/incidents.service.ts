import { Injectable } from '@nestjs/common'
import type { Incident, IncidentStatus, IncidentType, Severity } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'
import type { CreateIncidentBody, IncidentDto, UpdateIncidentBody } from './incidents.types'

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
        type: body.type as unknown as IncidentType,
        severity: body.severity as unknown as Severity,
        status: (body.status ?? 'recording') as unknown as IncidentStatus,
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
        type: body.type ? (body.type as unknown as IncidentType) : undefined,
        severity: body.severity ? (body.severity as unknown as Severity) : undefined,
        status: body.status ? (body.status as unknown as IncidentStatus) : undefined,
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

