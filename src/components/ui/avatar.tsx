'use client';

import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarComponent({
  src,
  name,
  className,
  size = 'md',
  ...props
}: AvatarProps) {
  const [imgSrc, setImgSrc] = React.useState<string>('/uploads/avatars/default-avatar.png');
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (!src) {
      setImgSrc('/uploads/avatars/default-avatar.png');
      return;
    }

    // Toujours utiliser le chemin absolu pour l'affichage
    const fullPath = src.startsWith('http') ? src : `${window.location.origin}${src}`;
    setImgSrc(fullPath);
    setHasError(false);
  }, [src]);

  const initials = React.useMemo(() => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [name]);

  const handleError = () => {
    console.error('Avatar image failed to load:', imgSrc);
    setHasError(true);
    setImgSrc('/uploads/avatars/default-avatar.png');
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-base'
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)} {...props}>
      {!hasError ? (
        <AvatarImage 
          src={imgSrc} 
          onError={handleError}
          alt={name || 'Avatar'}
        />
      ) : (
        <AvatarFallback>
          {initials || (
            <img 
              src="/uploads/avatars/default-avatar.png" 
              alt="Default Avatar"
              className="h-full w-full object-cover"
            />
          )}
        </AvatarFallback>
      )}
    </Avatar>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
