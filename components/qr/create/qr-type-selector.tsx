'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import {
  QR_TYPES,
  QR_TYPE_CATEGORIES,
} from '@/lib/qr/types';

import { QRType } from '@/lib/types';
import { cn } from '@/lib/utils';

import {
  Bitcoin,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Contact,
  DollarSign,
  FileText,
  Flower2,
  Gift,
  HeartPulse,
  Home,
  Image as ImageIcon,
  Link,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  PawPrint,
  Phone,
  Search,
  Send,
  Share2,
  Smartphone,
  Star,
  Type,
  User,
  Users,
  UtensilsCrossed,
  Video,
  Wifi,
} from 'lucide-react';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

const ICONS: Record<
  string,
  React.ComponentType<{
    className?: string;
  }>
> = {
  Link,
  Type,
  Mail,
  Phone,
  MessageSquare,
  Wifi,
  Contact,
  FileText,
  Image: ImageIcon,
  Share2,
  Star,
  Calendar,
  UtensilsCrossed,
  Video,
  MessageCircle,
  Send,
  Smartphone,
  MapPin,
  Bitcoin,
  DollarSign,
  User,
  HeartPulse,
  PawPrint,
  Search,
  Flower2,
  Home,
  Gift,
  Users,
};

interface Props {
  type: QRType;
  onTypeChange: (type: QRType) => void;
}

export function QrTypeSelector({
  type,
  onTypeChange,
}: Props) {
  const tabsRef =
    useRef<HTMLDivElement>(null);

  const tabRefs = useRef<
    Record<
      string,
      HTMLButtonElement | null
    >
  >({});

  const [activeCategory, setActiveCategory] =
    useState('link');

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(false);

  const updateScrollButtons = () => {
    const element = tabsRef.current;

    if (!element) {
      return;
    }

    setCanScrollLeft(
      element.scrollLeft > 5
    );

    setCanScrollRight(
      element.scrollLeft +
        element.clientWidth <
        element.scrollWidth - 5
    );
  };

  useEffect(() => {
    updateScrollButtons();

    const element = tabsRef.current;

    if (!element) {
      return;
    }

    element.addEventListener(
      'scroll',
      updateScrollButtons
    );

    window.addEventListener(
      'resize',
      updateScrollButtons
    );

    return () => {
      element.removeEventListener(
        'scroll',
        updateScrollButtons
      );

      window.removeEventListener(
        'resize',
        updateScrollButtons
      );
    };
  }, []);

  useEffect(() => {
    tabRefs.current[
      activeCategory
    ]?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeCategory]);

  useEffect(() => {
    const categoryTypes = QR_TYPES.filter(
      (item) =>
        item.category === activeCategory
    );

    if (categoryTypes.length === 0) {
      return;
    }

    // Keep the current type if it already belongs
    // to the selected category.
    const currentTypeExists =
      categoryTypes.some(
        (item) => item.type === type
      );

    if (!currentTypeExists) {
      // Otherwise select the first QR type
      // from the active category.
      onTypeChange(
        categoryTypes[0].type
      );
    }
  }, [
    activeCategory,
    type,
    onTypeChange,
  ]);

  const scroll = (
    direction: 'left' | 'right'
  ) => {
    tabsRef.current?.scrollBy({
      left:
        direction === 'left'
          ? -240
          : 240,
      behavior: 'smooth',
    });
  };

  return (
    <section>
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            1
          </span>

          <h2 className="text-base font-semibold">
            Choose QR type
          </h2>
        </div>

        <p className="ml-8 mt-1 text-sm text-muted-foreground">
          What do you want your QR code to do?
        </p>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <div className="relative border-b border-border/70 bg-muted/[0.18]">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!canScrollLeft}
              onClick={() => scroll('left')}
              className={cn(
                  'absolute left-0 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-none rounded-r-lg border-l-0 bg-background shadow-sm',
                  !canScrollLeft &&
                    'pointer-events-none opacity-0'
                )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div
              ref={tabsRef}
              className="scrollbar-hide flex gap-1 overflow-x-auto px-11 py-2"
              role="tablist"
              aria-label="QR code categories"
            >
              {QR_TYPE_CATEGORIES.map(
                (category) => {
                  const active =
                    activeCategory ===
                    category.id;

                  return (
                    <button
                      key={category.id}
                      ref={(element) => {
                        tabRefs.current[
                          category.id
                        ] = element;
                      }}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() =>
                        setActiveCategory(
                          category.id
                        )
                      }
                      className={cn(
                        'shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        active
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-background hover:text-foreground'
                      )}
                    >
                      {category.label}
                    </button>
                  );
                }
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={!canScrollRight}
              onClick={() => scroll('right')}
              className={cn(
                'absolute right-0 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-none rounded-l-lg border-r-0 bg-background shadow-sm',
                !canScrollRight &&
                  'pointer-events-none opacity-0'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {QR_TYPES.filter(
                (item) =>
                  item.category ===
                  activeCategory
              ).map((item) => {
                const Icon =
                  ICONS[item.icon] || Link;

                const active =
                  item.type === type;

                return (
                  <button
                    key={item.type}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      onTypeChange(
                        item.type
                      )
                    }
                    className={cn(
                      'group relative flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      active
                        ? 'border-primary bg-primary/[0.06] shadow-sm ring-1 ring-primary'
                        : 'border-border/70 bg-background hover:border-primary/40 hover:bg-muted/30'
                    )}
                  >
                    {active && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}

                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground group-hover:text-foreground'
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>

                    <span className="text-xs font-semibold leading-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
