'use client';

import { useMutation } from "@tanstack/react-query";
import {Configuration, DefaultApi, Project} from "@/lib/openapi/generated";
import {projectsFacade} from "@/lib/api/project/projectsFacade";



export function useSaveProject() {
    return useMutation({
        mutationFn: async (project: Project) => {

            console.log("Kontext:", typeof window === "undefined" ? "Server" : "Browser");
            const result = projectsFacade.update(project);
            console.log(result);
            return result;
        },
    });
}
