"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout/Layout"
import { toast } from "sonner"
import supabase from "../lib/supabaseClient"
import emailjs from "@emailjs/browser"
import SelectableEventBlocks from "../components/Registration/SelectableEventBlocks"
import { useAuthStore } from "@/store/useAuthStore"
import { Calendar, Clock, Users, CheckCircle, AlertCircle, Mail } from "lucide-react"

// Definindo os dados iniciais do formulário
const initialFormData = {
  participacao: [] as string[],
  selectedEvents: [] as string[],
}

// formatar Eventos por tipo
const formatarEventosPorTipo = (eventos: string[]) => {
  const grupos: { [key: string]: string[] } = {}

  eventos.forEach((evento) => {
    const [tipo, nome] = evento.split(":")
    if (!grupos[tipo]) grupos[tipo] = []
    grupos[tipo].push(nome)
  })

  const emojiPorTipo: { [key: string]: string } = {
    Palestra: "📢",
    Minicurso: "📚",
    "Torneio de Jogos": "🎮",
  }

  return Object.entries(grupos)
    .map(([tipo, nomes]) => {
      const emoji = emojiPorTipo[tipo] || ""
      return `${emoji} ${tipo}:\n- ${nomes.join("\n- ")}`
    })
    .join("\n\n")
}

//Função para enviar e-mail de confirmação
const enviarEmailConfirmacao = async (userData: { nome: string; email: string }, formData: typeof initialFormData) => {
  const eventosFormatados = formatarEventosPorTipo(formData.selectedEvents)
  try {
    await emailjs.send(
      "service_s1ntpji",
      "template_4usyhrl",
      {
        nome: userData.nome,
        email: userData.email,
        participacoes: formData.participacao.join(", "),
        eventos: eventosFormatados,
      },
      "xHH8xpl3eqs0e9JmY",
    )
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error)
  }
}

// Componente principal da página de inscrição em eventos
const InscricaoEventos = () => {
  const [formData, setFormData] = useState(initialFormData)
  const [showEventsFor, setShowEventsFor] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  interface InscricaoEvento {
    id?: number
    usuario_id: string
    participacao: string[]
    eventos: string[]
    updated_at?: string
  }
  
    const [existingInscricao, setExistingInscricao] = useState<InscricaoEvento | null>(null)
  const userData = useAuthStore((state) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (!userData) {
      toast.error("Você precisa estar logado para se inscrever em eventos")
      navigate("/login")
      return
    }

    // Carregar inscrição existente
    loadExistingInscricao()
  }, [userData, navigate])

  const loadExistingInscricao = async () => {
    if (!userData) return

    const { data } = await supabase.from("inscricoes_eventos").select("*").eq("usuario_id", userData.id).single()

    if (data) {
      setExistingInscricao(data)
      setFormData({
        participacao: data.participacao || [],
        selectedEvents: data.eventos || [],
      })
      setShowEventsFor(data.participacao || [])
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target

    setFormData((prev) => {
      if (checked) {
        return { ...prev, participacao: [...prev.participacao, value] }
      } else {
        return {
          ...prev,
          participacao: prev.participacao.filter((item) => item !== value),
        }
      }
    })

    setShowEventsFor((prev) => {
      if (checked) {
        return [...prev, value]
      } else {
        return prev.filter((item) => item !== value)
      }
    })
  }

  // Função para lidar com a seleção de eventos
  const handleEventSelection = useCallback((eventType: string, selectedItems: string[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedEvents: [
        ...prev.selectedEvents.filter((event) => {
          const eventTypePrefix = event.split(":")[0]
          return eventTypePrefix !== eventType
        }),
        ...selectedItems.map((item) => `${eventType}:${item}`),
      ],
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!userData) {
      toast.error("Erro: usuário não encontrado")
      setIsSubmitting(false)
      return
    }

    const hasSelectedParticipation = formData.participacao.length > 0
    const hasSelectedEvents = formData.selectedEvents.length > 0

    if (!hasSelectedParticipation || !hasSelectedEvents) {
      toast.error("Por favor, selecione pelo menos um tipo de participação e um evento")
      setIsSubmitting(false)
      return
    }

    try {
      if (existingInscricao) {
        // Atualizar inscrição existente
        const { error } = await supabase
          .from("inscricoes_eventos")
          .update({
            participacao: formData.participacao,
            eventos: formData.selectedEvents,
            updated_at: new Date().toISOString(),
          })
          .eq("usuario_id", userData.id)

        if (error) throw error
        toast.success("Inscrição atualizada com sucesso!")
      } else {
        // Criar nova inscrição
        const { error } = await supabase.from("inscricoes_eventos").insert([
          {
            usuario_id: userData.id,
            participacao: formData.participacao,
            eventos: formData.selectedEvents,
          },
        ])

        if (error) throw error
        toast.success("Inscrição realizada com sucesso!")
      }

      // Enviar e-mail de confirmação
      await enviarEmailConfirmacao(userData, formData)
      toast.success("E-mail de confirmação enviado!", { duration: 3000 })

      // Recarregar dados
      await loadExistingInscricao()
    } catch (error) {
      console.error("Erro:", error)
      toast.error("Erro ao processar inscrição. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Funções para lidar com a seleção de eventos
  const handlePalestraChange = useCallback(
    (selected: string[]) => {
      handleEventSelection("Palestra", selected)
    },
    [handleEventSelection],
  )

  const handleMinicursoChange = useCallback(
    (selected: string[]) => {
      handleEventSelection("Minicurso", selected)
    },
    [handleEventSelection],
  )

  const handleTorneioChange = useCallback(
    (selected: string[]) => {
      handleEventSelection("Torneio de Jogos", selected)
    },
    [handleEventSelection],
  )

  if (!userData) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169E1]"></div>
        </div>
      </Layout>
    )
  }

  const getEventCount = (type: string) => {
    return formData.selectedEvents.filter((event) => event.startsWith(type + ":")).length
  }

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Inscrição em Eventos</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Selecione os eventos que deseja participar durante a Semana da Computação
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Card de Boas-vindas */}
            <div className="bg-gradient-to-r from-[#4169E1] to-[#8052EC] rounded-xl p-6 mb-8 text-white shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-3">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Bem-vindo(a), {userData.nome}!</h2>
                  <p className="text-white/90">
                    {existingInscricao ? "Atualize sua inscrição nos eventos" : "Faça sua inscrição nos eventos"}
                  </p>
                </div>
              </div>

              {existingInscricao && (
                <div className="mt-4 flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Você já possui uma inscrição ativa</span>
                </div>
              )}
            </div>

            {/* Resumo da Inscrição */}
            {formData.selectedEvents.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Resumo da Inscrição
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.participacao.includes("Palestra") && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">Palestras</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {getEventCount("Palestra")} selecionadas
                        </span>
                      </div>
                    </div>
                  )}
                  {formData.participacao.includes("Minicurso") && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-800">Minicursos</span>
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          {getEventCount("Minicurso")} selecionados
                        </span>
                      </div>
                    </div>
                  )}
                  {formData.participacao.includes("Torneio de Jogos") && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Torneios</span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {getEventCount("Torneio de Jogos")} selecionados
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Formulário */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <form onSubmit={handleSubmit} className="space-y-0">
                {/* Seção de Participação */}
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 text-[#4169E1] mr-2" />
                    Tipos de Participação
                  </h3>
                  <p className="text-gray-600 mb-6">Selecione os tipos de eventos que deseja participar:</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: "Palestra", label: "Palestras", icon: "📢", desc: "Apresentações e talks" },
                      { id: "Minicurso", label: "Minicursos", icon: "📚", desc: "Workshops práticos" },
                      { id: "Torneio de Jogos", label: "Torneios", icon: "🎮", desc: "Competições de jogos" },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                          formData.participacao.includes(item.id)
                            ? "border-[#4169E1] bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={item.id}
                          checked={formData.participacao.includes(item.id)}
                          onChange={handleCheckboxChange}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-500">{item.desc}</div>
                          </div>
                        </div>
                        {formData.participacao.includes(item.id) && (
                          <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-[#4169E1]" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Seleção de Eventos */}
                <div className="p-6 space-y-8">
                  {showEventsFor.includes("Palestra") && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        📢 <span className="ml-2">Palestras Disponíveis</span>
                      </h4>
                      <SelectableEventBlocks eventType="Palestra" onChange={handlePalestraChange} />
                    </div>
                  )}

                  {showEventsFor.includes("Minicurso") && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        📚 <span className="ml-2">Minicursos Disponíveis</span>
                      </h4>
                      <SelectableEventBlocks eventType="Minicurso" onChange={handleMinicursoChange} />
                    </div>
                  )}

                  {showEventsFor.includes("Torneio de Jogos") && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        🎮 <span className="ml-2">Torneios Disponíveis</span>
                      </h4>
                      <SelectableEventBlocks eventType="Torneio de Jogos" onChange={handleTorneioChange} />
                    </div>
                  )}

                  {formData.participacao.length === 0 && (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um tipo de participação</h3>
                      <p className="text-gray-500">
                        Escolha pelo menos um tipo de evento para ver as opções disponíveis
                      </p>
                    </div>
                  )}
                </div>

                {/* Botão de Submissão */}
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={
                      isSubmitting || formData.participacao.length === 0 || formData.selectedEvents.length === 0
                    }
                    className="w-full bg-[#4169E1] hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-4 rounded-lg transition-colors font-medium text-lg flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-5 w-5" />
                        <span>{existingInscricao ? "Atualizar Inscrição" : "Confirmar Inscrição"}</span>
                      </>
                    )}
                  </button>

                  {(formData.participacao.length === 0 || formData.selectedEvents.length === 0) && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Selecione pelo menos um tipo de participação e um evento para continuar
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Informações Adicionais */}
            <div className="mt-8 bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Informações Importantes
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Você receberá um e-mail de confirmação após a inscrição
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>É possível alterar sua inscrição até o início do evento
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Verifique os horários para evitar conflitos entre eventos
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  Algumas atividades podem ter vagas limitadas
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default InscricaoEventos
