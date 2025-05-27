"use client"

import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Layout from "../components/Layout/Layout"
import { CheckCircle, Mail, ArrowRight } from "lucide-react"

const CadastroSucesso = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ""

  useEffect(() => {
    // Se não tem email no state, redireciona para cadastro
    if (!email) {
      navigate("/inscricao")
    }
  }, [email, navigate])

  return (
    <Layout>
      <section className="py-12 min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white p-8 rounded-lg shadow-sm border">
              {/* Ícone de sucesso */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              {/* Título */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Cadastro Realizado com Sucesso!</h1>

              {/* Descrição */}
              <p className="text-lg text-gray-600 mb-6">
                Seu cadastro foi processado com sucesso. Para ativar sua conta, você precisa confirmar seu endereço de
                email.
              </p>

              {/* Card do email */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-3">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Email de Confirmação Enviado</h3>
                <p className="text-blue-700 mb-2">Enviamos um link de confirmação para:</p>
                <p className="font-semibold text-blue-900 text-lg">{email}</p>
              </div>

              {/* Instruções */}
              <div className="text-left bg-gray-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Próximos passos:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Verifique sua caixa de entrada (e spam/lixo eletrônico)</li>
                  <li>Clique no link de confirmação no email</li>
                  <li>Sua conta será ativada automaticamente</li>
                  <li>Faça login para acessar a plataforma</li>
                </ol>
              </div>

              {/* Botões de ação */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-event-blue hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <span>Ir para Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-md transition-colors font-medium"
                >
                  Voltar ao Início
                </button>
              </div>

              {/* Aviso sobre tempo */}
              <div className="mt-6 text-sm text-gray-500">
                <p>
                  Não recebeu o email? Verifique sua pasta de spam ou aguarde alguns minutos. O link de confirmação
                  expira em 24 horas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default CadastroSucesso
