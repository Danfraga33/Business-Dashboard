import { useState } from "react";
import { Tabs, Tab } from "../../components/Tabs";
import { StatCard } from "../../components/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Shield,
  Target,
  TrendingUp,
  Lock,
  Zap,
  Users,
} from "lucide-react";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[15px] text-muted-foreground mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-[15px] font-mono" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

const MOAT_COLORS = ["oklch(0.85 0.08 55)", "oklch(0.65 0.19 145)", "oklch(0.75 0.15 65)", "oklch(0.637 0.237 25.331)", "oklch(0.627 0.265 303.9)"];

export default function ProductDefensibility() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="font-serif text-3xl font-semibold text-foreground leading-tight">
          Product Defensibility
        </h2>
        <p className="text-base text-muted-foreground mt-1">
          <span className="font-sans">Product positioning, MOAT targeting, and competitive advantages</span>
        </p>
      </div>

      <Tabs defaultTab={0}>
        {/* Positioning Tab */}
        <Tab label="Positioning">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                label="Brand Awareness"
                value="42%"
                className="animate-in stagger-1"
              />
              <StatCard
                label="Market Position"
                value="#2 Leader"
                className="animate-in stagger-1"
              />
              <StatCard
                label="Differentiation Score"
                value="7.8/10"
                className="animate-in stagger-2"
              />
              <StatCard
                label="Customer Satisfaction"
                value="4.6/5.0"
                className="animate-in stagger-2"
              />
            </div>

            <div className="card animate-in stagger-3">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="font-sans">Market Positioning</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-base font-medium text-foreground mb-2">Primary Value Prop</p>
                  <p className="text-base text-secondary-foreground">
                    Fastest deployment for enterprise teams with zero-downtime scaling
                  </p>
                </div>
                <div>
                  <p className="text-base font-medium text-foreground mb-2">Competitive Advantage</p>
                  <p className="text-base text-secondary-foreground">
                    1) Proprietary auto-scaling algorithm | 2) Industry-leading uptime (99.99%) | 3) Native multi-region support
                  </p>
                </div>
                <div>
                  <p className="text-base font-medium text-foreground mb-2">Target Persona</p>
                  <p className="text-base text-secondary-foreground">
                    Engineering leaders at Series B-D SaaS companies (50-500 engineers)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Tab>

        {/* MOAT Targeting Tab */}
        <Tab label="MOAT Targeting">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                label="Network Effects"
                value="6/10"
                className="animate-in stagger-1"
              />
              <StatCard
                label="Switching Costs"
                value="8/10"
                className="animate-in stagger-1"
              />
              <StatCard
                label="Scale Advantages"
                value="7/10"
                className="animate-in stagger-2"
              />
              <StatCard
                label="Overall MOAT"
                value="7.2/10"
                className="animate-in stagger-2"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card animate-in stagger-3">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-sans">MOAT Sources</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Lock className="w-4 h-4 text-success mt-1 shrink-0" />
                    <div>
                      <p className="text-base font-medium text-foreground">Data Network Effects</p>
                      <p className="text-[15px] text-muted-foreground mt-1">Customer data improving product for all</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="w-4 h-4 text-success mt-1 shrink-0" />
                    <div>
                      <p className="text-base font-medium text-foreground">High Switching Costs</p>
                      <p className="text-[15px] text-muted-foreground mt-1">Infrastructure integrations deeply embedded</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lock className="w-4 h-4 text-warning mt-1 shrink-0" />
                    <div>
                      <p className="text-base font-medium text-foreground">Brand Recognition</p>
                      <p className="text-[15px] text-muted-foreground mt-1">Growing but still building mindshare</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card animate-in stagger-3">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-sans">Strategic Initiatives</span>
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-base font-medium text-foreground">1. Deepen network effects</p>
                    <p className="text-[15px] text-secondary-foreground mt-1">Build customer council & expand API ecosystem</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-base font-medium text-foreground">2. Increase switching costs</p>
                    <p className="text-[15px] text-secondary-foreground mt-1">Native integrations with top 10 enterprise tools</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-base font-medium text-foreground">3. Brand building</p>
                    <p className="text-[15px] text-secondary-foreground mt-1">Industry analyst relations & conference speaking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
