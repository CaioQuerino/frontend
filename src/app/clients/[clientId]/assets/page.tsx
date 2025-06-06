'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useParams, useRouter } from 'next/navigation'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useForm, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const assetSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  value: z.coerce.number().positive('Valor inválido')
})

type AssetFormData = z.infer<typeof assetSchema>

type Asset = {
  id: number
  name: string
  value: number
}

type Client = {
  id: number
  name: string
  // Adicione outros campos se necessário
}

export default function ClientAssetsPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema)
  })

  // Buscar cliente
  const { data: client } = useQuery<Client>({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const { data } = await api.get(`/api/clients/${clientId}`)
      return data as Client
    }
  })

  // Buscar ativos
  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ['assets', clientId],
    queryFn: async () => {
      const { data } = await api.get(`/api/clients/${clientId}/assets`)
      return data.assets as Asset[]
    }
  })

  // Cadastrar ativo
  const createAsset = useMutation({
    mutationFn: (newAsset: { name: string; value: number }) => 
      api.post('/api/assets', { ...newAsset, clientId: Number(clientId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', clientId] })
      reset()
      toast.success('Ativo cadastrado com sucesso!')
    }
  })

  const onSubmit: SubmitHandler<AssetFormData> = (data) => {
    createAsset.mutate({
      name: data.name,
      value: Number(data.value)
    })
  }

  if (isLoading) return <div>Carregando...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Ativos de {client?.name || 'Cliente'}
        </h1>
        <Button variant="outline" onClick={() => router.push('/clients')}>
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 p-6 bg-card rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Input
              placeholder="Nome do ativo"
              {...register('name')}
              className={errors.name ? 'border-red-500' : undefined}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Input
              type="number"
              step="0.01"
              placeholder="Valor"
              {...register('value')}
              className={errors.value ? 'border-red-500' : undefined}
            />
            {errors.value && (
              <p className="text-red-500 text-sm mt-1">{errors.value.message}</p>
            )}
          </div>
        </div>

        <Button type="submit" disabled={createAsset.isPending}>
          {createAsset.isPending ? 'Cadastrando...' : 'Adicionar Ativo'}
        </Button>
      </form>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ativo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Valor Formatado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.value}</TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(asset.value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}