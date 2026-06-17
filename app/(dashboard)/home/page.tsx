'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FacturasTab } from './FacturasTab';
import { AlmaDigitalTab } from './AlmaDigitalTab';
import { colors } from '@/lib/colors';

export default function HomePage() {
  return (
    <div className="w-full space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: colors.secondary }}>
          Inicio
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Vista analítica del sistema
        </p>
      </div>

      <Tabs defaultValue="alma-digital" className="w-full">
        <TabsList className="h-auto p-1 gap-1">
          <TabsTrigger
            value="alma-digital"
            className="text-sm px-4 py-2 data-[state=active]:bg-[#172C3B] data-[state=active]:text-white"
          >
            AlMa-Ops
          </TabsTrigger>
          <TabsTrigger
            value="facturas"
            className="text-sm px-4 py-2 data-[state=active]:bg-[#172C3B] data-[state=active]:text-white"
          >
            Facturas de entrada
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alma-digital" className="mt-5">
          <AlmaDigitalTab />
        </TabsContent>

        <TabsContent value="facturas" className="mt-5">
          <FacturasTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
