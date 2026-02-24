import {Configuration, DefaultApi, Project} from "@/lib/openapi/generated";


const config: Configuration = new Configuration({
    basePath: "/api/v1",
    fetchApi: fetch
})
const api = new DefaultApi(config);

export const projectsFacade = {
    async update(project: Project) {
        return await api.updateProjectById({
            projectId: String(project.id!),
            project: project
        });
    },
    async getAll(): Promise<Project[]> {
        return await api.projectsGet();
    }
};
