'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertTriangle, Check, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDuration } from '@/lib/utils'
import type { Booking } from '@/lib/types'

export default function CancelarPage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/bookings/${token}`)
      .then((r) => r.json())
      .then((d) => {
        setBooking(d.booking)
        if (d.booking?.status === 'cancelled') setCancelled(true)
      })
      .catch(() => setError('Agendamento não encontrado.'))
      .finally(() => setLoading(false))
  }, [token])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const res = await fetch(`/api/bookings/${token}`, { method: 'DELETE' })
      if (res.ok) {
        setCancelled(true)
      } else {
        const json = await res.json()
        setError(json.error ?? 'Erro ao cancelar.')
      }
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <p className="text-gray-400">Carregando...</p>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Agendamento não encontrado</h2>
            <p className="text-gray-500 mb-6">
              O link pode estar incorreto ou o agendamento já foi removido.
            </p>
            <Button variant="outline" onClick={() => router.push('/')}>
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Agendamento cancelado</h2>
            <p className="text-gray-500 mb-6">
              Seu agendamento foi cancelado com sucesso. O horário está liberado.
            </p>
            <Button onClick={() => router.push('/agendar')}>Fazer novo agendamento</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const dateFormatted = format(
    new Date(booking.booking_date + 'T00:00:00'),
    "EEEE, dd 'de' MMMM 'de' yyyy",
    { locale: ptBR },
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Cancelar agendamento</h2>
          <p className="text-gray-500 text-sm mb-6">
            Tem certeza que deseja cancelar o horário abaixo?
          </p>

          <div className="bg-pink-50 rounded-xl p-4 mb-6 space-y-2">
            <p className="text-sm">
              <span className="font-medium text-gray-700">Nome:</span>{' '}
              <span className="text-gray-600">{booking.client_name}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-700">Serviço:</span>{' '}
              <span className="text-gray-600">{booking.service?.name}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-700">Data:</span>{' '}
              <span className="text-gray-600 capitalize">{dateFormatted}</span>
            </p>
            <p className="text-sm flex items-center gap-1">
              <span className="font-medium text-gray-700">Horário:</span>{' '}
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-600">
                {booking.start_time.slice(0, 5)} às {booking.end_time.slice(0, 5)}
              </span>
            </p>
            {booking.service && (
              <p className="text-sm">
                <span className="font-medium text-gray-700">Duração:</span>{' '}
                <span className="text-gray-600">
                  {formatDuration(booking.service.duration_minutes)}
                </span>
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full"
            >
              {cancelling ? 'Cancelando...' : 'Sim, cancelar meu agendamento'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/')} className="w-full">
              Não, manter agendamento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
