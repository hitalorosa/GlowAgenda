import Link from 'next/link'
import { Clock, Sparkles, Heart, Flower2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatDuration } from '@/lib/utils'

const services = [
  {
    name: 'Spá de mão',
    duration: 15,
    icon: Sparkles,
    description: 'Hidratação e cuidado completo para suas mãos',
  },
  {
    name: 'Esmaltação normal com cuticulagem',
    duration: 90,
    icon: Heart,
    description: 'Esmalte tradicional com cuticulagem profissional',
  },
  {
    name: 'Esmaltação em gel com cuticulagem',
    duration: 120,
    icon: Flower2,
    description: 'Esmalte em gel de longa duração com cuticulagem',
  },
  {
    name: 'Cuticulagem e extensão de unha',
    duration: 180,
    icon: Sparkles,
    description: 'Extensão completa com cuticulagem especializada',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-pink-700">Toque de Lírio</h1>
            <p className="text-xs text-gray-400">by Natielle</p>
          </div>
          <Link href="/admin" className="text-xs text-gray-400 hover:text-pink-600 transition-colors">
            Área da profissional
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-pink-600 to-rose-500 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-pink-200 text-sm font-medium uppercase tracking-widest mb-3">
            Bem-vinda ao estúdio
          </p>
          <h2 className="text-4xl font-bold mb-4">
            Toque de Lírio
            <span className="block text-2xl font-normal text-pink-100 mt-1">by Natielle</span>
          </h2>
          <p className="text-pink-100 mb-8 text-lg">
            Cuidado e elegância para suas unhas. Agende agora seu horário de conforto.
          </p>
          <Link href="/agendar">
            <Button
              size="lg"
              className="bg-white text-pink-700 hover:bg-pink-50 font-bold shadow-lg px-10"
            >
              Agendar meu horário
            </Button>
          </Link>
          <p className="text-pink-200 text-sm mt-4 flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" />
            Atendimento: 16h às 20h
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-2">Nossos serviços</h3>
          <p className="text-gray-500 text-center mb-8">
            Escolha o procedimento ideal para você
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s) => {
              const Icon = s.icon
              return (
                <Card key={s.name} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{s.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">{s.description}</p>
                      <span className="text-xs font-medium text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                        {formatDuration(s.duration)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-10">
            <Link href="/agendar">
              <Button size="lg" className="px-10">
                Quero agendar agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pink-100 py-6 px-4 bg-white">
        <p className="text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Toque de Lírio by Natielle · Todos os direitos reservados
        </p>
      </footer>
    </div>
  )
}
