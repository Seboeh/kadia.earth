import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {PlusIcon} from "lucide-react";
import {DataTable} from "@/components/ui/data-table";
import {columns} from "@/app/(project)/projects/columns";
import Link from "next/link";
import {db} from "@/lib/db/drizzle";

export const dynamic = "force-dynamic";

export default async function projectOverview() {

    const projects = await db.query.project.findMany({
      with: {
        projectGeneralInformation: true
      }
    });

    return (
        <main className="xl:min-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

            <Card>
                <CardHeader>
                    <h3 className="text-sm font-medium text-primary">
                        manage your projects
                    </h3>
                </CardHeader>
                <CardContent>
                    <Button><Link href="/project">new project</Link><span><PlusIcon/></span></Button>
                </CardContent>
            </Card>

            <div className="container mx-auto py-10">
                <DataTable columns={columns} data={projects} />
            </div>
        </main>
    )
}
