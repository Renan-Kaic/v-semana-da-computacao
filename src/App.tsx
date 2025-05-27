import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Index from "./pages/Index"
import Programacao from "./pages/Programacao"
import Palestras from "./pages/Palestras"
import Minicursos from "./pages/Minicursos"
import TorneioJogos from "./pages/TorneioJogos"
import Inscricao from "./pages/Inscricao"
import CadastroSucesso from "./pages/CadastroSucesso"
import ConfirmarEmail from "./pages/ConfirmarEmail"
import Login from "./pages/Login"
import InscricaoEventos from "./pages/InscricaoEventos"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "@/components/ProtectedRoute"
import EmailNaoConfirmado from "./pages/EmailNaoConfirmado"
import Dashboard from "./pages/Dashboard"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/programacao" element={<Programacao />} />
          <Route path="/palestras" element={<Palestras />} />
          <Route path="/minicursos" element={<Minicursos />} />
          <Route path="/torneio-jogos" element={<TorneioJogos />} />
          <Route path="/inscricao" element={<Inscricao />} />
          <Route path="/cadastro-sucesso" element={<CadastroSucesso />} />
          <Route path="/confirmar-email" element={<ConfirmarEmail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/email-nao-confirmado" element={<EmailNaoConfirmado />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/inscricao-eventos" element={
            <ProtectedRoute>
              <InscricaoEventos />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
