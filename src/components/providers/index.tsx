import BuildInfo from '@/components/build-info';
import { NavigationProgress } from '@/components/navigation-progress';
import { ThemeProvider } from '@/components/theme/provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';

import { QueryProvider } from './query';

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <NavigationProgress />
        <TooltipProvider>{children}</TooltipProvider>
        <BuildInfo />
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </QueryProvider>
  );
}
