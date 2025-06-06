'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'

const clientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  status: z.enum(['active', 'inactive'])
})

export default function EditClientPage() {
  const router = useRouter()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset,
    setError
  } = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema)
  })

  // Carrega os dados do cliente
  useEffect(() => {
    const loadClient = async () => {
      try {
        setIsLoading(true)
        const response = await api.get(`/api/clients/${id}`)
        
        if (!response.data) {
          throw new Error('Cliente não encontrado')
        }
        
        reset({
          name: response.data.name,
          email: response.data.email,
          status: response.data.status
        })
      } catch (error) {
        toast.error('Erro ao carregar cliente')
        router.push('/clients')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadClient()
  }, [id, reset, router])

  const onSubmit = async (data: z.infer<typeof clientSchema>) => {
    try {
      const response = await api.put(`/api/clients/${id}`, data)
      
      if (response.status === 200) {
        toast.success('Cliente atualizado com sucesso!')
        router.push('/clients')
      } else {
        throw new Error(response.data?.error || 'Erro ao atualizar cliente')
      }
    } catch (error: any) {
      console.error('Erro detalhado:', error)
      
      if (error.response?.data?.errors) {
        // Tratar erros de validação do Zod
        error.response.data.errors.forEach((err: any) => {
          setError(err.path[0], {
            type: 'manual',
            message: err.message
          })
        })
      } else {
        toast.error(error.response?.data?.error || 'Erro ao atualizar cliente')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="flex gap-4 pt-2">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Editar Cliente</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome Completo</label>
          <Input
            {...register('name')}
            placeholder="Digite o nome completo"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input
            type="email"
            {...register('email')}
            placeholder="Digite o email"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            {...register('status')}
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${
              errors.status ? 'border-red-500' : ''
            }`}
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        <div className="flex gap-4 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/clients')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">↻</span>
                Salvando...
              </span>
            ) : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  )
}