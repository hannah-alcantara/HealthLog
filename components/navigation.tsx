"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, useUser, UserButton, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { HealthLogIcon } from "@/components/health-log-icon";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Menu, Plus, X } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleLogSymptom = () => {
    router.push("/?action=log");
  };

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/symptoms", label: "Symptoms" },
    { href: "/appointments", label: "Appointments" },
  ];

  return (
    <nav className='sticky top-0 z-50 border-b bg-white/95 dark:bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60'>
      <div className='container mx-auto px-4'>
        <div className='max-w-7xl mx-auto flex h-16 items-center justify-between'>
          <div className='flex items-center gap-6'>
            <Link href='/' className='flex items-center gap-2'>
              <HealthLogIcon size={22} className='text-primary' />
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
                          ? "text-primary bg-muted"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
            {/* Log Symptom Button + User Button - Desktop Only */}
            {isLoaded && isSignedIn && (
              <div className='hidden md:flex items-center gap-3'>
                <Button
                  size='sm'
                  onClick={handleLogSymptom}
                  className='flex items-center gap-1.5'
                >
                  <Plus className='h-4 w-4' />
                  Log Symptom
                </Button>
                <UserButton />
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

            {/* Mobile Menu Drawer - Only for signed in users */}
            {isSignedIn && (
              <Drawer>
                <DrawerTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='md:hidden'
                    aria-label='Open navigation menu'
                  >
                    <Menu className='h-5 w-5' />
                  </Button>
                </DrawerTrigger>
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
                              <DrawerClose asChild>
                                <Link
                                  href={link.href}
                                  className={`block px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                                    isActive
                                      ? "text-primary bg-muted"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                  }`}
                                >
                                  {link.label}
                                </Link>
                              </DrawerClose>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>

                    {/* User Profile Section */}
                    {isLoaded && isSignedIn && (
                      <DrawerFooter className='space-y-2'>
                        <div className='flex items-center gap-3 p-2'>
                          <UserButton
                            appearance={{
                              elements: {
                                userButtonPopoverCard: "!z-[100] pointer-events-auto",
                                userButtonPopoverActionButton: "hover:bg-gray-100",
                              },
                            }}
                          />

                          <div className='flex flex-col flex-1 min-w-0 text-left'>
                            <span className='text-sm font-medium truncate'>
                              {user?.firstName || user?.username || "User"}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              {user?.primaryEmailAddress?.emailAddress}
                            </span>
                          </div>
                        </div>
                      </DrawerFooter>
                    )}
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
