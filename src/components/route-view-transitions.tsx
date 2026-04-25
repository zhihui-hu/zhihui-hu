import { ViewTransition, type ViewTransitionClassPerType } from 'react';

export const ROUTE_LIST_NAVIGATION_TRANSITION = 'route-list-navigation';

export function getSharedTitleTransitionName(scope: string, slug: string) {
  return `${scope}-title-${slug}`;
}

export function getSharedMediaTransitionName(scope: string, slug: string) {
  return `${scope}-media-${slug}`;
}

export function SharedElementTransition({
  children,
  name,
  share = 'route-shared-title',
}: {
  children: React.ReactNode;
  name: string;
  share?: ViewTransitionClassPerType[string];
}) {
  return (
    <ViewTransition
      default="none"
      name={name}
      share={{
        [ROUTE_LIST_NAVIGATION_TRANSITION]: 'none',
        default: share,
      }}
    >
      {children}
    </ViewTransition>
  );
}
