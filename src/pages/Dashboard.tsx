"use client"

import { useAuthStore } from "@/store/useAuthStore"
import Layout from "../components/Layout/Layout"
import { Link } from "react-router-dom"
import { Mic, BookOpen, Trophy, Calendar, User } from "lucide-react"
import { scheduleDay1, scheduleDay2, scheduleDay3, MinicursosData } from "../data/scheduleData"

const Dashboard = () => {
  // Usuário de demonstração do Zustand
  const user = useAuthStore((state) => state.user)

  // Exemplo de eventos inscritos (mock)
  const eventosInscritos = [
    {
      id: "1",
      evento_tipo: "Palestra",
      evento_nome: scheduleDay1[2].activity,
      created_at: "2025-06-12T10:00:00Z"
    },
    {
      id: "2",
      evento_tipo: "Minicurso",
      evento_nome: MinicursosData[0].title,
      created_at: "2025-06-12T14:00:00Z"
    },
    {
      id: "3",
      evento_tipo: "Torneio de Jogos",
      evento_nome: scheduleDay3[0].activity,
      created_at: "2025-06-14T08:00:00Z"
    }
  ]

  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case "Palestra":
        return <Mic className="w-5 h-5 text-blue-600" />
      case "Minicurso":
        return <BookOpen className="w-5 h-5 text-green-600" />
      case "Torneio de Jogos":
        return <Trophy className="w-5 h-5 text-purple-600" />
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />
    }
  }

  const getEventColor = (tipo: string) => {
    switch (tipo) {
      case "Palestra":
        return "bg-blue-50 border-blue-200"
      case "Minicurso":
        return "bg-green-50 border-green-200"
      case "Torneio de Jogos":
        return "bg-purple-50 border-purple-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
            <p className="text-gray-600 mb-6">Você precisa estar logado para acessar esta página.</p>
            <Link
              to="/login"
              className="bg-event-blue text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header de Boas-vindas */}
        <div className="bg-gradient-to-r from-event-blue to-event-purple text-white rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Olá, {user.nome}! 👋</h1>
              <p className="text-white/90 mt-1">Bem-vindo(a) à V Semana da Computação do IFMA</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Seus Dados</h2>
              <ul className="text-gray-700 space-y-2">
                <li><strong>Nome:</strong> {user.nome}</li>
                <li><strong>Email:</strong> {user.email}</li>
                <li><strong>Email verificado:</strong> {user.emailVerificado ? "Sim" : "Não"}</li>
              </ul>
              <div className="mt-6">
                <Link
                  to="/inscricao-eventos"
                  className="bg-event-blue hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors font-medium"
                >
                  Ir para Inscrição de Eventos
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Eventos Inscritos</h2>
              <ul className="space-y-4">
                {eventosInscritos.map((evento) => (
                  <li key={evento.id} className={`flex items-center border rounded-md p-4 ${getEventColor(evento.evento_tipo)}`}>
                    <div className="mr-4">{getEventIcon(evento.evento_tipo)}</div>
                    <div>
                      <div className="font-medium text-gray-900">{evento.evento_nome}</div>
                      <div className="text-sm text-gray-600">{evento.evento_tipo}</div>
                      <div className="text-xs text-gray-500">Inscrito em: {new Date(evento.created_at).toLocaleString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coluna lateral (pode adicionar mais informações se quiser) */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Sobre o Evento</h2>
              <p className="text-gray-700 mb-2">A V Semana da Computação do IFMA reúne palestras, oficinas e torneios para todos os públicos. Confira a programação completa!</p>
              <Link to="/programacao" className="text-event-blue hover:underline font-medium">Ver programação</Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
