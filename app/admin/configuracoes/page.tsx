'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft, Trash2, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DAY_NAMES } from '@/lib/utils'
import type { WorkingDay, BlockedSlot } from '@/lib/types'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [loadingDays, setLoadingDays] = useState(true)
  const [loadingBlocked, setLoadingBlocked] = useState(true)

  const [blockDate, setBlockDate] = useState('')
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [blockingAll, setBlockingAll] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/working-days')
      .then((r) => r.json())
      .then((d) => setWorkingDays(d.working_days ?? []))
      .finally(() => setLoadingDays(false))

    fetch('/api/admin/blocked-slots')
      .then((r) => r.json())
      .then((d) => setBlockedSlots(d.blocked_slots ?? []))
      .finally(() => setLoadingBlocked(false))
  }, [])

  const toggleDay = async (day: WorkingDay) => {
    const updated = !day.is_active
    setWorkingDays((prev) =>
      prev.map((d) => (d.day_of_week === day.day_of_week ? { ...d, is_active: updated } : d)),
    )
    await fetch('/api/admin/working-days', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_of_week: day.day_of_week, is_active: updated }),
    })
  }

  const addBlock = async () => {
    if (!blockDate) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/blocked-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocked_date: blockDate,
          start_time: blockingAll ? null : blockStart || null,
          end_time: blockingAll ? null : blockEnd || null,
          reason: blockReason || null,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setBlockedSlots((prev) => [...prev, json.blocked_slot])
        setBlockDate('')
        setBlockStart('')
        setBlockEnd('')
        setBlockReason('')
      }
    } finally {
      setSaving(false)
    }
  }

  const removeBlock = async (id: string) => {
    await fetch(`/api/admin/blocked-slots/${id}`, { method: 'DELETE' })
    setBlockedSlots((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <header className="bg-white border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-gray-400 hover:text-pink-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900">Configurações</h1>
            <p className="text-xs text-gray-400">Toque de Lírio by Natielle</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Working days */}
        <Card>
          <CardHeader>
            <CardTitle>Dias de atendimento</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDays ? (
              <p className="text-sm text-gray-400">Carregando...</p>
            ) : (
              <div className="space-y-2">
                {workingDays.map((day) => (
                  <div
                    key={day.day_of_week}
                    className="flex items-center justify-between py-2 border-b border-pink-50 last:border-0"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {DAY_NAMES[day.day_of_week]}
                    </span>
                    <button
                      onClick={() => toggleDay(day)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        day.is_active ? 'bg-pink-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          day.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Block a date */}
        <Card>
          <CardHeader>
            <CardTitle>Bloquear data ou horário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBlockingAll(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  blockingAll
                    ? 'bg-pink-600 text-white border-pink-600'
                    : 'border-pink-200 text-pink-700 hover:bg-pink-50'
                }`}
              >
                Dia inteiro
              </button>
              <button
                onClick={() => setBlockingAll(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                  !blockingAll
                    ? 'bg-pink-600 text-white border-pink-600'
                    : 'border-pink-200 text-pink-700 hover:bg-pink-50'
                }`}
              >
                Horário específico
              </button>
            </div>

            {!blockingAll && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Início</Label>
                  <Input type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Fim</Label>
                  <Input type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Motivo (opcional)</Label>
              <Input
                placeholder="Ex: Feriado, compromisso pessoal..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>

            <Button onClick={addBlock} disabled={!blockDate || saving} className="w-full gap-2">
              <PlusCircle className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Adicionar bloqueio'}
            </Button>
          </CardContent>
        </Card>

        {/* Existing blocks */}
        <Card>
          <CardHeader>
            <CardTitle>Bloqueios ativos</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBlocked ? (
              <p className="text-sm text-gray-400">Carregando...</p>
            ) : blockedSlots.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum bloqueio cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {blockedSlots.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(b.blocked_date + 'T00:00:00'), 'dd/MM/yyyy')}
                        {b.start_time && b.end_time
                          ? ` — ${b.start_time.slice(0, 5)} às ${b.end_time.slice(0, 5)}`
                          : ' — Dia inteiro'}
                      </p>
                      {b.reason && <p className="text-xs text-gray-500 mt-0.5">{b.reason}</p>}
                    </div>
                    <button
                      onClick={() => removeBlock(b.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
