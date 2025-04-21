'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function HeaderClient() {
    const auth = useAuth();
    const pathname = usePathname();

    const getLinkClass = (href: string) => {
        const baseClass = "text-foreground hover:text-primary transition-colors";
        const activeClass = "bg-purple-100 text-purple-900 rounded px-2 py-1 font-medium";
        return pathname === href ? `${activeClass}` : baseClass;
    };

    return (
        <header className="bg-background shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand Name */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold text-violet-900 text-primary flex items-center gap-2">
                           <Image 
                             src="/genie-logo.png" 
                             alt="Genie Logo" 
                             width={56} 
                             height={56} 
                             className="rounded-full"
                           />
                           Bot<span className='text-secondary'>Genie</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        {auth.isLoading ? (
                            <p>Loading...</p>
                        ) : auth.token ? (
                            <>
                                <Link href="/dashboard" className={getLinkClass('/dashboard')}>
                                    Dashboard
                                </Link>
                                <Link href="/my-chatbots" className={getLinkClass('/my-chatbots')}>
                                    My Chatbots
                                </Link>
                                <Link href="/insights" className={getLinkClass('/insights')}>
                                    Insights
                                </Link>
                                {/* Add other authenticated links here if needed */}
                                <Button variant="ghost" onClick={auth.logout}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-black font-bold hover:text-foreground transition-colors">
                                    Login
                                </Link>
                                <Link href="/register" className="text-black font-bold hover:text-foreground transition-colors">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button (Optional) */}
                    <div className="md:hidden">
                        {/* Implement mobile menu toggle button here if needed */}
                    </div>
                </div>
            </nav>
        </header>
    );
}
