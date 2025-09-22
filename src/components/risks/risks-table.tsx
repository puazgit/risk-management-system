"use client"

import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Plus, Filter } from "lucide-react"
import Link from "next/link"

interface Risk {
  id: number
  riskNumber: string
  namaRisiko: string
  kategori: {
    categoryBUMN: string
  }
  ownerUnit: {
    name: string
  }
  risikoInheren?: {
    inherenLevel: string
    inherenExposure: number
  }
  risikoResidual?: {
    residualLevel: string
    residualExposure: number
  }
  createdAt: string
}

interface RisksTableProps {
  risks: Risk[]
  isLoading?: boolean
  onSearch?: (search: string) => void
  onFilter?: (filters: any) => void
  onRefresh?: () => void
  searchValue?: string
}

function getRiskLevelColor(level: string) {
  switch (level) {
    case "VERY_HIGH":
      return "bg-red-500 text-white"
    case "HIGH":
      return "bg-orange-500 text-white"
    case "MODERATE":
      return "bg-yellow-500 text-white"
    case "LOW":
      return "bg-green-500 text-white"
    case "VERY_LOW":
      return "bg-blue-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

function getRiskLevelText(level: string) {
  switch (level) {
    case "VERY_HIGH":
      return "Sangat Tinggi"
    case "HIGH":
      return "Tinggi"
    case "MODERATE":
      return "Sedang"
    case "LOW":
      return "Rendah"
    case "VERY_LOW":
      return "Sangat Rendah"
    default:
      return level
  }
}

export function RisksTable({ 
  risks, 
  isLoading = false, 
  onSearch, 
  onFilter, 
  onRefresh,
  searchValue = ""
}: RisksTableProps) {
  const [search, setSearch] = React.useState(searchValue)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearch?.(value)
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari risiko..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="max-w-sm"
              disabled
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" disabled>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Risiko
            </Button>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Risiko</TableHead>
                <TableHead>Nama Risiko</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Unit Pemilik</TableHead>
                <TableHead>Risiko Inheren</TableHead>
                <TableHead>Risiko Residual</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                  <TableCell>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari risiko..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onFilter}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button asChild>
            <Link href="/risks/create">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Risiko
            </Link>
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Risiko</TableHead>
              <TableHead>Nama Risiko</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Unit Pemilik</TableHead>
              <TableHead>Risiko Inheren</TableHead>
              <TableHead>Risiko Residual</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {risks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-muted-foreground">Tidak ada data risiko</p>
                    <Button asChild className="mt-2" variant="outline">
                      <Link href="/risks/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Risiko Pertama
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              risks.map((risk) => (
                <TableRow key={risk.id}>
                  <TableCell className="font-mono text-sm">
                    {risk.riskNumber}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link 
                      href={`/risks/${risk.id}`}
                      className="hover:underline"
                    >
                      {risk.namaRisiko}
                    </Link>
                  </TableCell>
                  <TableCell>{risk.kategori.categoryBUMN}</TableCell>
                  <TableCell>{risk.ownerUnit.name}</TableCell>
                  <TableCell>
                    {risk.risikoInheren ? (
                      <Badge 
                        className={getRiskLevelColor(risk.risikoInheren.inherenLevel)}
                      >
                        {getRiskLevelText(risk.risikoInheren.inherenLevel)} 
                        ({risk.risikoInheren.inherenExposure})
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Belum dinilai</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {risk.risikoResidual ? (
                      <Badge 
                        className={getRiskLevelColor(risk.risikoResidual.residualLevel)}
                      >
                        {getRiskLevelText(risk.risikoResidual.residualLevel)} 
                        ({risk.risikoResidual.residualExposure})
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Belum dinilai</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/risks/${risk.id}`}>
                            Lihat Detail
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/risks/${risk.id}/edit`}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/risks/${risk.id}/assessment`}>
                            Penilaian
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}