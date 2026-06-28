import { createFileRoute } from "@tanstack/react-router";
import {
  Wallet,
  Users,
  CalendarDays,
  CheckCircle2,
  Activity,
  TrendingUp,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [{ title: "Dashboard — PULSE OS" }],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Good evening."
        description="A snapshot of revenue, clients and upcoming work across PULSE Visuals."
        actions={
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/crm"><Plus className="mr-1 h-4 w-4" /> New customer</Link>
          </Button>
        }
      />

      <div className="px-6 py-8 sm:px-10">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Revenue (MTD)" value="€ 0" delta={{ value: "—", positive: true }} icon={Wallet} index={0} />
          <StatCard label="Active clients" value="0" icon={Users} index={1} />
          <StatCard label="Upcoming events" value="0" icon={CalendarDays} index={2} />
          <StatCard label="Open tasks" value="0" icon={CheckCircle2} index={3} />
        </div>

        {/* Widgets grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-2 border border-border bg-card"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Performance</div>
                <h2 className="mt-1 font-display text-base font-semibold">Revenue trajectory</h2>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </header>
            <div className="p-5">
              <EmptyState
                icon={TrendingUp}
                title="No revenue data yet"
                description="Once invoices flow through PULSE OS, your revenue trajectory will appear here."
              />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-border bg-card"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Activity</div>
                <h2 className="mt-1 font-display text-base font-semibold">Recent activity</h2>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </header>
            <div className="p-5">
              <EmptyState
                icon={Activity}
                title="Quiet for now"
                description="Activity from your team will stream in real-time."
              />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="border border-border bg-card"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Schedule</div>
                <h2 className="mt-1 font-display text-base font-semibold">Upcoming events</h2>
              </div>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </header>
            <div className="p-5">
              <EmptyState icon={CalendarDays} title="Nothing scheduled" />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 border border-border bg-card"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Tasks</div>
                <h2 className="mt-1 font-display text-base font-semibold">My tasks</h2>
              </div>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </header>
            <div className="p-5">
              <EmptyState
                icon={CheckCircle2}
                title="All clear"
                description="Tasks assigned to you will appear here."
              />
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}