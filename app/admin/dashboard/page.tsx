'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import { LogOut, Settings, CalendarX, Clock, User, Phone, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDuration } from '@/lib/utils'
import type { Booking } from '@/lib/types'
import 'react-day-picker/style.css'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [blockingDay, setBlockingDay] = useState(false)

  const loadBookings = useCallback(async (date: Date) => {
    setLoading(true)
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const res = await fetch(`/api/bookings?date=${dateStr}`)
      const json = await res.json()
      setBookings(json.bookings ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBookings(selectedDate)
  }, [selectedDate, loadBookings])

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin')
  }

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Cancelar este agendamento?')) return
    await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
    loadBookings(selectedDate)
  }

  const handleBlockDay = async () => {
    const reason = prompt('Motivo do bloqueio (opcional):') ?? ''
    setBlockingDay(true)
    try {
      await fetch('/api/admin/blocked-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocked_date: format(selectedDate, 'yyyy-MM-dd'),
          reason: reason || null,
        }),
      })
      alert('Dia bloqueado com sucesso!')
    } finally {
      setBlockingDay(false)
    }
  }

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed')
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled')

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-900">Painel — Toque de Lírio</h1>
            <p className="text-xs text-gray-400">Olá, Natielle!</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/configuracoes')}
              className="gap-1.5"
            >
              <Settings className="w-4 h-4" /> Configurações
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
              <LogOut className="w-4 h-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        {/* Calendar */}
        <div>
          <Card>
            <CardContent className="p-4 flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(startOfDay(d))}
                locale={ptBR}
                classNames={{
                  selected: 'bg-pink-600 text-white rounded-full',
                  today: 'font-bold text-pink-600',
                  day_button: 'hover:bg-pink-100 rounded-full transition-colors',
                }}
              />
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full mt-3 gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={handleBlockDay}
            disabled={blockingDay}
          >
            <CalendarX className="w-4 h-4" />
            {blockingDay ? 'Bloqueando...' : 'Bloquear este dia'}
          </Button>
        </div>

        {/* Bookings list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR }).replace(
                /^\w/,
                (c) => c.toUpperCase(),
              )}
            </h2>
            <Badge variant="default">
              {confirmedBookings.length} agendamento{confirmedBookings.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Carregando...</p>
          ) : confirmedBookings.length === 0 && cancelledBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-400 text-sm">Nenhum agendamento neste dia.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {confirmedBookings.map((b) => (
                <Card key={b.id} className="border-l-4 border-l-green-400">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="success">Confirmado</Badge>
                          <span className="text-xs text-gray-400 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {b.start_time.slice(0, 5)} – {b.end_time.slice(0, 5)}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {b.client_name}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {b.client_phone}
                        </p>
                        <p className="text-sm text-pink-700 font-medium">{b.service?.name}</p>
                        {b.service && (
                          <p className="text-xs text-gray-400">
                            {formatDuration(b.service.duration_minutes)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                        onClick={() => handleCancelBooking(b.id)}
                        title="Cancelar agendamento"
                      >
                        <XCircle className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {cancelledBookings.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Cancelados</p>
                  {cancelledBookings.map((b) => (
                    <Card key={b.id} className="opacity-50 border-dashed">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500 line-through">
                            {b.client_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {b.start_time.slice(0, 5)} — {b.service?.name}
                          </p>
                        </div>
                        <Badge variant="destructive">Cancelado</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
