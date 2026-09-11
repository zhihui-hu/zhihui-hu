'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AppUpdateChecker() {
  const [available, setAvailable] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || typeof Worker === 'undefined')
      return;
    let worker: Worker;
    try {
      worker = new Worker('/assets/app-update-checker.worker.js', {
        name: 'app-update-checker',
      });
    } catch {
      return;
    }
    let notified = false;
    const check = () => {
      if (document.visibilityState === 'hidden' || notified) return;
      worker.postMessage({
        type: 'check',
        url: new URL('/', window.location.origin).href,
      });
    };
    worker.onmessage = ({ data }) => {
      if (data?.type === 'changed' && !notified) {
        notified = true;
        setAvailable(true);
      }
    };
    document.addEventListener('visibilitychange', check);
    const interval = window.setInterval(check, 60_000);
    check();
    return () => {
      document.removeEventListener('visibilitychange', check);
      window.clearInterval(interval);
      worker.terminate();
    };
  }, []);

  if (!available) return null;

  return (
    <div
      role="status"
      className="bg-card fixed right-4 bottom-4 left-4 z-50 flex items-center gap-3 rounded-xl border p-4 shadow-lg sm:left-auto sm:max-w-md"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">发现新版本</p>
        <p className="text-muted-foreground mt-1 text-xs">
          更新已准备好，刷新即可体验。
        </p>
      </div>
      <Button
        size="sm"
        disabled={updating}
        onClick={() => {
          setUpdating(true);
          const url = new URL(window.location.href);
          url.searchParams.set('t', Date.now().toString());
          window.location.replace(url.href);
        }}
      >
        {updating ? '正在更新…' : '刷新更新'}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="关闭更新提示"
        disabled={updating}
        onClick={() => setAvailable(false)}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
