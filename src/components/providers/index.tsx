import { InteractiveGridBackground } from '@/components/home/interactive-grid-background';
import { ThemeProvider } from '@/components/theme/provider';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen">
        <InteractiveGridBackground className="fixed inset-0 z-0" />
        <div className="relative z-10">
          <TooltipProvider>{children}</TooltipProvider>
        </div>
      </div>
    </ThemeProvider>
  );
}
