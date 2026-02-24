"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Button} from "@/components/ui/button";
import {MoreHorizontal} from "lucide-react";
import Link from "next/link";

type ProjectRow = {
    id: number;
    projectGeneralInformation: {
        title: string | null;
        sponsor: string | null;
    } | null;
};

export const columns: ColumnDef<ProjectRow>[] = [
    {
        accessorKey: "id",
        header: "id",
    },
    {
        accessorKey: "projectGeneralInformation.title",
        header: "title",
    },
    {
        accessorKey: "projectGeneralInformation.sponsor",
        header: "sponsor",
    },
    {
        id: "actions",
        cell: ({ row }) => {

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                            <Link href={`/projects/${row.original.id}`}>open details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem disabled={true}>archive project</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );

        },
    },
]
