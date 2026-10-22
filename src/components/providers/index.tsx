import { InteractiveGridBackground } from '@/components/home/interactive-grid-background';
import { ThemeProvider } from '@/components/theme/provider';
import { TooltipProvider } from '@/components/ui/tooltip';

import { AppUpdateChecker } from './app-update-checker';
import { QueryProvider } from './query';

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider>
      <AppUpdateChecker />
      <div className="relative min-h-screen">
        <InteractiveGridBackground className="fixed inset-0 z-0" />
        <div className="relative z-10">
          <QueryProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </QueryProvider>
        </div>
      </div>
    </ThemeProvider>
  );
}
