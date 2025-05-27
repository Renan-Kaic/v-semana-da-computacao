"use client"

import { useState, useEffect } from "react"
import { MinicursosData, lecturesData } from "../../data/scheduleData"
import { hasConflict } from "../../utils/timeConflicts"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Clock, MapPin, Users, AlertTriangle, CheckCircle2 } from "lucide-react"

// Define os tipos de eventos que podem ser selecionados
interface SelectableEventProps {
  eventType: string
  onChange: (selectedItems: string[]) => void
  selectedEvents?: string[]
}

// Extrai apenas a parte da data no formato "DD/MM/AA" da string "Dia X-DD/MM/AA"
const normalizeDate = (dayString: string) => {
  const match = dayString.match(/\d{2}\/\d{2}\/\d{2}/)
  return match ? match[0] : dayString
}

// Componente que renderiza blocos de eventos selecionáveis, como palestras, minicursos e torneios de jogos
const SelectableEventBlocks = ({ eventType, onChange, selectedEvents = [] }: SelectableEventProps) => {
  const [selected, setSelected] = useState<string[]>(selectedEvents)

  const games = ["Naruto", "Mortal Kombat", "FIFA", "Mario Kart"]

  const getEventData = () => {
    switch (eventType) {
      case "Palestra":
        return lecturesData
      case "Minicurso":
        return MinicursosData
      case "Torneio de Jogos":
        return games.map((game) => ({ title: game }))
      default:
        return []
    }
  }

  // Verifica se há conflito de horário entre os eventos selecionados
  const checkTimeConflict = (eventTitle: string) => {
    if (eventType === "Torneio de Jogos") return false

    const currentEvent =
      lecturesData.find((e) => e.title === eventTitle) || MinicursosData.find((e) => e.title === eventTitle)

    if (!currentEvent?.day || !currentEvent?.time) return false

    const currentSlot = {
      date: normalizeDate(currentEvent.day),
      time: currentEvent.time,
    }

    for (const selectedTitle of selected) {
      if (selectedTitle === eventTitle) continue

      const selectedEvent =
        lecturesData.find((e) => e.title === selectedTitle) || MinicursosData.find((e) => e.title === selectedTitle)
      if (selectedEvent?.day && selectedEvent?.time) {
        const selectedSlot = {
          date: normalizeDate(selectedEvent.day),
          time: selectedEvent.time,
        }

        if (hasConflict(currentSlot, selectedSlot)) {
          return true
        }
      }
    }

    return false
  }

  // Manipula o evento de seleção/deseleção de um evento
  const handleToggleEvent = (eventName: string) => {
    if (selected.includes(eventName)) {
      setSelected((prev) => prev.filter((e) => e !== eventName))
      return
    }

    if (checkTimeConflict(eventName)) {
      toast.error("Conflito de horário!", {
        description: "Este evento conflita com outro já selecionado.",
      })
      return
    }

    setSelected((prev) => [...prev, eventName])
  }

  useEffect(() => {
    onChange(selected)
  }, [selected, onChange])

  const events = getEventData()

  if (events.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event, index) => {
          const title = "title" in event ? event.title : ""
          const time = "time" in event ? event.time : ""
          const day = "day" in event ? event.day : ""
          const location = "location" in event ? event.location : ""

          const hasTimeConflict = checkTimeConflict(title)
          const isFull = "isFull" in event ? event.isFull : false
          const loading = "loading" in event ? event.loading : false
          const isSelected = selected.includes(title)

          const eventCard = (
            <div
              key={index}
              onClick={() => !hasTimeConflict && !isFull && !loading && handleToggleEvent(title)}
              className={`relative group cursor-pointer rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                hasTimeConflict
                  ? "bg-red-50 border-red-200 cursor-not-allowed"
                  : isFull
                    ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                    : loading
                      ? "bg-gray-50 border-gray-200 cursor-wait"
                      : isSelected
                        ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-[#4169E1] shadow-md"
                        : "bg-white border-gray-200 hover:border-[#4169E1] hover:bg-gray-50"
              }`}
            >
              {/* Status Badge */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-[#4169E1] text-white rounded-full p-1 shadow-lg">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}

              <div className="p-4 space-y-3">
                {/* Título */}
                <h4
                  className={`font-semibold text-sm leading-tight line-clamp-2 ${
                    isSelected ? "text-[#4169E1]" : "text-gray-900"
                  }`}
                >
                  {title}
                </h4>

                {/* Informações do evento */}
                <div className="space-y-2">
                  {day && time && (
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="h-3 w-3 mr-1.5 flex-shrink-0" />
                      <span className="truncate">
                        {(day ?? "") + " • " + (time ?? "")}
                      </span>
                    </div>
                  )}

                  {typeof location === "string" && location && (
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mr-1.5 flex-shrink-0" />
                      <span className="truncate">{location}</span>
                    </div>
                  )}
                </div>

                {/* Status Messages */}
                {hasTimeConflict && (
                  <div className="flex items-center text-xs text-red-600 bg-red-100 rounded-md px-2 py-1">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span>Conflito de horário</span>
                  </div>
                )}

                {isFull && (
                  <div className="flex items-center text-xs text-gray-600 bg-gray-100 rounded-md px-2 py-1">
                    <Users className="h-3 w-3 mr-1" />
                    <span>Vagas esgotadas</span>
                  </div>
                )}

                {loading && (
                  <div className="flex items-center text-xs text-gray-600 bg-gray-100 rounded-md px-2 py-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600 mr-1"></div>
                    <span>Verificando vagas...</span>
                  </div>
                )}
              </div>

              {/* Hover Effect */}
              {!hasTimeConflict && !isFull && !loading && (
                <div
                  className={`absolute inset-0 rounded-xl transition-opacity ${
                    isSelected ? "bg-[#4169E1]/5" : "bg-transparent group-hover:bg-gray-50"
                  }`}
                />
              )}
            </div>
          )

          return hasTimeConflict ? (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>{eventCard}</TooltipTrigger>
                <TooltipContent>
                  <p>Este evento conflita com outro já selecionado</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            eventCard
          )
        })}
      </div>

      {/* Jogos em Grupo - Seção Especial */}
      {eventType === "Torneio de Jogos" && (
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            🎮 <span className="ml-2">Jogos em Equipe</span>
          </h4>
          <p className="text-gray-600 mb-4">
            Para jogos que requerem equipes, faça sua inscrição através dos links específicos:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://forms.gle/Dei1itv9aPKZh4H79"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-[#4169E1] to-[#5B9BD5] text-white rounded-lg hover:from-blue-600 hover:to-blue-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="font-medium">Brawl Stars</span>
              <svg
                className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            <a
              href="https://forms.gle/K23o54639YiGqxmn8"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-[#8052EC] to-[#9D6BF0] text-white rounded-lg hover:from-purple-600 hover:to-purple-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <span className="font-medium">CS 1.6</span>
              <svg
                className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      )}

      {/* Contador de Seleções */}
      {selected.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {selected.length}{" "}
            {eventType === "Palestra" ? "palestra(s)" : eventType === "Minicurso" ? "minicurso(s)" : "jogo(s)"}{" "}
            selecionado(s)
          </p>
        </div>
      )}
    </div>
  )
}

export default SelectableEventBlocks
