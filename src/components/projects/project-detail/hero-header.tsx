'use client';

/* eslint-disable @next/next/no-img-element -- this header uses duplicated icon layers for glow rendering */
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Project, ProjectHero, ProjectHeroAction } from '@/lib/projects';
import { cn } from '@/lib/utils';
import {
  DownloadIcon,
  ExternalLinkIcon,
  GlobeIcon,
  QrCodeIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { isExternalUrl } from './shared';

export function ProjectHeroIcon({
  project,
  imageSrc,
  compact = false,
}: {
  project: Project;
  imageSrc?: string;
  compact?: boolean;
}) {
  const logoSrc = imageSrc || project.logo;
  const iconSizeClass = compact
    ? 'size-[128px] sm:size-[144px] lg:size-[162px]'
    : 'size-[120px] sm:size-[144px] lg:size-[162px]';

  if (!logoSrc) {
    return null;
  }

  return (
    <div className="relative shrink-0">
      <div
        className="absolute inset-[14%] rounded-[24%] blur-2xl"
        style={{ backgroundColor: 'var(--project-hero-icon-glow)' }}
      />
      <div className="absolute inset-0 translate-y-2 scale-[0.94] opacity-40 blur-3xl">
        <img
          alt=""
          aria-hidden="true"
          className={cn(
            iconSizeClass,
            'rounded-[22.5%] object-cover grayscale saturate-50 contrast-125',
          )}
          src={logoSrc}
        />
      </div>
      <div
        className="relative overflow-hidden rounded-[22.5%] p-[1px] backdrop-blur-xl"
        style={{
          backgroundColor: 'var(--project-hero-surface-strong)',
          border: '0.5px solid var(--project-hero-border)',
          boxShadow: '0 24px 60px var(--project-hero-shadow)',
        }}
      >
        <img
          alt={`${project.name} logo`}
          className={cn(
            iconSizeClass,
            'rounded-[22%] bg-background object-cover',
          )}
          src={logoSrc}
        />
        <div className="pointer-events-none absolute inset-0 rounded-[22.5%] ring-1 ring-inset ring-white/10" />
      </div>
    </div>
  );
}

function HeroLinkAction({ action }: { action: ProjectHeroAction }) {
  if (!action.url) {
    return null;
  }

  const isPrimary = action.kind === 'website';
  const Icon = isPrimary ? GlobeIcon : DownloadIcon;
  const className = cn(
    'h-9 rounded-full border px-4 text-[12.5px] font-semibold shadow-[0_14px_32px_rgba(0,0,0,0.22)] backdrop-blur-md sm:h-10 sm:px-5 sm:text-[13px]',
    isPrimary
      ? 'border-white/18 bg-white text-black hover:bg-white/92'
      : 'border-white/14 bg-white/10 text-white hover:bg-white/18 hover:text-white',
  );

  if (isExternalUrl(action.url)) {
    return (
      <Button asChild className={className} size="lg">
        <a href={action.url} rel="noopener noreferrer" target="_blank">
          <Icon data-icon="inline-start" />
          <span>{action.label}</span>
          <ExternalLinkIcon data-icon="inline-end" />
        </a>
      </Button>
    );
  }

  return (
    <Button asChild className={className} size="lg">
      <Link href={action.url}>
        <Icon data-icon="inline-start" />
        {action.label}
      </Link>
    </Button>
  );
}

function HeroQrAction({
  action,
  projectName,
}: {
  action: ProjectHeroAction;
  projectName: string;
}) {
  if (!action.imageSrc) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="h-9 rounded-full border-white/14 bg-white/10 px-4 text-[12.5px] font-semibold text-white shadow-[0_14px_32px_rgba(0,0,0,0.18)] backdrop-blur-md hover:bg-white/18 hover:text-white sm:h-10 sm:px-5 sm:text-[13px]"
          size="lg"
          variant="outline"
        >
          <QrCodeIcon data-icon="inline-start" />
          {action.label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xs border-white/10 bg-black/92 text-white ring-1 ring-white/10">
        <DialogHeader>
          <DialogTitle>{projectName}</DialogTitle>
        </DialogHeader>
        <div className="overflow-hidden rounded-xl bg-white p-4">
          <img
            alt={`${projectName} 二维码`}
            className="mx-auto size-full object-contain"
            src={action.imageSrc}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HeroActionButton({
  action,
  projectName,
}: {
  action: ProjectHeroAction;
  projectName: string;
}) {
  if (action.kind === 'qr') {
    return <HeroQrAction action={action} projectName={projectName} />;
  }

  return <HeroLinkAction action={action} />;
}

function CompanyLink({ name, url }: { name?: string; url?: string }) {
  if (!name) {
    return null;
  }

  const className =
    'truncate text-[14px] leading-snug font-medium text-white/80 transition-opacity hover:opacity-80 sm:text-[16px]';

  if (!url) {
    return <p className={className}>{name}</p>;
  }

  if (isExternalUrl(url)) {
    return (
      <a className={className} href={url} rel="noreferrer" target="_blank">
        {name}
      </a>
    );
  }

  return (
    <Link className={className} href={url}>
      {name}
    </Link>
  );
}

export function ProjectHeroHeader({
  project,
  heroImage,
  heroPanel,
}: {
  project: Project;
  heroImage?: string;
  heroPanel: ProjectHero;
}) {
  const backgroundImageUrl = heroImage || project.logo;
  const animationStyles = `
    @keyframes shift-background {
      0% {
        background-position: 50% 50%;
        background-size: 100%;
        opacity: 0;
        transform: rotate(0);
      }

      10% {
        opacity: 0.5;
      }

      20% {
        background-position: 65% 25%;
        background-size: 160%;
        transform: rotate(45deg);
      }

      45% {
        background-position: 90% 60%;
        background-size: 250%;
        opacity: 0.5;
        transform: rotate(160deg);
      }

      70% {
        background-position: 70% 40%;
        background-size: 200%;
        opacity: 0.5;
        transform: rotate(250deg);
      }

      100% {
        background-position: 50% 50%;
        background-size: 100%;
        opacity: 0;
        transform: rotate(1turn);
      }
    }
  `;

  return (
    <section className="relative mb-4">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      <div
        style={
          {
            '--background-color': 'rgb(255, 255, 255)',
            '--background-image': `url(${backgroundImageUrl})`,
            '--blend-mode': 'plus-lighter',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          } as CSSProperties
        }
        className={cn(
          'relative flex h-[199px] items-center overflow-hidden text-(--systemPrimary-onDark) sm:h-71.5',
          'border-b border-b-(--systemQuaternary-vibrant)',
          'rounded-bl-[2px] rounded-br-[2px]',
          'bg-center bg-cover',
          '[background:linear-gradient(to_bottom,transparent_20%,rgba(0,0,0,.8)_100%),var(--background-image),var(--background-color,#000)]',
          '[transform:translate(0)]',
          'transition-[border-bottom-left-radius,border-bottom-right-radius]',
          'duration-[210ms] ease-out',
        )}
      >
        <div
          style={{
            backdropFilter: 'blur(100px) saturate(1.5)',
            position: 'absolute',
            height: '100%',
            width: '100%',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
        <div
          style={{
            animation: 'shift-background 60s linear 10s infinite',
            backgroundImage: 'var(--background-image)',
            backgroundRepeat: 'repeat',
            filter: 'brightness(1.3) saturate(0) blur(50px)',
            height: '500%',
            left: '0',
            mixBlendMode: 'overlay',
            opacity: '0',
            position: 'absolute',
            top: '0',
            transformOrigin: 'top center',
            width: '100%',
            zIndex: 2,
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-3 bg-linear-to-b from-black/10 via-black/30 to-black/75" />
        <div className="relative z-10 flex h-full w-full items-center px-4 py-5 sm:px-8 sm:py-7 lg:px-10">
          <div className="flex w-full items-center gap-5 sm:gap-6 lg:gap-8">
            <div className="self-center">
              <ProjectHeroIcon
                compact={Boolean(heroPanel.compact)}
                imageSrc={backgroundImageUrl}
                project={project}
              />
            </div>

            <div className="flex min-h-[128px] min-w-0 flex-1 flex-col justify-center gap-3 pt-1 sm:min-h-0 sm:gap-4 sm:pt-0">
              <div className="flex flex-col gap-1">
                <h1 className="title line-clamp-2 text-[22px] leading-[1.05] font-bold tracking-[-0.04em] text-white sm:text-[32px] lg:text-[36px]">
                  {project.name}
                </h1>
                <CompanyLink
                  name={heroPanel.companyName}
                  url={heroPanel.companyUrl}
                />
                {heroPanel.metaLine && (
                  <p className="text-[12px] leading-[1.4] text-white/72 sm:text-[14px]">
                    {heroPanel.metaLine}
                  </p>
                )}
              </div>

              {heroPanel.actions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:gap-3">
                  {heroPanel.actions.map((action) => (
                    <HeroActionButton
                      action={action}
                      key={`${action.kind}-${action.label}-${action.url || action.imageSrc || 'local'}`}
                      projectName={project.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
