'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useForm, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useEffect, useState, Fragment, JSX } from 'react'
import { Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import '../globals.css'

type Client = {
  id: number
  name: string
  email: string
  status: 'active' | 'inactive'
  assets: Asset[]
}

type Asset = {
  id: number
  name: string
  value: number
  clientId: number
}

const clientSchema = z.object({
  name: z.string().min(3, 'Nome precisa ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  status: z.enum(['active', 'inactive'], {
    required_error: 'Status é obrigatório'
  })
})

type ClientFormData = z.infer<typeof clientSchema>

export default function ClientsPage(): JSX.Element {
  const [isMounted, setIsMounted] = useState(false)
  const [expandedClient, setExpandedClient] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema)
  })

  const { data: clients = [], isLoading, isError, error } = useQuery<Client[], Error>({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await api.get('/api/clients?include=assets')
      return data.data || []
    },
    retry: false
  })

  useEffect(() => {
    if (isError) {
      toast.error('Falha ao carregar clientes: ' + (error?.message || 'Erro desconhecido'))
    }
  }, [isError, error])

  const createClient = useMutation({
    mutationFn: (newClient: ClientFormData) => api.post('/api/clients', newClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      reset()
      toast.success('Cliente cadastrado com sucesso!')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Erro ao cadastrar cliente'
      toast.error(errorMessage)
    }
  })

  const deleteClient = useMutation({
    mutationFn: (id: number) => api.delete(`/api/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente removido com sucesso!')
},

    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao remover cliente')
    }
  })

  const onSubmit: SubmitHandler<ClientFormData> = (data) => {
    createClient.mutate(data)
  }

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja remover o cliente ${name}?`)) {
      deleteClient.mutate(id)
    }
  }

  const toggleAssets = (clientId: number) => {
    setExpandedClient(expandedClient === clientId ? null : clientId)
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || isLoading) return <div className="p-8">Carregando...</div>
  if (isError) return <div className="p-8 text-red-500">Erro ao carregar clientes</div>

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cadastro de Clientes</h1>
        <Link href="/assets" className="text-blue-500 hover:text-blue-700">Ver Assets</Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 p-6 bg-card rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Input
              placeholder="Nome completo"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Input
              placeholder="Email"
              type="email"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <select
              {...register('status')}
              className={`w-full p-2 border rounded ${errors.status ? 'border-red-500' : ''}`}
            >
              <option value="">Selecione o status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
          </div>
        </div>
        <Button className='cursor-pointer' type="submit" >{createClient.status === 'pending'}

        {createClient.status === 'pending' ? 'Cadastrando...' : 'Cadastrar Cliente'}
        </Button>
      </form>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nome</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Ações</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Assets</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Editar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clients.length > 0 ? (
              clients.map((client) => (
                <Fragment key={client.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => toggleAssets(client.id)} className="flex items-center gap-2">
                        {client.name}
                        {expandedClient === client.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{client.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {client.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button
                    className='bg-red-400 cursor-pointer'
                    size="sm"
                    onClick={() => handleDelete(client.id, client.name)}
                    disabled={deleteClient.status === 'pending'}
                  >
                    {deleteClient.status === 'pending'
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 size={16} className="mr-1" />
                    }
                    Remover
                  </Button>

                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/clients/${client.id}/assets`}>
                        <Button className='cursor-pointer' variant="outline" size="sm">Ver Assets</Button>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/clients/edit/${client.id}`}>
                        <Button className='cursor-pointer' size="sm">Editar</Button>
                      </Link>
                    </td>
                  </tr>
                  {expandedClient === client.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="ml-8">
                          <h3 className="font-medium mb-2">Assets do Cliente</h3>
                          {client.assets.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {client.assets.map(asset => (
                                <div key={asset.id} className="p-3 border rounded shadow-sm bg-white">
                                  <p><strong>Nome:</strong> {asset.name}</p>
                                  <p><strong>Valor:</strong> R$ {asset.value.toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>Este cliente não possui assets cadastrados.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">Nenhum cliente encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
