import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Cpu, Zap, DollarSign, Clock } from 'lucide-react'

const ModelComparison = ({ models, onModelSelect }) => {
  const [selectedModels, setSelectedModels] = useState([])
  const [comparisonData, setComparisonData] = useState([])

  const toggleModelSelection = (modelId) => {
    const newSelection = selectedModels.includes(modelId)
      ? selectedModels.filter(id => id !== modelId)
      : [...selectedModels, modelId].slice(0, 4) // Limit to 4 models

    setSelectedModels(newSelection)
    
    // Update comparison data
    const compareModels = models.filter(m => newSelection.includes(m.id))
    setComparisonData(compareModels.map(model => ({
      name: model.name.replace(/\s+/g, '\n'),
      parameters: model.parameters,
      inference_memory: model.memory_requirements.inference_fp16,
      training_memory: model.memory_requirements.training_fp16
    })))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Model Comparison
          </CardTitle>
          <CardDescription className="text-white/70">
            Compare different LLM models to find the best fit for your use case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {models.map(model => (
              <div
                key={model.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedModels.includes(model.id)
                    ? 'bg-green-500/20 border-green-500/50'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
                onClick={() => toggleModelSelection(model.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">{model.name}</h3>
                  <Badge variant="outline" className="text-white/80">
                    {model.parameters}B
                  </Badge>
                </div>
                <p className="text-white/60 text-sm mb-3">{model.description}</p>
                <div className="space-y-1 text-xs text-white/70">
                  <div className="flex justify-between">
                    <span>Inference (FP16):</span>
                    <span>{model.memory_requirements.inference_fp16} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Training (FP16):</span>
                    <span>{model.memory_requirements.training_fp16} GB</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3 bg-gradient-to-r from-green-400 to-cyan-400 text-black hover:from-green-500 hover:to-cyan-500"
                  onClick={(e) => {
                    e.stopPropagation()
                    onModelSelect(model.id)
                  }}
                >
                  Select Model
                </Button>
              </div>
            ))}
          </div>

          {comparisonData.length > 0 && (
            <Tabs defaultValue="memory" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/10">
                <TabsTrigger value="memory" className="text-white">Memory Requirements</TabsTrigger>
                <TabsTrigger value="parameters" className="text-white">Model Size</TabsTrigger>
                <TabsTrigger value="performance" className="text-white">Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="memory" className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#ffffff80" 
                      fontSize={12}
                      interval={0}
                    />
                    <YAxis 
                      stroke="#ffffff80" 
                      tickFormatter={(value) => `${value} GB`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value} GB`, '']}
                    />
                    <Bar dataKey="inference_memory" fill="#00ff88" name="Inference" />
                    <Bar dataKey="training_memory" fill="#ff8c00" name="Training" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="parameters" className="mt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#ffffff80" 
                      fontSize={12}
                      interval={0}
                    />
                    <YAxis 
                      stroke="#ffffff80" 
                      tickFormatter={(value) => `${value}B`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [`${value}B Parameters`, '']}
                    />
                    <Bar dataKey="parameters" fill="#00ffff" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="performance" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {models.filter(m => selectedModels.includes(m.id)).map(model => (
                    <Card key={model.id} className="bg-white/5 border-white/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-lg">{model.name}</CardTitle>
                        <Badge className="w-fit">{model.category}</Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-white/80">
                          <Cpu className="w-4 h-4" />
                          <span className="text-sm">{model.parameters}B parameters</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                          <Zap className="w-4 h-4" />
                          <span className="text-sm">
                            {model.memory_requirements.inference_fp16 < 20 ? 'Fast' : 
                             model.memory_requirements.inference_fp16 < 50 ? 'Medium' : 'Slow'} inference
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            {model.parameters < 10 ? 'Quick' : 
                             model.parameters < 50 ? 'Moderate' : 'Long'} training time
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ModelComparison
