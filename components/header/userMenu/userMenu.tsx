'use client';

import {useState} from "react";
import useSWR, {mutate} from "swr";
import {User} from "@/lib/db/schema";
import {useRouter} from "next/navigation";
import {signOut} from "@/app/(login)/actions";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Home, LogOut} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function UserMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: user } = useSWR<User>('/api/user', fetcher);
    const router = useRouter();

    async function handleSignOut() {
        await signOut();
        mutate('/api/user');
        router.push('/');
    }

    if (!user) {
        return (
            <>
                <Link
                    href="/pricing"
                    className="text-sm font-medium text-gray-700 hover:text-primary"
                >
                    pricing
                </Link>
                <Button asChild className="rounded-full">
                    <Link href="/sign-in">sign in</Link>
                </Button>
            </>
        );
    }

    return (
        <>
            <Link
                href="/projects"
                className="text-sm font-medium text-gray-700 hover:text-primary"
            >
                projects
            </Link>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger>
                    <Avatar className="cursor-pointer size-9">
                        <AvatarImage alt={user.name || ''} />
                        <AvatarFallback>
                            {user.email
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="flex flex-col gap-1">
                    <DropdownMenuItem className="cursor-pointer">
                        <Link href="/dashboard" className="flex w-full items-center">
                            <Home className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </Link>
                    </DropdownMenuItem>
                    <form action={handleSignOut} className="w-full">
                        <button type="submit" className="flex w-full">
                            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign out</span>
                            </DropdownMenuItem>
                        </button>
                    </form>
                </DropdownMenuContent>
            </DropdownMenu>
        </>

    );
}