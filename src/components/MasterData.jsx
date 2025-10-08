import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Database, Cpu, Cloud, Zap } from 'lucide-react'

const MasterData = ({ llmModels, gpuSpecs, cloudPricing, onPremCosts, cloudOpCosts }) => {
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
        <TabsList className="grid w-full grid-cols-5 bg-white/10">
          <TabsTrigger value="llm-models" className="data-[state=active]:bg-white/20">
            LLM Models
          </TabsTrigger>
          <TabsTrigger value="gpu-specs" className="data-[state=active]:bg-white/20">
            GPU Specifications
          </TabsTrigger>
          <TabsTrigger value="cloud-pricing" className="data-[state=active]:bg-white/20">
            Cloud Pricing
          </TabsTrigger>
          <TabsTrigger value="onprem-costs" className="data-[state=active]:bg-white/20">
            On-Prem Costs
          </TabsTrigger>
          <TabsTrigger value="cloud-ops" className="data-[state=active]:bg-white/20">
            Cloud Ops
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

        {/* On-Premises Costs Tab */}
        <TabsContent value="onprem-costs" className="space-y-4">
          <div className="grid gap-4">
            {/* Datacenter Costs */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Datacenter Infrastructure Costs
                </CardTitle>
                <CardDescription className="text-white/70">
                  Physical infrastructure and facility costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-2 text-white font-medium">Cost Category</th>
                        <th className="text-left p-2 text-white font-medium">Rate</th>
                        <th className="text-left p-2 text-white font-medium">Unit</th>
                        <th className="text-left p-2 text-white font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {onPremCosts && Object.entries(onPremCosts.datacenterCosts).map(([key, cost]) => (
                        <tr key={key} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-2 text-white">{cost.name}</td>
                          <td className="p-2 text-white">
                            {formatCurrency(cost.costPerMonth || cost.costPerKW || cost.baseCost || cost.costPerPort)}
                          </td>
                          <td className="p-2 text-white/70">{cost.unit}</td>
                          <td className="p-2 text-white/70 text-xs">{cost.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Staffing Costs */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Staffing Costs
                </CardTitle>
                <CardDescription className="text-white/70">
                  Personnel costs for GPU infrastructure management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-2 text-white font-medium">Role</th>
                        <th className="text-left p-2 text-white font-medium">Annual Cost</th>
                        <th className="text-left p-2 text-white font-medium">Unit</th>
                        <th className="text-left p-2 text-white font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {onPremCosts && Object.entries(onPremCosts.staffingCosts).map(([key, cost]) => (
                        <tr key={key} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-2 text-white">{cost.name}</td>
                          <td className="p-2 text-white">
                            {formatCurrency(
                              cost.annualSalary ? cost.annualSalary * (1 + (cost.benefits || 0)) :
                              cost.annualAllocation || cost.monthlyCost * 12
                            )}
                          </td>
                          <td className="p-2 text-white/70">{cost.unit}</td>
                          <td className="p-2 text-white/70 text-xs">{cost.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Operational Costs */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Operational & Hidden Costs
                </CardTitle>
                <CardDescription className="text-white/70">
                  Ongoing operational expenses and hidden costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Operational Costs */}
                  <div>
                    <h4 className="text-white font-medium mb-2">Operational Costs</h4>
                    <div className="space-y-2 text-sm">
                      {onPremCosts && Object.entries(onPremCosts.operationalCosts).map(([key, cost]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-white/70">{cost.name}:</span>
                          <span className="text-white">
                            {cost.percentageOfPower ? `${(cost.percentageOfPower * 100)}% of power` :
                             cost.percentageOfHardware ? `${(cost.percentageOfHardware * 100)}% of hardware` :
                             cost.percentageOfTotal ? `${(cost.percentageOfTotal * 100)}% of total` :
                             formatCurrency(cost.annualCost)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hidden Costs */}
                  <div>
                    <h4 className="text-white font-medium mb-2">Hidden Costs</h4>
                    <div className="space-y-2 text-sm">
                      {onPremCosts && Object.entries(onPremCosts.hiddenCosts).map(([key, cost]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-white/70">{cost.name}:</span>
                          <span className="text-white">
                            {cost.percentageOfHardware ? `${(cost.percentageOfHardware * 100)}% of hardware` :
                             formatCurrency(cost.annualCostPerPerson || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scaling Factors */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Scaling Factors
                </CardTitle>
                <CardDescription className="text-white/70">
                  Cost multipliers based on deployment size
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-2 text-white font-medium">Deployment Size</th>
                        <th className="text-left p-2 text-white font-medium">Staffing Multiplier</th>
                        <th className="text-left p-2 text-white font-medium">Infrastructure Multiplier</th>
                        <th className="text-left p-2 text-white font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {onPremCosts && Object.entries(onPremCosts.scalingFactors).map(([key, factor]) => (
                        <tr key={key} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-2 text-white">{factor.name}</td>
                          <td className="p-2 text-white">{factor.staffingMultiplier}x</td>
                          <td className="p-2 text-white">{factor.infrastructureMultiplier}x</td>
                          <td className="p-2 text-white/70 text-xs">{factor.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cloud Operational Costs Tab */}
        <TabsContent value="cloud-ops" className="space-y-4">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Cloud Operational Costs
              </CardTitle>
              <CardDescription className="text-white/70">
                Additional operational costs for cloud deployments often overlooked in basic TCO calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="staffing" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white/5">
                  <TabsTrigger value="staffing" className="data-[state=active]:bg-white/10">Staffing</TabsTrigger>
                  <TabsTrigger value="operational" className="data-[state=active]:bg-white/10">Operational</TabsTrigger>
                  <TabsTrigger value="compliance" className="data-[state=active]:bg-white/10">Compliance</TabsTrigger>
                  <TabsTrigger value="scaling" className="data-[state=active]:bg-white/10">Scaling</TabsTrigger>
                </TabsList>

                <TabsContent value="staffing" className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left p-2 text-white font-medium">Role</th>
                          <th className="text-left p-2 text-white font-medium">Annual Salary</th>
                          <th className="text-left p-2 text-white font-medium">Benefits</th>
                          <th className="text-left p-2 text-white font-medium">Allocation</th>
                          <th className="text-left p-2 text-white font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cloudOpCosts && Object.entries(cloudOpCosts.cloudOperationalCosts.staffingCosts).map(([key, staff]) => (
                          <tr key={key} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-2 text-white">{staff.title}</td>
                            <td className="p-2 text-white">{formatCurrency(staff.annualSalary)}</td>
                            <td className="p-2 text-white">{(staff.benefits * 100).toFixed(0)}%</td>
                            <td className="p-2 text-white">{(staff.allocation * 100).toFixed(0)}%</td>
                            <td className="p-2 text-white/70 text-xs">{staff.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="operational" className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left p-2 text-white font-medium">Service</th>
                          <th className="text-left p-2 text-white font-medium">Monthly Cost</th>
                          <th className="text-left p-2 text-white font-medium">Scaling</th>
                          <th className="text-left p-2 text-white font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cloudOpCosts && Object.entries(cloudOpCosts.cloudOperationalCosts.operationalCosts).map(([key, ops]) => (
                          <tr key={key} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-2 text-white">{ops.title}</td>
                            <td className="p-2 text-white">{formatCurrency(ops.monthlyCost)}</td>
                            <td className="p-2 text-white">
                              <Badge variant="outline" className="text-xs">
                                {ops.scalingFactor === 'per_gpu' ? 'Per GPU' : 'Fixed'}
                              </Badge>
                            </td>
                            <td className="p-2 text-white/70 text-xs">{ops.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left p-2 text-white font-medium">Service</th>
                          <th className="text-left p-2 text-white font-medium">Cost</th>
                          <th className="text-left p-2 text-white font-medium">Frequency</th>
                          <th className="text-left p-2 text-white font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cloudOpCosts && Object.entries(cloudOpCosts.cloudOperationalCosts.complianceAndAudit).map(([key, comp]) => (
                          <tr key={key} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-2 text-white">{comp.title}</td>
                            <td className="p-2 text-white">
                              {comp.annualCost ? formatCurrency(comp.annualCost) : formatCurrency(comp.monthlyCost)}
                            </td>
                            <td className="p-2 text-white">
                              <Badge variant="outline" className="text-xs">
                                {comp.frequency || 'Monthly'}
                              </Badge>
                            </td>
                            <td className="p-2 text-white/70 text-xs">{comp.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="scaling" className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left p-2 text-white font-medium">Deployment Scale</th>
                          <th className="text-left p-2 text-white font-medium">Staffing Multiplier</th>
                          <th className="text-left p-2 text-white font-medium">Operational Multiplier</th>
                          <th className="text-left p-2 text-white font-medium">Compliance Multiplier</th>
                          <th className="text-left p-2 text-white font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cloudOpCosts && Object.entries(cloudOpCosts.cloudOperationalCosts.scalingFactors).map(([key, factor]) => (
                          <tr key={key} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-2 text-white">{factor.description}</td>
                            <td className="p-2 text-white">{factor.staffingMultiplier}x</td>
                            <td className="p-2 text-white">{factor.operationalMultiplier}x</td>
                            <td className="p-2 text-white">{factor.complianceMultiplier}x</td>
                            <td className="p-2 text-white/70 text-xs">{factor.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MasterData
