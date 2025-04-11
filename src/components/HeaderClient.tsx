'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button'; // Assuming you use Shadcn UI button

export default function HeaderClient() {
    const auth = useAuth();

    return (
        <header className="bg-background shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand Name */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold text-primary">
                           Chatbot<span className='text-secondary'>Maker</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        {auth.isLoading ? (
                            <p>Loading...</p>
                        ) : auth.token ? (
                            <>
                                <Link href="/dashboard" className="text-foreground hover:text-primary transition-colors">
                                    Dashboard
                                </Link>
                                <Link href="/my-chatbots" className="text-foreground hover:text-primary transition-colors">
                                    My Chatbots
                                </Link>
                                <Link href="/insights" className="text-foreground hover:text-primary transition-colors">
                                    Insights
                                </Link>
                                {/* Add other authenticated links here if needed */}
                                <Button variant="ghost" onClick={auth.logout}>Logout</Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-foreground hover:text-primary transition-colors">
                                    Login
                                </Link>
                                <Link href="/register" className="text-foreground hover:text-primary transition-colors">
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
