import { useState, useEffect } from "react";
import { scheduleDay1, scheduleDay2, scheduleDay3, MinicursosData, lecturesData } from "../../data/scheduleData";
import { hasConflict } from "../../utils/timeConflicts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

// Define os tipos de eventos que podem ser selecionados
interface SelectableEventProps {
  eventType: string;
  onChange: (selectedItems: string[]) => void;
  selectedEvents?: string[];
}

// Extrai apenas a parte da data no formato "DD/MM/AA" da string "Dia X-DD/MM/AA"
const normalizeDate = (dayString: string) => {
  const match = dayString.match(/\d{2}\/\d{2}\/\d{2}/);
  return match ? match[0] : dayString;
};

// Componente que renderiza blocos de eventos selecionáveis, como palestras, minicursos e torneios de jogos
const SelectableEventBlocks = ({ eventType, onChange, selectedEvents = [] }: SelectableEventProps) => {
  const [selected, setSelected] = useState<string[]>(selectedEvents);

  const games = ["Naruto", "Mortal Kombat", "FIFA", "Mario Kart"];
  const groupGamesLink = "https://forms.gle/SEU-LINK-AQUI";

  const getEventData = () => {
    switch (eventType) {
      case "Palestra":
        return lecturesData;
      case "Minicurso":
        return MinicursosData;
      case "Torneio de Jogos":
        return games.map(game => ({ title: game }));
      default:
        return [];
    }
  };

  // Verifica se há conflito de horário entre os eventos selecionados
  // e o evento atual que está sendo verificado
  const checkTimeConflict = (eventTitle: string) => {
    if (eventType === "Torneio de Jogos") return false;

    const currentEvent = lecturesData.find(e => e.title === eventTitle) || MinicursosData.find(e => e.title === eventTitle);

    if (!currentEvent?.day || !currentEvent?.time) return false;

    const currentSlot = {
      date: normalizeDate(currentEvent.day),
      time: currentEvent.time,
    };

    for (const selectedTitle of selected) {
      if (selectedTitle === eventTitle) continue;

      const selectedEvent = lecturesData.find(e => e.title === selectedTitle) || MinicursosData.find(e => e.title === selectedTitle);
      if (selectedEvent?.day && selectedEvent?.time) {
        const selectedSlot = {
          date: normalizeDate(selectedEvent.day),
          time: selectedEvent.time,
        };

        if (hasConflict(currentSlot, selectedSlot)) {
          return true;
        }
      }
    }

    return false;
  };

  // Manipula o evento de seleção/deseleção de um evento
  const handleToggleEvent = (eventName: string) => {
    if (selected.includes(eventName)) {
      setSelected(prev => prev.filter(e => e !== eventName));
      return;
    }

    if (checkTimeConflict(eventName)) {
      toast.error("Conflito de horário!", {
        description: "Este evento conflita com outro já selecionado.",
      });
      return;
    }

    setSelected(prev => [...prev, eventName]);
  };

  useEffect(() => {
    onChange(selected);
  }, [selected, onChange]);

  const events = getEventData();

  if (events.length === 0) return null;

  return (
    <div className="mt-4 mb-6">
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        Selecione {eventType === "Palestra" ? "as palestras" : eventType === "Minicurso" ? "os minicursos" : "os jogos"} que deseja participar:
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {events.map((event, index) => {
          const title = "title" in event ? event.title : event.activity;
          const time = "time" in event ? `${event.day} ${event.time}` : "";
          const location = "location" in event ? event.location : "";

          const hasConflict = checkTimeConflict(title);
          const isFull = "isFull" in event ? event.isFull : false;
          const loading = "loading" in event ? event.loading : false;

          const eventCard = (
            <div
              key={index}
              onClick={() => !hasConflict && !isFull && handleToggleEvent(title)}
              className={`cursor-pointer p-3 rounded-md border transition-colors ${hasConflict
                  ? "bg-red-50 border-red-200 cursor-not-allowed"
                  : isFull
                    ? "bg-gray-100 cursor-not-allowed opacity-60"
                    : selected.includes(title)
                      ? "bg-event-lightblue border-event-blue"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
            >
              <p className="font-medium text-sm mb-1 line-clamp-2">{title}</p>
              {time && <p className="text-xs text-gray-500">{time}</p>}
              {location && <p className="text-xs text-gray-500">{location}</p>}
              {hasConflict && (
                <span className="text-xs text-red-500 mt-1 block">Conflito de horário</span>
              )}
              {isFull && (
                <span className="text-xs text-red-500 mt-1 block">Vagas esgotadas</span>
              )}
              {loading && (
                <span className="text-xs text-gray-500 mt-1 block">Verificando vagas...</span>
              )}
            </div>
          );

          return hasConflict ? (
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
          );
        })}
      </div>

      {/* Link para inscrição dos jogos em grupo */}
      {eventType === "Torneio de Jogos" && (
        <div className="mt-4">
          <p className="text-sm text-gray-700 mb-4">Jogos em grupo como <strong>Brawl Stars</strong> e <strong>CS 1.6</strong> devem ser inscritos separadamente:</p>
          <a
            href="https://forms.gle/Dei1itv9aPKZh4H79"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center px-4 py-2 bg-[#1A1F2C] text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Brawl Stars
          </a>
           <a
            href="https://forms.gle/K23o54639YiGqxmn8"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center px-4 py-2 bg-[#1A1F2C] text-white rounded-md hover:bg-blue-700 transition-colors mt-2"
          >
            CS 1.6
          </a>
        </div>
      )} 

    </div>
  );
};

export default SelectableEventBlocks;
// Este componente é responsável por renderizar os blocos de eventos selecionáveis, como palestras, minicursos e torneios de jogos.