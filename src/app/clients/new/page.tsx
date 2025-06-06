'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  status: z.enum(['active', 'inactive']).default('active')
})

export default function NewClientPage() {
  const router = useRouter()
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(formSchema)
  })

  const onSubmit = async (data: any) => {
    try {
      await api.post('/api/clients', data)
      toast.success('Cliente cadastrado com sucesso!')
      router.push('/clients')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao cadastrar cliente')
    }
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Cadastrar Novo Cliente</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome Completo</label>
          <Input
            {...register('name')}
            placeholder="Digite o nome completo"
            className={errors.name && 'border-red-500'}
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
            className={errors.email && 'border-red-500'}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="flex gap-4 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </form>
    </div>
  )
}