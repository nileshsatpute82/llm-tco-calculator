import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Database, Cpu, Cloud, Zap } from 'lucide-react'

const MasterData = ({ llmModels, gpuSpecs, cloudPricing }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Master Data</h2>
        <p className="text-white/70">All underlying data used in calculations</p>
      </div>

      <Tabs defaultValue="llm-models" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="llm-models" className="data-[state=active]:bg-white/20">
            LLM Models
          </TabsTrigger>
          <TabsTrigger value="gpu-specs" className="data-[state=active]:bg-white/20">
            GPU Specifications
          </TabsTrigger>
          <TabsTrigger value="cloud-pricing" className="data-[state=active]:bg-white/20">
            Cloud Pricing
          </TabsTrigger>
        </TabsList>

        {/* LLM Models Tab */}
        <TabsContent value="llm-models" className="space-y-4">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5" />
                LLM Models Database
              </CardTitle>
              <CardDescription className="text-white/70">
                Memory requirements for different models and use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-3 font-semibold">Model Name</th>
                      <th className="text-left p-3 font-semibold">Parameters</th>
                      <th className="text-left p-3 font-semibold">Category</th>
                      <th className="text-center p-3 font-semibold">Inference FP16</th>
                      <th className="text-center p-3 font-semibold">Inference INT8</th>
                      <th className="text-center p-3 font-semibold">Inference INT4</th>
                      <th className="text-center p-3 font-semibold">Training FP16</th>
                      <th className="text-left p-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {llmModels.map((model, index) => (
                      <tr key={model.id} className={`border-b border-white/10 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                        <td className="p-3">
                          <div className="font-medium">{model.name}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {model.parameters}B
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                            {model.category}
                          </Badge>
                        </td>
                        <td className="p-3 text-center font-mono">
                          {model.memory_requirements.inference_fp16} GB
                        </td>
                        <td className="p-3 text-center font-mono">
                          {model.memory_requirements.inference_int8} GB
                        </td>
                        <td className="p-3 text-center font-mono">
                          {model.memory_requirements.inference_int4} GB
                        </td>
                        <td className="p-3 text-center font-mono">
                          {model.memory_requirements.training_fp16} GB
                        </td>
                        <td className="p-3 text-white/80 text-sm max-w-xs">
                          {model.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GPU Specifications Tab */}
        <TabsContent value="gpu-specs" className="space-y-4">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                GPU Specifications Database
              </CardTitle>
              <CardDescription className="text-white/70">
                Hardware specifications and pricing for available GPUs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-white">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-3 font-semibold">GPU Name</th>
                      <th className="text-center p-3 font-semibold">VRAM</th>
                      <th className="text-center p-3 font-semibold">Price (USD)</th>
                      <th className="text-center p-3 font-semibold">Power (W)</th>
                      <th className="text-center p-3 font-semibold">Architecture</th>
                      <th className="text-center p-3 font-semibold">Memory Bandwidth</th>
                      <th className="text-center p-3 font-semibold">Price/GB</th>
                      <th className="text-left p-3 font-semibold">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gpuSpecs.map((gpu, index) => (
                      <tr key={gpu.id} className={`border-b border-white/10 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                        <td className="p-3">
                          <div className="font-medium">{gpu.name}</div>
                        </td>
                        <td className="p-3 text-center font-mono">
                          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {gpu.vram} GB
                          </Badge>
                        </td>
                        <td className="p-3 text-center font-mono text-green-400">
                          {formatCurrency(gpu.price_usd)}
                        </td>
                        <td className="p-3 text-center font-mono">
                          {gpu.power_consumption}W
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            {gpu.architecture}
                          </Badge>
                        </td>
                        <td className="p-3 text-center font-mono">
                          {formatNumber(gpu.memory_bandwidth)} GB/s
                        </td>
                        <td className="p-3 text-center font-mono text-yellow-400">
                          {formatCurrency(Math.round(gpu.price_usd / gpu.vram))}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                            {gpu.category}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cloud Pricing Tab */}
        <TabsContent value="cloud-pricing" className="space-y-4">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Cloud Pricing Database
              </CardTitle>
              <CardDescription className="text-white/70">
                Instance types and pricing from major cloud providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(cloudPricing).map(([providerId, provider]) => (
                  <div key={providerId} className="space-y-3">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      {provider.name}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-white">
                        <thead>
                          <tr className="border-b border-white/20">
                            <th className="text-left p-3 font-semibold">Instance Type</th>
                            <th className="text-center p-3 font-semibold">GPU Type</th>
                            <th className="text-center p-3 font-semibold">GPU Count</th>
                            <th className="text-center p-3 font-semibold">Hourly Rate</th>
                            <th className="text-center p-3 font-semibold">Monthly Cost</th>
                            <th className="text-center p-3 font-semibold">Annual Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(provider.instances).map(([instanceName, instance], index) => (
                            <tr key={instanceName} className={`border-b border-white/10 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                              <td className="p-3">
                                <div className="font-medium font-mono">{instanceName}</div>
                              </td>
                              <td className="p-3 text-center">
                                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                  {instance.gpu}
                                </Badge>
                              </td>
                              <td className="p-3 text-center font-mono">
                                {instance.gpu_count}x
                              </td>
                              <td className="p-3 text-center font-mono text-green-400">
                                {formatCurrency(instance.hourly_rate)}/hr
                              </td>
                              <td className="p-3 text-center font-mono text-yellow-400">
                                {formatCurrency(instance.hourly_rate * 24 * 30)}
                              </td>
                              <td className="p-3 text-center font-mono text-red-400">
                                {formatCurrency(instance.hourly_rate * 24 * 365)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MasterData
