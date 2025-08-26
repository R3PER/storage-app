// src/app/admin/components/layout/AdminSidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BsBox,
  BsClock,
  BsGraphUp,
  BsGrid,
  BsPeople
} from 'react-icons/bs';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  href,
  icon,
  label,
  isActive
}) => (
  <Link
    href={href}
    className={`
      flex items-center px-4 py-3 text-sm font-medium
      ${isActive 
        ? 'bg-[#2C3440] text-white' 
        : 'text-gray-400 hover:bg-[#2C3440] hover:text-white'}
    `}
  >
    <span className="inline-flex items-center justify-center w-6 h-6 mr-3">
      {icon}
    </span>
    {label}
  </Link>
);

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-[#1E2530]">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center h-16 flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-white">
            Magazyn
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem
            href="/admin"
            icon={<BsGrid className="w-5 h-5" />}
            label="Dashboard"
            isActive={isActive('/admin')}
          />
          
          <NavItem
            href="/admin/products"
            icon={<BsBox className="w-5 h-5" />}
            label="Produkty"
            isActive={isActive('/admin/products')}
          />
          
          <NavItem
            href="/admin/stats"
            icon={<BsGraphUp className="w-5 h-5" />}
            label="Statystyki"
            isActive={isActive('/admin/stats')}
          />
          
          <NavItem
            href="/admin/history"
            icon={<BsClock className="w-5 h-5" />}
            label="Historia"
            isActive={isActive('/admin/history')}
          />
          
          <NavItem
            href="/admin/users"
            icon={<BsPeople className="w-5 h-5" />}
            label="Użytkownicy"
            isActive={isActive('/admin/users')}
          />
          
        </nav>
      </div>
    </aside>
  );
};
