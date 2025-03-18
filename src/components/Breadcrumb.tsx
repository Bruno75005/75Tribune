import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-mutedLight:foreground dark:text-muted:foreground mb-6">
      <Link 
        href="/"
        className="hover:text-primary transition-colors"
      >
        Accueil
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-mutedLight:foreground dark:text-muted:foreground" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-lightText dark:text-darkText">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}