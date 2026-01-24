'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { ClientMap } from '@/components/dashboard/client-map'
import { ClientRegistry } from '@/components/dashboard/client-registry'
import { SMSGateway } from '@/components/dashboard/sms-gateway'
import { LoanQueue } from '@/components/dashboard/loan-queue'
import { LiveTrafficChart } from '@/components/dashboard/live-traffic-chart'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { AuditLogs } from '@/components/dashboard/audit-logs'
import { Terminal, Radio } from 'lucide-react'
import { useIsMobile, useIsTablet } from '@/hooks/use-media-query'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <motion.div
            key="dashboard"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4 md:space-y-6"
          >
            {/* Stats */}
            <StatsCards />

            {/* Main Grid - Stack on mobile, side by side on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Client Map - Full width on mobile */}
              <div className="lg:col-span-2 h-[300px] sm:h-[400px] lg:h-[500px]">
                <ClientMap />
              </div>

              {/* SMS Gateway */}
              <div className="order-first lg:order-none">
                <SMSGateway />
              </div>
            </div>

            {/* Live Traffic & Client Registry */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <LiveTrafficChart />
              <div className="h-[350px] sm:h-[400px] overflow-auto">
                <ClientRegistry />
              </div>
            </div>
          </motion.div>
        )

      case 'client-map':
        return (
          <motion.div
            key="client-map"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]"
          >
            <ClientMap />
          </motion.div>
        )

      case 'terminals':
        return (
          <motion.div
            key="terminals"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4 md:space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center flex-shrink-0">
                <Terminal className="w-5 h-5 text-teal" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">Live Terminals</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Monitor and manage active device sessions</p>
              </div>
            </div>
            <ClientRegistry />
          </motion.div>
        )

      case 'loan-desk':
        return (
          <motion.div
            key="loan-desk"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <LoanQueue />
          </motion.div>
        )

      case 'gateway':
        return (
          <motion.div
            key="gateway"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center flex-shrink-0">
                <Radio className="w-5 h-5 text-teal" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">Gateway Settings</h1>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Configure SMS delivery providers</p>
              </div>
            </div>
            <SMSGateway />
          </motion.div>
        )

      case 'audit-logs':
        return (
          <motion.div
            key="audit-logs"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <AuditLogs />
          </motion.div>
        )

      default:
        return null
    }
  }

  // Calculate sidebar width based on collapsed state and screen size
  const getSidebarWidth = () => {
    if (isMobile) return 0
    if (isTablet) return sidebarCollapsed ? 72 : 200
    return sidebarCollapsed ? 72 : 240
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && (
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          isTablet={isTablet}
        />
      )}

      {/* Header */}
      <Header 
        sidebarWidth={getSidebarWidth()} 
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <main
        className="pt-16 md:pt-20 pb-20 md:pb-8 px-3 sm:px-4 md:px-6 transition-all duration-300 ease-out"
        style={{ marginLeft: getSidebarWidth() }}
      >
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {/* Background Grid Effect */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 169, 157, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 169, 157, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  )
}
