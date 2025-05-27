/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState } from "react"
import Layout from "../components/Layout/Layout"
import { toast } from "sonner"
import api from "@/lib/axios"
import { useNavigate } from "react-router-dom"

// Estados brasileiros
const estadosBrasileiros = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
]

// Componente para indicador de força da senha
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const getStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const strength = getStrength(password)
  const getColor = () => {
    if (strength <= 2) return "bg-red-500"
    if (strength <= 3) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getLabel = () => {
    if (strength <= 2) return "Fraca"
    if (strength <= 3) return "Média"
    return "Forte"
  }

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getColor()}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-600">{getLabel()}</span>
      </div>
    </div>
  )
}

// Definindo os dados iniciais do formulário
const initialFormData = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  cpf: "",
  dataNascimento: "",
  telefone: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  termoConsentimento: null as File | null,
  termosUso: false,
}

// Função para validar CPF
const validarCPF = (cpf: string) => {
  cpf = cpf.replace(/[^\d]/g, "")
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += Number.parseInt(cpf.charAt(i)) * (10 - i)
  }
  let resto = 11 - (soma % 11)
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== Number.parseInt(cpf.charAt(9))) return false

  soma = 0
  for (let i = 0; i < 10; i++) {
    soma += Number.parseInt(cpf.charAt(i)) * (11 - i)
  }
  resto = 11 - (soma % 11)
  if (resto === 10 || resto === 11) resto = 0
  return resto === Number.parseInt(cpf.charAt(10))
}

const calcularIdade = (dataNascimento: string) => {
  const hoje = new Date()
  const nascimento = new Date(dataNascimento)
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const mes = hoje.getMonth() - nascimento.getMonth()
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--
  }
  return idade
}

const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1")
}

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1")
}

const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1")
}

const buscarCEP = async (cep: string) => {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await response.json()
    if (!data.erro) {
      return {
        cidade: data.localidade,
        estado: data.uf,
        endereco: `${data.logradouro}, ${data.bairro}`,
      }
    }
  } catch (error) {
    console.error("Erro ao buscar CEP:", error)
  }
  return null
}

const Inscricao = () => {
  const [formData, setFormData] = useState(initialFormData)
  const [isMinor, setIsMinor] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUploaded, setPdfUploaded] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, files } = e.target as any
    let processedValue = value

    if (name === "cpf") {
      processedValue = maskCPF(value)
    } else if (name === "telefone") {
      processedValue = maskPhone(value)
    } else if (name === "cep") {
      processedValue = maskCEP(value)

      if (processedValue.length === 9) {
        buscarCEP(processedValue.replace("-", "")).then((data) => {
          if (data) {
            setFormData((prev) => ({
              ...prev,
              cidade: data.cidade,
              estado: data.estado,
              endereco: data.endereco,
            }))
          }
        })
      }
    } else if (name === "termoConsentimento" && type === "file") {
      const file = files?.[0]
      if (file && file.type === "application/pdf") {
        setPdfFile(file)
      } else {
        toast.error("Por favor, selecione um arquivo PDF válido.")
        setPdfFile(null)
      }
      return
    }

    setFormData({ ...formData, [name]: processedValue })

    if (name === "dataNascimento" && value) {
      const idade = calcularIdade(value)
      setIsMinor(idade < 18)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    // Se menor de idade, faz upload do PDF antes do cadastro
    if (isMinor) {
      if (!pdfFile) {
        toast.error("Faça o upload do termo de consentimento em PDF.")
        return
      }
      const data = new FormData()
      data.append("pdf", pdfFile)
      try {
        const pdf = await api.post("/upload-pdf", data, {
          headers: { "Content-Type": "multipart/form-data" },
        })

        const { fileId } = pdf.data
        console.log("PDF enviado com sucesso:", fileId)
        formData.termoConsentimento = fileId
        setPdfUploaded(true)
        //toast.success("PDF enviado com sucesso!")
      } catch (error) {
        toast.error("Erro ao enviar PDF.")
        return
      }
    }

    try {
      await api.post("/registro", {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ""),
        cep: formData.cep ? formData.cep.replace(/\D/g, "") : undefined,
        dataNascimento: formData.dataNascimento.split("-").reverse().join("/"),
        telefone: formData.telefone ? formData.telefone.replace(/\D/g, "") : undefined,
        endereco: formData.endereco ? formData.endereco : undefined,
        cidade: formData.cidade ? formData.cidade : undefined,
        estado: formData.estado ? formData.estado : undefined,
        termoConsentimento: pdfFile ? formData.termoConsentimento : undefined,
        termosUso: formData.termosUso,
      })
      toast.success("Cadastro realizado com sucesso!")
      navigate("/cadastro-sucesso", {
        state: { email: formData.email },
      })
    } catch (error: any) {
      toast.error("Erro ao enviar dados do cadastro.")
    }
  }

  const validateForm = () => {
    if (formData.nome.trim().split(" ").length < 2) {
      toast.error("Nome deve conter pelo menos 2 palavras")
      return false
    }

    if (!validarCPF(formData.cpf)) {
      toast.error("CPF inválido")
      return false
    }

    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!senhaRegex.test(formData.senha)) {
      toast.error("Senha deve ter pelo menos 8 caracteres, 1 maiúscula, 1 minúscula e 1 número")
      return false
    }

    if (formData.senha !== formData.confirmarSenha) {
      toast.error("Senhas não coincidem")
      return false
    }

    if (!formData.termosUso) {
      toast.error("Você deve aceitar os termos de uso para continuar")
      return false
    }

    return true
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData({ ...formData, [name]: checked })
  }

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">Cadastro de Usuário</h1>

          <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Dados Pessoais *</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="nome" className="block mb-2 text-gray-700 font-medium">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      maxLength={100}
                      className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent"
                      placeholder="Digite seu nome completo"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      maxLength={150}
                      className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="cpf" className="block mb-2 text-gray-700 font-medium">
                      CPF *
                    </label>
                    <input
                      type="text"
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleInputChange}
                      maxLength={14}
                      className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent"
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="dataNascimento" className="block mb-2 text-gray-700 font-medium">
                      Data de Nascimento *
                    </label>
                    <input
                      type="date"
                      id="dataNascimento"
                      name="dataNascimento"
                      value={formData.dataNascimento}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="senha" className="block mb-2 text-gray-700 font-medium">
                      Senha *
                    </label>
                    <input
                      type="password"
                      id="senha"
                      name="senha"
                      value={formData.senha}
                      onChange={handleInputChange}
                      minLength={8}
                      className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent"
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                    <PasswordStrengthIndicator password={formData.senha} />
                  </div>

                  <div>
                    <label htmlFor="confirmarSenha" className="block mb-2 text-gray-700 font-medium">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      id="confirmarSenha"
                      name="confirmarSenha"
                      value={formData.confirmarSenha}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent"
                      placeholder="Confirme sua senha"
                      required
                    />
                  </div>
                </div>
              </div>

              {isMinor && (
                <div className="border-b pb-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Termo de Consentimento *</h2>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                    <p className="text-yellow-800 mb-2">
                      Como você é menor de 18 anos, é necessário o termo de consentimento assinado pelos responsáveis.
                    </p>
                    <a
                      href="/assets/docs/termo_consentimento.pdf"
                      download
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      📄 Baixar Termo de Consentimento
                    </a>
                  </div>
                  <div>
                    <label htmlFor="termoConsentimento" className="block mb-2 text-gray-700 font-medium">
                      Upload do Termo Assinado (PDF) *
                    </label>
                    <input
                      type="file"
                      id="termoConsentimento"
                      name="termoConsentimento"
                      accept=".pdf"
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Informações Adicionais</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="telefone" className="block mb-2 text-gray-700 font-medium">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      maxLength={15}
                      className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label htmlFor="cep" className="block mb-2 text-gray-700 font-medium">
                      CEP
                    </label>
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={handleInputChange}
                      maxLength={9}
                      className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent"
                      placeholder="00000-000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="endereco" className="block mb-2 text-gray-700 font-medium">
                      Endereço Completo
                    </label>
                    <textarea
                      id="endereco"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleInputChange}
                      maxLength={500}
                      rows={3}
                      className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent"
                      placeholder="Rua, número, complemento"
                    />
                  </div>

                  <div>
                    <label htmlFor="cidade" className="block mb-2 text-gray-700 font-medium">
                      Cidade
                    </label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                      maxLength={100}
                      className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent"
                      placeholder="Nome da cidade"
                    />
                  </div>

                  <div>
                    <label htmlFor="estado" className="block mb-2 text-gray-700 font-medium">
                      Estado
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-event-blue focus:border-transparent"
                    >
                      <option value="">Selecione o estado</option>
                      {estadosBrasileiros.map((estado) => (
                        <option key={estado.sigla} value={estado.sigla}>
                          {estado.nome} ({estado.sigla})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Termos de Uso */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Termos de Uso *</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="termosUso"
                      name="termosUso"
                      checked={formData.termosUso}
                      onChange={handleCheckboxChange}
                      className="h-5 w-5 text-event-blue focus:ring-event-blue border-gray-300 rounded mt-1"
                      required
                    />
                    <label htmlFor="termosUso" className="text-gray-700 text-sm leading-relaxed">
                      Eu li e aceito os{" "}
                      <a
                        href="/termos-de-uso"
                        target="_blank"
                        className="text-event-blue hover:text-blue-600 underline"
                        rel="noreferrer"
                      >
                        Termos de Uso
                      </a>{" "}
                      e a{" "}
                      <a
                        href="/politica-de-privacidade"
                        target="_blank"
                        className="text-event-blue hover:text-blue-600 underline"
                        rel="noreferrer"
                      >
                        Política de Privacidade
                      </a>{" "}
                      da Semana da Computação. Concordo com o tratamento dos meus dados pessoais conforme descrito nos
                      documentos. *
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="bg-event-blue hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors w-full font-medium"
                >
                  Realizar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Inscricao
