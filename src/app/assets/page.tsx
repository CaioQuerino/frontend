'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

type Asset = {
  id: number
  name: string
  value: number
  client: {
    id: number
    name: string
  }
}

export default function AssetsPage() {
  const router = useRouter()

  const { data, isLoading, error } = useQuery<Asset[]>({
    queryKey: ['assets'],
    queryFn: async () => {
      const response = await api.get('/api/assets/all')
      return response.data.assets
    }
  })

  if (isLoading) return <p className="text-gray-500">Carregando ativos...</p>
  if (error) return <p className="text-red-500">Erro ao carregar ativos.</p>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Lista de Ativos</h1>

      <Button variant="outline" onClick={() => router.back()}>
        Voltar
      </Button>

      <table className="w-full border-collapse border border-gray-300 mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Nome</th>
            <th className="border border-gray-300 px-4 py-2">Valor</th>
            <th className="border border-gray-300 px-4 py-2">Cliente</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((asset) => (
            <tr key={asset.id}>
              <td className="border border-gray-300 px-4 py-2">{asset.id}</td>
              <td className="border border-gray-300 px-4 py-2">{asset.name}</td>
              <td className="border border-gray-300 px-4 py-2">R$ {asset.value.toFixed(2)}</td>
              <td className="border border-gray-300 px-4 py-2">{asset.client.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
