'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

export default function Skale() {
  const [formData, setFormData] = useState({
    tab1: { field1: 'Your Name', field2: 'Your Skale Wallet Address' },
    tab2: { field1: 'Image URL', field2: 'Your Skale Wallet Address' },
    tab3: { field1: 'Event Banner', field2: 'Your Skale Wallet Address' },
  })

  const [activeTab, setActiveTab] = useState('tab1')

  const handleInputChange = (tab: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const generateOutputLink = (tab: string) => {
    const { field1, field2 } = formData[tab as keyof typeof formData]
    let baseUrl = ''
    
    switch (tab) {
      case 'tab1':
        baseUrl = 'https://ethactions.vercel.app/api/actions/donate-skale'
        return `https://dial.to/?action=solana-action:${baseUrl}?to=${encodeURIComponent(field2)}&amount=${encodeURIComponent(field1)}`
      case 'tab2':
        baseUrl = 'https://ethactions.vercel.app/api/actions/mint-skale'
        return `https://dial.to/?action=solana-action:${baseUrl}?imageUrl=${encodeURIComponent(field1)}&to=${encodeURIComponent(field2)}`
      case 'tab3':
        baseUrl = 'https://ethactions.vercel.app/api/actions/flow-tickets'
        return `https://dial.to/?action=solana-action:${baseUrl}?imageUrl=${encodeURIComponent(field1)}&to=${encodeURIComponent(field2)}`
      default:
        return ''
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Link copied to clipboard!'))
      .catch(err => console.error('Failed to copy: ', err))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground p-4">
        <h1 className="text-2xl font-bold">Skale: Twitter 🫂 Blockchain (Very Easy) 🔥</h1>
      </div>
      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tab1">Tip Creator</TabsTrigger>
            <TabsTrigger value="tab2">Mint NFT</TabsTrigger>
            <TabsTrigger value="tab3">Sell Tickets</TabsTrigger>
          </TabsList>
          {['tab1', 'tab2', 'tab3'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${tab}-field1`}>
                    {tab === 'tab1' ? 'Your Name' : tab === 'tab2' ? 'NFT Image URL' : 'Event Banner'}
                  </Label>
                  <Input
                    id={`${tab}-field1`}
                    value={formData[tab as keyof typeof formData].field1}
                    onChange={(e) => handleInputChange(tab, 'field1', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${tab}-field2`}>Your AirDAO Wallet Address</Label>
                  <Input
                    id={`${tab}-field2`}
                    value={formData[tab as keyof typeof formData].field2}
                    onChange={(e) => handleInputChange(tab, 'field2', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${tab}-link`}>Generated Link (Post on Twitter!)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                    id={`${tab}-link`}
                    value={generateOutputLink(tab)}
                    readOnly
                  />
                  <Button
                    size="icon"
                    onClick={() => copyToClipboard(generateOutputLink(tab))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {/* New iframe */}
                <div className="mt-4">
                  <Label>Preview:</Label>
                  <div className="mt-2 border border-gray-300 rounded-lg overflow-hidden">
                    <iframe
                      src={generateOutputLink(tab)}
                      className="w-full h-[500px]"
                      title="Generated Link Preview"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
