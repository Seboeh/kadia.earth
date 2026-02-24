import Link from "next/link";
import {Suspense} from "react";
import UserMenu from "@/components/header/userMenu/userMenu";
import Image from "next/image";

export default function Header() {
    return (
        <header className="border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/kadia-logo.svg"
                        alt="kadia logo"
                        width={30}
                        height={30}
                        className="h-8 w-8"
                        priority
                    />
                    <span className="ml-2 text-xl font-normal text-gray-900">
                        kadia<span className="text-[#2E5C55]">.</span>earth
                    </span>
                </Link>
                <div className="flex items-center space-x-4">
                    <Suspense fallback={<div className="h-9" />}>
                        <UserMenu />
                    </Suspense>
                </div>
            </div>
        </header>
    );
}
