'use client';
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
// export const links = [
//   { name: 'Home', href: '/dashboard', icon: HomeIcon },
//   {
//     name: 'Invoices',
//     href: '/dashboard/invoices',
//     icon: DocumentDuplicateIcon,
//   },
//   { name: 'Customers', href: '/dashboard/customers', icon: UserGroupIcon },

// ];

interface Link {
  name: string;
  href: string;
  icon: any;
}

export default function NavLink(link: Link) {
  const pathname = usePathname();
  const LinkIcon = link.icon;
  return (
    <Link
      key={link.name}
      href={link.href}
      className={clsx(
        'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-gray-100 hover:text-primary md:flex-none md:justify-start md:p-2 md:px-3',
        {
          'bg-gray-100 text-primary': pathname === link.href,
        },
      )}
    >
      <LinkIcon className="w-6" />
      <p className="hidden md:block">{link.name}</p>
    </Link>
  );
}
