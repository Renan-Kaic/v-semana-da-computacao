"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Layout from "../components/Layout/Layout"
import { Mail, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import supabase from "../lib/supabaseClient"
import api from "@/lib/axios"

const EmailNaoConfirmado = () => {
  const [isResending, setIsResending] = useState(false)
  const navigate = useNavigate()

  // Pegar email do localStorage se disponível
  const userEmail = localStorage.getItem("pendingEmail") || ""

  const handleResendEmail = async () => {
    if (!userEmail) {
      toast.error("Email não encontrado. Faça login novamente.")
      navigate("/login")
      return
    }

    setIsResending(true)

    try {
      
      const query = await api.post("/reenviar-confirmacao", { email: userEmail })

      toast.success("Email de confirmação reenviado!", {
        description: "Verifique sua caixa de entrada e spam.",
        duration: 5000,
      })
    } catch (error) {
      console.error("Erro ao reenviar email:", error)
      toast.error("Erro ao reenviar email. Tente novamente.")
    } finally {
      setIsResending(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("pendingEmail")
    navigate("/")
  }

  return (
    <Layout>
      <section className="py-12 min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white p-8 rounded-lg shadow-sm border">
              {/* Ícone de Alerta */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-yellow-600" />
                </div>
              </div>

              {/* Título */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Não Confirmado</h1>

              {/* Mensagem Principal */}
              <p className="text-lg text-gray-600 mb-6">
                Para acessar o sistema e se inscrever em eventos, você precisa confirmar seu email primeiro.
              </p>

              {/* Card de Informações */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-yellow-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-yellow-800">Email enviado para:</p>
                    <p className="text-yellow-700">{userEmail || "seu@email.com"}</p>
                  </div>
                </div>

                <div className="text-yellow-800 text-sm space-y-2">
                  <p>
                    📧 <strong>Verifique sua caixa de entrada</strong> e também a pasta de spam
                  </p>
                  <p>
                    🔗 <strong>Clique no link</strong> de confirmação no email
                  </p>
                  <p>
                    ✅ <strong>Retorne aqui</strong> após confirmar para fazer login
                  </p>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-4">
                {/* Reenviar Email */}
                <button
                  onClick={handleResendEmail}
                  disabled={isResending || !userEmail}
                  className="w-full bg-event-blue hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Reenviar Email de Confirmação
                    </>
                  )}
                </button>

                {/* Voltar para Login */}
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-md transition-colors font-medium flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar para Login
                </button>
              </div>

              {/* Links Adicionais */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-500">Problemas com a confirmação?</p>

                  <div className="space-y-2">
                    <Link to="/inscricao" className="block text-event-blue hover:text-blue-600 text-sm">
                      📝 Fazer novo cadastro
                    </Link>

                    <button onClick={handleLogout} className="block w-full text-gray-500 hover:text-gray-700 text-sm">
                      🚪 Sair do sistema
                    </button>
                  </div>
                </div>
              </div>

              {/* Informação de Suporte */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  💡 <strong>Dica:</strong> Se não receber o email em alguns minutos, verifique se o endereço está
                  correto e tente reenviar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default EmailNaoConfirmado
