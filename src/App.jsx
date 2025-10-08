import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Calculator, Cpu, Zap, Cloud, Server, DollarSign, TrendingUp, BarChart3, AlertTriangle, Info, Lightbulb } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import './App.css'

// Import data
import llmModels from './data/llm_models.json'
import gpuSpecs from './data/gpu_specifications.json'
import cloudPricing from './data/cloud_pricing.json'

// Import utilities
import { 
  calculateMemoryRequirement, 
  findOptimalGPUs, 
  calculateTCO, 
  calculateCloudTCO, 
  compareDeploymentOptions,
  generateSystemRecommendations 
} from './utils/calculator.js'

import { 
  validateCalculatorInputs, 
  getRecommendationWarnings, 
  validateModelCompatibility,
  getOptimizationSuggestions 
} from './utils/validation.js'

// Import components
import ModelComparison from './components/ModelComparison.jsx'
import MasterData from './components/MasterData.jsx'

// Import on-premises cost data
import onPremCosts from './data/onprem_costs.json'

function App() {
  const [selectedModel, setSelectedModel] = useState('')
  const [useCase, setUseCase] = useState('')
  const [quantization, setQuantization] = useState('fp16')
  const [deploymentType, setDeploymentType] = useState('on-premises')
  const [timeHorizon, setTimeHorizon] = useState('36')
  const [electricityCost, setElectricityCost] = useState('0.12')
  const [cloudProvider, setCloudProvider] = useState('aws')
  const [results, setResults] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})
  const [warnings, setWarnings] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [activeTab, setActiveTab] = useState('calculator')

  // Real-time validation
  useEffect(() => {
    const inputs = { selectedModel, useCase, timeHorizon, electricityCost }
    const validation = validateCalculatorInputs(inputs)
    setValidationErrors(validation.errors)
  }, [selectedModel, useCase, timeHorizon, electricityCost])

  // Model compatibility warnings
  useEffect(() => {
    if (selectedModel && useCase) {
      const model = llmModels.find(m => m.id === selectedModel)
      const compatibilityWarnings = validateModelCompatibility(model, useCase, quantization)
      setWarnings(compatibilityWarnings)
    }
  }, [selectedModel, useCase, quantization])

  const calculateRequirements = async () => {
    const inputs = { selectedModel, useCase, timeHorizon, electricityCost }
    const validation = validateCalculatorInputs(inputs)
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    setIsCalculating(true)
    
    // Simulate calculation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000))

    const model = llmModels.find(m => m.id === selectedModel)
    if (!model) return

    try {
      // Calculate memory requirement
      const requiredMemory = calculateMemoryRequirement(model, useCase, quantization)
      
      // Find optimal GPU configuration
      const gpuConfig = findOptimalGPUs(requiredMemory, gpuSpecs)
      
      // Calculate on-premises TCO
      const onPremTCO = calculateTCO(
        gpuConfig, 
        parseInt(timeHorizon), 
        parseFloat(electricityCost),
        deploymentType,
        onPremCosts
      )
      
      // Calculate cloud TCO
      const selectedCloudProvider = cloudPricing[cloudProvider]
      const cloudTCO = calculateCloudTCO(
        requiredMemory, 
        selectedCloudProvider, 
        parseInt(timeHorizon)
      )
      
      // Compare deployment options
      const comparison = compareDeploymentOptions(onPremTCO, cloudTCO)
      
      // Generate system recommendations
      const systemRecs = generateSystemRecommendations(gpuConfig, model)
      
      const calculationResults = {
        model,
        requiredMemory,
        gpuConfig,
        onPremTCO,
        cloudTCO,
        comparison,
        systemRecommendations: systemRecs,
        quantization
      }
      
      setResults(calculationResults)
      
      // Generate warnings and suggestions
      const resultWarnings = getRecommendationWarnings(calculationResults)
      const optimizationSuggestions = getOptimizationSuggestions(calculationResults)
      
      setWarnings([...warnings, ...resultWarnings])
      setSuggestions(optimizationSuggestions)
      
    } catch (error) {
      console.error('Calculation error:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Chart data preparation
  const prepareTCOChartData = () => {
    if (!results) return []
    
    const onPrem = results.onPremTCO
    const cloud = results.cloudTCO
    
    return [
      {
        name: 'On-Premises',
        CapEx: onPrem.capex.total,
        OpEx: onPrem.opex.total,
        Total: onPrem.tco.total
      },
      {
        name: 'Cloud',
        CapEx: 0,
        OpEx: cloud ? cloud.total_cost : 0,
        Total: cloud ? cloud.total_cost : 0
      }
    ]
  }

  const prepareCostBreakdownData = () => {
    if (!results) return []
    
    const tco = results.onPremTCO
    return [
      { name: 'GPU Hardware', value: tco.capex.gpu, color: '#00ff88' },
      { name: 'Server & Networking', value: tco.capex.server + tco.capex.networking, color: '#ff8c00' },
      { name: 'Power & Maintenance', value: tco.opex.total, color: '#00ffff' }
    ]
  }

  const prepareTCOTrendData = () => {
    if (!results) return []
    
    const months = parseInt(timeHorizon)
    const monthlyOpEx = results.onPremTCO.opex.total_monthly
    const capEx = results.onPremTCO.capex.total
    const cloudMonthlyCost = results.cloudTCO?.monthly_cost || 0
    
    const data = []
    for (let i = 1; i <= Math.min(months, 60); i++) {
      data.push({
        month: i,
        onPremises: capEx + (monthlyOpEx * i),
        cloud: cloudMonthlyCost * i
      })
    }
    
    return data
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-black" />
              </div>
              <h1 className="text-lg md:text-xl font-bold text-white">LLM Calculator</h1>
            </div>
            <nav className="flex items-center space-x-3 md:space-x-6">
              <button 
                onClick={() => setActiveTab('calculator')}
                className={`transition-colors text-sm md:text-base px-2 py-1 rounded ${activeTab === 'calculator' ? 'text-white bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
              >
                Calculator
              </button>
              <button 
                onClick={() => setActiveTab('comparison')}
                className={`transition-colors text-sm md:text-base px-2 py-1 rounded ${activeTab === 'comparison' ? 'text-white bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
              >
                Compare
              </button>
              <button 
                onClick={() => setActiveTab('master')}
                className={`transition-colors text-sm md:text-base px-2 py-1 rounded ${activeTab === 'master' ? 'text-white bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
              >
                Master
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-6 md:py-8 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              {activeTab === 'calculator' ? (
                <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
                  {/* Input Form */}
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Configuration
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        Select your LLM model and deployment requirements
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Model Selection */}
                      <div className="space-y-2">
                        <Label className="text-white">LLM Model</Label>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger className={`bg-white/5 border-white/20 text-white ${validationErrors.selectedModel ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            {llmModels.map(model => (
                              <SelectItem key={model.id} value={model.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{model.name}</span>
                                  <Badge variant="outline" className="ml-2">
                                    {model.parameters}B
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {validationErrors.selectedModel && (
                          <p className="text-red-400 text-sm">{validationErrors.selectedModel}</p>
                        )}
                      </div>

                      {/* Use Case */}
                      <div className="space-y-2">
                        <Label className="text-white">Use Case</Label>
                        <Select value={useCase} onValueChange={setUseCase}>
                          <SelectTrigger className={`bg-white/5 border-white/20 text-white ${validationErrors.useCase ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Select use case" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inference">Inference Only</SelectItem>
                            <SelectItem value="training">Training/Fine-tuning</SelectItem>
                          </SelectContent>
                        </Select>
                        {validationErrors.useCase && (
                          <p className="text-red-400 text-sm">{validationErrors.useCase}</p>
                        )}
                      </div>

                      {/* Quantization */}
                      <div className="space-y-2">
                        <Label className="text-white">Quantization</Label>
                        <Select value={quantization} onValueChange={setQuantization}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fp16">FP16 (Half Precision)</SelectItem>
                            <SelectItem value="int8">INT8 (8-bit)</SelectItem>
                            <SelectItem value="int4">INT4 (4-bit)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Cloud Provider Selection */}
                      <div className="space-y-2">
                        <Label className="text-white">Cloud Provider (for comparison)</Label>
                        <Select value={cloudProvider} onValueChange={setCloudProvider}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aws">Amazon Web Services</SelectItem>
                            <SelectItem value="gcp">Google Cloud Platform</SelectItem>
                            <SelectItem value="azure">Microsoft Azure</SelectItem>
                            <SelectItem value="oci">Oracle Cloud Infrastructure</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Additional Parameters */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Time Horizon (months)</Label>
                          <Input
                            type="number"
                            value={timeHorizon}
                            onChange={(e) => setTimeHorizon(e.target.value)}
                            className={`bg-white/5 border-white/20 text-white ${validationErrors.timeHorizon ? 'border-red-500' : ''}`}
                          />
                          {validationErrors.timeHorizon && (
                            <p className="text-red-400 text-sm">{validationErrors.timeHorizon}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Electricity Cost ($/kWh)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={electricityCost}
                            onChange={(e) => setElectricityCost(e.target.value)}
                            className={`bg-white/5 border-white/20 text-white ${validationErrors.electricityCost ? 'border-red-500' : ''}`}
                          />
                          {validationErrors.electricityCost && (
                            <p className="text-red-400 text-sm">{validationErrors.electricityCost}</p>
                          )}
                        </div>
                      </div>

                      {/* Warnings */}
                      {warnings.length > 0 && (
                        <div className="space-y-2">
                          {warnings.map((warning, index) => (
                            <Alert key={index} className="bg-yellow-500/10 border-yellow-500/20">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-yellow-400">
                                {warning.message}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      )}

                      <Button 
                        onClick={calculateRequirements}
                        className="w-full bg-gradient-to-r from-green-400 to-cyan-400 text-black hover:from-green-500 hover:to-cyan-500"
                        disabled={!selectedModel || !useCase || isCalculating || Object.keys(validationErrors).length > 0}
                      >
                        {isCalculating ? 'Calculating...' : 'Calculate Requirements'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Results */}
                  {results && (
                    <div className="space-y-6">
                      {/* Hardware Recommendations */}
                      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Server className="w-5 h-5" />
                            Hardware Recommendations
                          </CardTitle>
                          <CardDescription className="text-white/70">
                            Optimal configuration for {results.model.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Memory Requirements */}
                          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <h3 className="text-white font-semibold mb-2">Memory Requirements</h3>
                            <p className="text-white/80">
                              {results.requiredMemory} GB VRAM required ({quantization.toUpperCase()})
                            </p>
                          </div>

                          {/* GPU Recommendation */}
                          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                            <h3 className="text-white font-semibold mb-2">Recommended GPU</h3>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-white font-medium">{results.gpuConfig.recommended.name}</p>
                                <p className="text-white/70">{results.gpuConfig.recommended.vram} GB VRAM</p>
                                {results.gpuConfig.multiGpu && (
                                  <p className="text-orange-400">Requires {results.gpuConfig.gpuCount} GPUs</p>
                                )}
                              </div>
                              <Badge className="bg-green-500/20 text-green-400">
                                {formatCurrency(results.gpuConfig.recommended.price_usd)}
                              </Badge>
                            </div>
                          </div>

                          {/* System Specifications */}
                          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <h3 className="text-white font-semibold mb-2">Complete System</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-white/80">
                              <div>• GPU: {results.gpuConfig.gpuCount}x {results.gpuConfig.recommended.name}</div>
                              <div>• CPU: {results.systemRecommendations.cpu.cores} cores</div>
                              <div>• RAM: {results.systemRecommendations.memory.total_gb} GB</div>
                              <div>• Storage: {results.systemRecommendations.storage.capacity_gb} GB NVMe</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Deployment Comparison */}
                      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Deployment Comparison
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4 p-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-lg border border-green-500/20">
                            <h3 className="text-white font-semibold mb-2">Recommendation</h3>
                            <p className="text-white/80 capitalize">
                              <strong>{results.comparison.recommendation}</strong> - {results.comparison.reason}
                            </p>
                            {results.comparison.savings && (
                              <p className="text-green-400 mt-1">
                                Potential savings: {formatCurrency(results.comparison.savings)}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-white/5 rounded-lg">
                              <p className="text-white/70 text-sm">On-Premises TCO</p>
                              <p className="text-white font-semibold text-lg">
                                {formatCurrency(results.onPremTCO.tco.total)}
                              </p>
                              <p className="text-white/60 text-xs">
                                {formatCurrency(results.onPremTCO.tco.monthly_average)}/month avg
                              </p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg">
                              <p className="text-white/70 text-sm">Cloud TCO</p>
                              <p className="text-white font-semibold text-lg">
                                {results.cloudTCO ? formatCurrency(results.cloudTCO.total_cost) : 'N/A'}
                              </p>
                              {results.cloudTCO && (
                                <p className="text-white/60 text-xs">
                                  {formatCurrency(results.cloudTCO.monthly_cost)}/month
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Optimization Suggestions */}
                      {suggestions.length > 0 && (
                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Lightbulb className="w-5 h-5" />
                              Optimization Suggestions
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {suggestions.map((suggestion, index) => (
                              <Alert key={index} className="bg-blue-500/10 border-blue-500/20">
                                <Info className="h-4 w-4" />
                                <AlertDescription className="text-blue-400">
                                  <strong>{suggestion.title}:</strong> {suggestion.message}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </div>
              ) : activeTab === 'comparison' ? (
                <ModelComparison 
                  models={llmModels} 
                  onModelSelect={(modelId) => {
                    setSelectedModel(modelId)
                    setActiveTab('calculator')
                  }}
                />
              ) : (
                <MasterData 
                  llmModels={llmModels}
                  gpuSpecs={gpuSpecs}
                  cloudPricing={cloudPricing}
                  onPremCosts={onPremCosts}
                />
              )}

              {/* Charts Section */}
              {results && activeTab === 'calculator' && (
                <div className="mt-12">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {/* TCO Comparison Chart */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          TCO Comparison
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={prepareTCOChartData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                            <XAxis dataKey="name" stroke="#ffffff80" />
                            <YAxis stroke="#ffffff80" tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(0,0,0,0.8)', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px'
                              }}
                              formatter={(value) => [formatCurrency(value), '']}
                            />
                            <Bar dataKey="CapEx" stackId="a" fill="#00ff88" />
                            <Bar dataKey="OpEx" stackId="a" fill="#ff8c00" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Cost Breakdown Pie Chart */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Cost Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={prepareCostBreakdownData()}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {prepareCostBreakdownData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(0,0,0,0.8)', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px'
                              }}
                              formatter={(value) => [formatCurrency(value), '']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* TCO Trend Chart */}
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          TCO Over Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={prepareTCOTrendData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                            <XAxis dataKey="month" stroke="#ffffff80" />
                            <YAxis stroke="#ffffff80" tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(0,0,0,0.8)', 
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px'
                              }}
                              formatter={(value) => [formatCurrency(value), '']}
                            />
                            <Line type="monotone" dataKey="onPremises" stroke="#00ff88" strokeWidth={2} name="On-Premises" />
                            <Line type="monotone" dataKey="cloud" stroke="#ff8c00" strokeWidth={2} name="Cloud" />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-white/60 text-sm md:text-base">
            Built for AI/ML architects and enterprise clients to estimate compute needs for LLM deployment
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
