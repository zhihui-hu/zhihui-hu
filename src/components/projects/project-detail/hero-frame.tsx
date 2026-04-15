'use client';

/* eslint-disable @next/next/no-img-element -- this frame needs direct image sampling and decorative layers */
import { cn } from '@/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useState } from 'react';

type ProjectHeroFrameProps = {
  children: ReactNode;
  className?: string;
  image?: string;
};

type RgbColor = [number, number, number];

const FALLBACK_BASE: RgbColor = [70, 110, 170];

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function mixColor(color: RgbColor, target: RgbColor, amount: number): RgbColor {
  return [
    clampChannel(color[0] + (target[0] - color[0]) * amount),
    clampChannel(color[1] + (target[1] - color[1]) * amount),
    clampChannel(color[2] + (target[2] - color[2]) * amount),
  ];
}

function withAlpha(color: RgbColor, alpha: number) {
  return `rgba(${color[0]} ${color[1]} ${color[2]} / ${alpha})`;
}

function buildPalette(base: RgbColor) {
  const bright = mixColor(base, [255, 255, 255], 0.24);
  const soft = mixColor(base, [255, 255, 255], 0.42);
  const deep = mixColor(base, [0, 0, 0], 0.28);

  return {
    '--project-hero-primary': withAlpha(bright, 0.52),
    '--project-hero-secondary': withAlpha(soft, 0.34),
    '--project-hero-tertiary': withAlpha(deep, 0.28),
    '--project-hero-glow': withAlpha(
      mixColor(base, [255, 255, 255], 0.58),
      0.16,
    ),
  } as CSSProperties;
}

async function sampleImageColor(src: string) {
  const image = new window.Image();
  image.crossOrigin = 'anonymous';
  image.decoding = 'async';
  image.referrerPolicy = 'no-referrer';

  const color = await new Promise<RgbColor | null>((resolve) => {
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context) {
          resolve(null);
          return;
        }

        canvas.width = 24;
        canvas.height = 24;
        context.drawImage(image, 0, 0, 24, 24);

        const pixels = context.getImageData(0, 0, 24, 24).data;
        let totalWeight = 0;
        let red = 0;
        let green = 0;
        let blue = 0;
        let fallbackWeight = 0;
        let fallbackRed = 0;
        let fallbackGreen = 0;
        let fallbackBlue = 0;

        for (let index = 0; index < pixels.length; index += 4) {
          const alpha = pixels[index + 3];

          if (alpha < 96) {
            continue;
          }

          const r = pixels[index];
          const g = pixels[index + 1];
          const b = pixels[index + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const brightness = (r + g + b) / 3;
          const saturation = max - min;

          fallbackWeight += 1;
          fallbackRed += r;
          fallbackGreen += g;
          fallbackBlue += b;

          if (brightness > 242 && saturation < 18) {
            continue;
          }

          if (brightness < 18) {
            continue;
          }

          const weight = 1 + saturation / 64;

          totalWeight += weight;
          red += r * weight;
          green += g * weight;
          blue += b * weight;
        }

        if (totalWeight > 0) {
          resolve([
            clampChannel(red / totalWeight),
            clampChannel(green / totalWeight),
            clampChannel(blue / totalWeight),
          ]);
          return;
        }

        if (fallbackWeight > 0) {
          resolve([
            clampChannel(fallbackRed / fallbackWeight),
            clampChannel(fallbackGreen / fallbackWeight),
            clampChannel(fallbackBlue / fallbackWeight),
          ]);
          return;
        }

        resolve(null);
      } catch {
        resolve(null);
      }
    };

    image.onerror = () => resolve(null);
    image.src = src;
  });

  return color;
}

export function ProjectHeroFrame({
  children,
  className,
  image,
}: ProjectHeroFrameProps) {
  const [palette, setPalette] = useState<CSSProperties>(() =>
    buildPalette(FALLBACK_BASE),
  );

  useEffect(() => {
    let cancelled = false;

    if (!image) {
      return () => {
        cancelled = true;
      };
    }

    sampleImageColor(image)
      .then((sampled) => {
        if (cancelled) {
          return;
        }

        setPalette(buildPalette(sampled || FALLBACK_BASE));
      })
      .catch(() => {
        if (!cancelled) {
          setPalette(buildPalette(FALLBACK_BASE));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [image]);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[2rem] border border-border/60',
        className,
      )}
      style={palette}
    >
      <div className="absolute inset-[-24%] opacity-95 blur-3xl">
        <div
          className="absolute inset-0 motion-safe:animate-spin [animation-duration:96s]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 24%, var(--project-hero-primary), transparent 34%), radial-gradient(circle at 82% 18%, var(--project-hero-secondary), transparent 32%), radial-gradient(circle at 50% 80%, var(--project-hero-tertiary), transparent 42%)',
          }}
        />
        {image && (
          <img
            alt=""
            aria-hidden="true"
            className="absolute inset-[12%] h-[76%] w-[76%] rounded-full object-cover opacity-20 mix-blend-soft-light"
            src={image}
          />
        )}
      </div>

      <div
        className="absolute inset-[-12%] opacity-85 blur-2xl"
        style={{
          backgroundImage:
            'linear-gradient(135deg, var(--project-hero-glow) 0%, transparent 55%), radial-gradient(circle at 72% 72%, var(--project-hero-secondary), transparent 36%)',
        }}
      />

      <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] bg-background/60 backdrop-blur-3xl" />
      <div className="absolute inset-0 bg-linear-to-br from-background/18 via-transparent to-background/48" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
