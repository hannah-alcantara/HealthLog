"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BandageIcon } from "@/components/icons/BandageIcon";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Menu, X } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/symptoms", label: "Symptoms" },
    { href: "/appointments", label: "Appointments" },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className='sticky top-0 z-50 border-b bg-white/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          <div className='flex items-center gap-6'>
            <Link href='/' className='flex items-center gap-2'>
              <BandageIcon className='w-8 h-8 text-primary' />
              <span className='text-xl font-bold'>HealthLog</span>
            </Link>
            {/* Desktop Navigation - Only show for signed in users */}
            {isSignedIn && (
              <div className='hidden md:flex gap-4'>
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "text-primary dark:bg-gray-800 dark:text-gray-100"
                          : "bg-text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className='flex items-center gap-4'>
            {/* User Button - Desktop Only */}
            {isLoaded && isSignedIn && (
              <div className='hidden md:block'>
                <UserButton afterSignOutUrl='/' />
              </div>
            )}

            {/* Sign in/up buttons for unauthenticated users */}
            {isLoaded && !isSignedIn && (
              <div className='flex gap-2'>
                <Link href='/sign-in'>
                  <Button variant='outline' size='sm'>
                    Sign In
                  </Button>
                </Link>
                <Link href='/sign-up'>
                  <Button size='sm'>Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button - Only for signed in users */}
            {isSignedIn && (
              <Button
                variant='ghost'
                size='sm'
                className='md:hidden'
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label='Open navigation menu'
              >
                <Menu className='h-5 w-5' />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DrawerContent side='right' className='md:hidden'>
          <div className='flex flex-col h-full'>
            {/* Header */}
            <DrawerHeader>
              <DrawerTitle>Menu</DrawerTitle>
              <DrawerClose asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  aria-label='Close navigation menu'
                >
                  <X className='h-5 w-5' />
                </Button>
              </DrawerClose>
            </DrawerHeader>

            {/* Navigation Links */}
            <nav className='flex-1 p-4 overflow-y-auto'>
              <ul className='space-y-2'>
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeMobileMenu}
                        className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "text-primary dark:bg-gray-800 dark:text-gray-100"
                            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User Profile Section */}
            {isLoaded && isSignedIn && (
              <DrawerFooter>
                <div className='flex items-center gap-3'>
                  <UserButton afterSignOutUrl='/' />
                  <div className='flex flex-col flex-1 min-w-0'>
                    <span className='text-sm font-medium truncate'>
                      {user?.firstName || user?.username || "User"}
                    </span>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>
                      Manage account
                    </span>
                  </div>
                </div>
              </DrawerFooter>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </nav>
  );
}
