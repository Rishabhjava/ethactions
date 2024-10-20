'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

export default function Morpheus() {
  const [formData, setFormData] = useState({
    tab1: { field1: 'Your Name', field2: 'Your Morpheus Wallet Address' },
    tab2: { field1: 'Ticket Price', field2: 'Payment Wallet Address' },
    tab3: { field1: 'Yield', field2: 'Contract Address' },
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
    return `https://dial.to/?action=solana-action:https://ethactions.vercel.app/api/actions/donate-rbtc?to=${encodeURIComponent(field2)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Link copied to clipboard!'))
      .catch(err => console.error('Failed to copy: ', err))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground p-4">
        <h1 className="text-2xl font-bold">AirDAO on Twitter!</h1>
      </div>
      <div className="container mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tab1">Raise Funds</TabsTrigger>
            <TabsTrigger value="tab2">Sell Something</TabsTrigger>
            <TabsTrigger value="tab3">Stake Bitcoin</TabsTrigger>
          </TabsList>
          {['tab1', 'tab2', 'tab3'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${tab}-field1`}>{tab === 'tab1' ? 'Your Name' : tab === 'tab2' ? 'Ticket Price' : 'Yield'}</Label>
                  <Input
                    id={`${tab}-field1`}
                    value={formData[tab as keyof typeof formData].field1}
                    onChange={(e) => handleInputChange(tab, 'field1', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${tab}-field2`}>{tab === 'tab1' ? 'Your AirDAO Wallet Address' : tab === 'tab2' ? 'Payment Wallet Address' : 'Contract Address'}</Label>
                  <Input
                    id={`${tab}-field2`}
                    value={formData[tab as keyof typeof formData].field2}
                    onChange={(e) => handleInputChange(tab, 'field2', e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Input
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
