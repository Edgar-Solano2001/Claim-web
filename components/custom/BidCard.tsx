
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { timestampToDate } from '@/lib/models/types'
import type { Bid } from '@/lib/models/types'

interface BidCardProps {
  bid: Bid & {
    auction?: {
      id: string
      title: string
      image: string
      category: string
      currentPrice: number
      status: string
      endDate: Date | any
    }
  }
}

export default function BidCard({ bid }: BidCardProps) {
  const auction = bid.auction
  if (!auction) return null

  const bidDate = timestampToDate(bid.timestamp)
  const endDate = timestampToDate(auction.endDate)
  const now = new Date()
  const isActive = auction.status === "active" && endDate > now
  
  // Calcular tiempo restante
  const diff = endDate.getTime() - now.getTime()
  let timeRemaining = "Finalizada"
  if (diff > 0) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) {
      timeRemaining = `${days}d ${hours}h`
    } else {
      timeRemaining = `${hours}h`
    }
  }

  const getStatusBadge = () => {
    if (!isActive) {
      if (bid.isWinning && bid.status === "winning") {
        return <Badge className="bg-green-100 text-green-700 border border-green-300">🏆 Ganaste</Badge>
      }
      return <Badge className="bg-gray-100 text-gray-700 border border-gray-300">Finalizada</Badge>
    }
    
    if (bid.isWinning) {
      return <Badge className="bg-green-100 text-green-700 border border-green-300">🏆 Ganadora</Badge>
    }
    
    if (bid.status === "outbid") {
      return <Badge className="bg-red-100 text-red-700 border border-red-300">Superada</Badge>
    }
    
    return <Badge className="bg-blue-100 text-blue-700 border border-blue-300">Activa</Badge>
  }

  return (
    <Link href={`/Subastas/${bid.auction?.id}`}className='group block h-full'>
      <Card className='h-full flex flex-col overflow-hidden border-2 border-transparent hover:border-purple-300 hover:shadow-xl transition-all duration-300 bg-white'>
        {/* Imagen */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200">
          <Image
            src={auction.image}
            alt={auction.title}
            fill
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <Badge className="absolute top-2 right-2 bg-purple-600 hover:bg-purple-700 shadow-sm text-white">
            {auction.category}
          </Badge>
          <div className="absolute top-2 left-2">
            {getStatusBadge()}
          </div>
        </div>
        
        <CardHeader className="pb-2">
          <CardTitle className="font-bold text-lg text-slate-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
            {auction.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-grow space-y-3">
          <div>
            <p className="text-sm text-slate-500 mb-1">Tu puja</p>
            <p className="text-2xl font-bold text-purple-700">
              ${bid.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="pt-2 border-t border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Oferta actual</p>
            <p className="text-lg font-semibold text-slate-700">
              ${auction.currentPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="text-xs text-slate-400">
            <p>Pujaste el {bidDate.toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </CardContent>
        
        <CardFooter className="pt-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 flex justify-between items-center">
          <span className="font-mono flex items-center gap-1">
            <span>⏱</span>
            {timeRemaining}
          </span>
          <span className="font-semibold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Ver subasta →
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}

