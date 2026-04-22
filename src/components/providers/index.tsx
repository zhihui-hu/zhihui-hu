import BuildInfo from '@/components/build-info';
import { InteractiveGridBackground } from '@/components/home/interactive-grid-background';
import { NavigationProgress } from '@/components/navigation-progress';
import { ThemeProvider } from '@/components/theme/provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Suspense } from 'react';
import { Toaster } from 'sonner';

import { QueryProvider } from './query';

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <div className="relative min-h-screen">
          <InteractiveGridBackground className="fixed inset-0 z-0" />
          <div className="relative z-10">
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            <TooltipProvider>{children}</TooltipProvider>
          </div>
        </div>
        <BuildInfo />
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </QueryProvider>
  );
}
