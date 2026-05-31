'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DayPicker } from 'react-day-picker'
import { ptBR } from 'date-fns/locale'
import { format, addDays, startOfDay } from 'date-fns'
import { ArrowLeft, ArrowRight, Clock, Check, Copy, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDuration } from '@/lib/utils'
import type { Service } from '@/lib/types'
import 'react-day-picker/style.css'

// Serviços temporários até integração com Supabase
const MOCK_SERVICES: Service[] = [
  { id: '1', name: 'Spá de mão', duration_minutes: 15 },
  { id: '2', name: 'Esmaltação normal com cuticulagem', duration_minutes: 90 },
  { id: '3', name: 'Esmaltação em gel com cuticulagem', duration_minutes: 120 },
  { id: '4', name: 'Cuticulagem e extensão de unha', duration_minutes: 180 },
]

type Step = 1 | 2 | 3

interface BookingData {
  service: Service | null
  date: Date | null
  time: string | null
  clientName: string
  clientPhone: string
}

export default function AgendarPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const services = MOCK_SERVICES
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [cancelToken, setCancelToken] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [copied, setCopied] = useState(false)

  const [data, setData] = useState<BookingData>({
    service: null,
    date: null,
    time: null,
    clientName: '',
    clientPhone: '',
  })

  const loadSlots = useCallback(async (service: Service, date: Date) => {
    setLoadingSlots(true)
    setAvailableSlots([])
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const res = await fetch(`/api/availability?date=${dateStr}&service_id=${service.id}`)
      const json = await res.json()
      setAvailableSlots(json.slots ?? [])
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  useEffect(() => {
    if (data.service && data.date) {
      loadSlots(data.service, data.date)
    }
  }, [data.service, data.date, loadSlots])

  const selectService = (service: Service) => {
    setData((d) => ({ ...d, service, date: null, time: null }))
    setStep(2)
  }

  const selectDate = (date: Date | undefined) => {
    if (!date) return
    setData((d) => ({ ...d, date, time: null }))
  }

  const selectTime = (time: string) => {
    setData((d) => ({ ...d, time }))
  }

  const handleSubmit = async () => {
    if (!data.service || !data.date || !data.time || !data.clientName || !data.clientPhone) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: data.clientName,
          client_phone: data.clientPhone,
          service_id: data.service.id,
          booking_date: format(data.date, 'yyyy-MM-dd'),
          start_time: data.time,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Erro ao agendar. Tente novamente.')
        return
      }
      setCancelToken(json.booking.cancel_token)
      setConfirmed(true)
    } finally {
      setSubmitting(false)
    }
  }

  const cancelLink = cancelToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/cancelar/${cancelToken}`
    : ''

  const copyLink = () => {
    navigator.clipboard.writeText(cancelLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const today = startOfDay(new Date())
  const maxDate = addDays(today, 30)

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-pink-50">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendado!</h2>
            <p className="text-gray-500 mb-6">
              Seu horário foi confirmado com sucesso. Até lá! 💅
            </p>

            <div className="bg-pink-50 rounded-xl p-4 text-left mb-6 space-y-2">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Serviço:</span>{' '}
                <span className="text-gray-600">{data.service?.name}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Data:</span>{' '}
                <span className="text-gray-600">
                  {data.date ? format(data.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Horário:</span>{' '}
                <span className="text-gray-600">{data.time}h</span>
              </p>
            </div>

            <div className="border border-pink-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 mb-2">
                Guarde este link para cancelar se precisar:
              </p>
              <p className="text-xs text-pink-600 break-all mb-3">{cancelLink}</p>
              <Button variant="outline" size="sm" onClick={copyLink} className="w-full gap-2">
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copiado!' : 'Copiar link'}
              </Button>
            </div>

            <Button variant="ghost" className="w-full" onClick={() => router.push('/')}>
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-pink-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => (step === 1 ? router.push('/') : setStep((s) => (s - 1) as Step))}
            className="text-gray-400 hover:text-pink-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900">Agendar horário</h1>
            <p className="text-xs text-gray-400">Toque de Lírio by Natielle</p>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-pink-100">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {([1, 2, 3] as Step[]).map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  step >= s ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                <span className={`text-xs hidden sm:block ${step >= s ? 'text-pink-700 font-medium' : 'text-gray-400'}`}>
                  {s === 1 ? 'Serviço' : s === 2 ? 'Data e hora' : 'Seus dados'}
                </span>
                {s < 3 && <div className={`h-0.5 flex-1 ${step > s ? 'bg-pink-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Step 1: Service */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Escolha o serviço</h2>
            <p className="text-gray-500 text-sm mb-5">Selecione o procedimento desejado</p>
            <div className="space-y-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectService(s)}
                  className="w-full text-left"
                >
                  <Card className={`cursor-pointer hover:border-pink-400 hover:shadow-md transition-all ${
                    data.service?.id === s.id ? 'border-pink-500 ring-2 ring-pink-200' : ''
                  }`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{s.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(s.duration_minutes)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-pink-400" />
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Escolha a data e horário</h2>
            <p className="text-gray-500 text-sm mb-5">
              Serviço: <strong className="text-pink-700">{data.service?.name}</strong>
            </p>

            <Card className="mb-4">
              <CardContent className="p-4 flex justify-center">
                <DayPicker
                  mode="single"
                  selected={data.date ?? undefined}
                  onSelect={selectDate}
                  locale={ptBR}
                  disabled={[
                    { before: today },
                    { after: maxDate },
                  ]}
                  classNames={{
                    selected: 'bg-pink-600 text-white rounded-full',
                    today: 'font-bold text-pink-600',
                    day_button: 'hover:bg-pink-100 rounded-full transition-colors',
                  }}
                />
              </CardContent>
            </Card>

            {data.date && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Horários disponíveis —{' '}
                    {format(data.date, "dd 'de' MMMM", { locale: ptBR })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingSlots ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Verificando disponibilidade...
                    </p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Nenhum horário disponível neste dia. Escolha outra data.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => selectTime(slot)}
                          className={`py-2.5 rounded-lg text-sm font-medium border transition-all ${
                            data.time === slot
                              ? 'bg-pink-600 text-white border-pink-600'
                              : 'border-pink-200 text-pink-700 hover:bg-pink-50'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!data.date || !data.time}
                className="gap-2"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Personal info */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Seus dados</h2>
            <p className="text-gray-500 text-sm mb-5">Preencha para confirmar o agendamento</p>

            {/* Summary */}
            <Card className="mb-5 bg-pink-50 border-pink-200">
              <CardContent className="p-4 space-y-1.5">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Serviço:</span>{' '}
                  <span className="text-gray-600">{data.service?.name}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Data:</span>{' '}
                  <span className="text-gray-600">
                    {data.date
                      ? format(data.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : ''}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Horário:</span>{' '}
                  <span className="text-gray-600">{data.time}h</span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Seu nome</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Maria Silva"
                    value={data.clientName}
                    onChange={(e) => setData((d) => ({ ...d, clientName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">WhatsApp / Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="Ex: (11) 99999-9999"
                    value={data.clientPhone}
                    onChange={(e) => setData((d) => ({ ...d, clientPhone: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!data.clientName || !data.clientPhone || submitting}
                className="gap-2"
              >
                {submitting ? 'Confirmando...' : 'Confirmar agendamento'}
                {!submitting && <Check className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
