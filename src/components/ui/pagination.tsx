import { Link } from '@tanstack/react-router';
import { Button } from './button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export function Pagination({
  href,
  current,
  limit,
  totalPages,
}: {
  href: string;
  current: number;
  limit: number;
  totalPages: number;
}) {
  function getPageNumbers() {
    const pageNumbers: number[] = [];

    if (totalPages <= 5) {
      // If we have 5 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (current <= 3) {
        // Near the start: show pages 1-5
        pageNumbers.push(1, 2, 3, 4, 5);
      } else if (current >= totalPages - 2) {
        // Near the end: show the last 5 pages
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // In the middle: show current page with 2 before and 2 after
        for (let i = current - 2; i <= current + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }

    return pageNumbers;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex gap-1">
        <Button asChild variant="outline" size="sm" disabled={current === 1}>
          <Link
            to={href}
            search={{
              page: 1,
              limit,
            }}
          >
            <ChevronsLeft />
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" disabled={current === 1}>
          <Link
            to={href}
            search={{
              page: current - 1,
              limit,
            }}
          >
            <ChevronLeft />
          </Link>
        </Button>
        {pageNumbers.map((page) => (
          <Button
            key={page}
            asChild
            variant="outline"
            size="sm"
            className={current === page ? 'bg-muted' : ''}
          >
            <Link
              to={href}
              search={{
                page,
                limit,
              }}
            >
              {page}
            </Link>
          </Button>
        ))}
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={current === totalPages}
        >
          <Link
            to={href}
            search={{
              page: current + 1,
              limit,
            }}
          >
            <ChevronRight />
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={current === totalPages}
        >
          <Link
            to={href}
            search={{
              page: totalPages,
              limit,
            }}
          >
            <ChevronsRight />
          </Link>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {totalPages === 0 ? '0 of 0' : `Page ${current} of ${totalPages}`}
      </p>
    </div>
  );
}
