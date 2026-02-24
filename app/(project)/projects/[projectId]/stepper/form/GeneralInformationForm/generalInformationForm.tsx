'use client';
import React from 'react';
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomBadge } from '@/components/ui/customBadge';
import { Chip } from '@/components/ui/chip';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {useProject, useProjectActions} from "@/app/(project)/projects/[projectId]/ProjectContext";
import {Button} from "@/components/ui/button";
import {useSaveProject} from "@/lib/hooks/useSaveProject";

const LocationMap = dynamic(
    () => import("@/components/ui/locationMap").then((mod) => mod.LocationMap),
    { ssr: false }
);

export function GeneralInformationForm() {

    /*const allocationSegments = [
        { name: 'Administration', percentage: 5, color: 'bg-primary/10' },
        { name: 'Education', percentage: 20, color: 'bg-primary/20' },
        { name: 'Land', percentage: 38, color: 'bg-primary/40' },
        { name: 'Preparation', percentage: 19, color: 'bg-primary/30' },
        { name: 'Long-term', percentage: 18, color: 'bg-primary/25' },
    ];

    const valueChainOptions = ['Own operations', 'Partners', 'Both'];
    const [selectedValueChain, setSelectedValueChain] = React.useState<string>('Own operations');*/

    const { entity: project } = useProject();
    const { mutate, isPending, isError, isSuccess } = useSaveProject();
    const { update } = useProjectActions();

    const handleSaveAction = () => {
        if(!project) {
            console.log("Project is null")
            return;
        }
        console.log("project update...")
        mutate(project)
    }

    return (
        <div className="space-y-6">
            {/* Location Map */}
            <div className="pb-2">
                <LocationMap onLocationChange={(location: string, coordinates: {lat: number, lng: number}) => {
                    console.log(location, coordinates)
                    update({projectGeneralInformation: {projectLocation: location, areaCoordinates: { longitude: coordinates.lng, latitude: coordinates.lat}}})
                }} />
            </div>

            {/* Project Overview */}
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="text-xl">project general information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="projectName">project name</Label>
                            <Input
                                id="projectName"
                                placeholder="e.g., tainforest protection — madre de dios"
                                value={project?.projectGeneralInformation?.title ?? ""}
                                onChange={(e) => {
                                    update({projectGeneralInformation: { title: e.target.value }})
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="projectRegion">Project Location / Region</Label>
                            <Input
                                id="projectRegion"
                                placeholder="e.g., Peru, Madre de Dios"
                                value={project?.projectGeneralInformation?.projectLocation ?? ""}
                                disabled={true}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Button disabled={isPending} onClick={handleSaveAction}>save</Button>

            {/*<Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="text-xl">Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="projectName">Project Name</Label>
                            <Input
                                id="projectName"
                                placeholder="e.g., Rainforest Protection — Madre de Dios"
                                value={projectData.projectName}
                                onChange={(e) => setProjectData(prev => ({ ...prev, projectName: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="projectRegion">Project Location / Region</Label>
                            <Input
                                id="projectRegion"
                                placeholder="e.g., Peru, Madre de Dios"
                                value={projectData.projectRegion}
                                onChange={(e) => setProjectData(prev => ({ ...prev, projectRegion: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="respPerson">Project Lead</Label>
                            <Input
                                id="respPerson"
                                placeholder="e.g., Maria Santos"
                                value={projectData.respPerson}
                                onChange={(e) => setProjectData(prev => ({ ...prev, respPerson: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                placeholder="e.g., Green Impact Corp"
                                value={projectData.companyName}
                                onChange={(e) => setProjectData(prev => ({ ...prev, companyName: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reportingYear">Reporting Year</Label>
                            <Input
                                id="reportingYear"
                                type="number"
                                value={projectData.reportingYear}
                                onChange={(e) => setProjectData(prev => ({ ...prev, reportingYear: parseInt(e.target.value) }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contributionEUR">Contribution (€)</Label>
                            <Input
                                id="contributionEUR"
                                type="number"
                                value={projectData.contributionEUR}
                                onChange={(e) => setProjectData(prev => ({ ...prev, contributionEUR: parseInt(e.target.value) }))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

             Allocation of Contribution
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="text-xl">Allocation of Contribution (€)</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Fixed percentage breakdown of your {projectData.contributionEUR.toLocaleString()}€ contribution
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex h-6 rounded-full overflow-hidden bg-muted">
                            {allocationSegments.map((segment) => (
                                <div
                                    key={segment.name}
                                    className={`${segment.color} flex items-center justify-center text-xs font-medium text-primary-foreground`}
                                    style={{ width: `${segment.percentage}%` }}
                                >
                                    {segment.percentage > 15 && `${segment.percentage}%`}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {allocationSegments.map((segment) => (
                                <div key={segment.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded ${segment.color}`} />
                                        <span className="text-sm">{segment.name}</span>
                                    </div>
                                    <CustomBadge variant="secondary" size="sm">
                                        €{Math.round((projectData.contributionEUR * segment.percentage) / 100).toLocaleString()}
                                    </CustomBadge>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

                <Accordion type="multiple" defaultValue={["vsme-basis", "vsme-governance", "vsme-transparenz"]} className="space-y-4">
                     Projektbasisdaten (B1)
                    <AccordionItem value="vsme-basis" className="border rounded-lg bg-card shadow-card">
                        <AccordionTrigger className="px-6">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">Projektbasisdaten</CardTitle>
                                <CustomBadge variant="secondary" size="sm">B1</CustomBadge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="projekttraeger">Projektträger (NGO) <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="projekttraeger"
                                            placeholder="e.g., WWF Deutschland"
                                            value={projectData.projekttraeger}
                                            onChange={(e) => setProjectData(prev => ({ ...prev, projekttraeger: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="partnerNGO">Partner-NGO</Label>
                                        <Input
                                            id="partnerNGO"
                                            placeholder="e.g., Local Conservation NGO"
                                            value={projectData.partnerNGO}
                                            onChange={(e) => setProjectData(prev => ({ ...prev, partnerNGO: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="laufzeitStart">Laufzeit Start <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="laufzeitStart"
                                            type="date"
                                            value={projectData.laufzeitStart}
                                            onChange={(e) => setProjectData(prev => ({ ...prev, laufzeitStart: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="laufzeitEnd">Laufzeit Ende <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="laufzeitEnd"
                                            type="date"
                                            value={projectData.laufzeitEnd}
                                            onChange={(e) => setProjectData(prev => ({ ...prev, laufzeitEnd: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="geokoordinaten">Geokoordinaten</Label>
                                        <Input
                                            id="geokoordinaten"
                                            placeholder="e.g., -12.5, -69.2"
                                            value={projectData.geokoordinaten}
                                            onChange={(e) => setProjectData(prev => ({ ...prev, geokoordinaten: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="biome">Biome</Label>
                                        <Input
                                            id="biome"
                                            placeholder="e.g., Tropical Rainforest"
                                            value={projectData.biome}
                                            onChange={(e) => setProjectData(prev => ({ ...prev, biome: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="schutzgebiet">Schutzgebiet</Label>
                                        <Input
                                            id="schutzgebiet"
                                            placeholder="e.g., National Park, UNESCO Site"
                                            value={projectData.schutzgebiet}
                                            onChange={(e) => setProjectData(prev => ({ ...prev, schutzgebiet: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                     Projektbeschreibung & Governance (B2)
                    <AccordionItem value="vsme-governance" className="border rounded-lg bg-card shadow-card">
                        <AccordionTrigger className="px-6">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">Projektbeschreibung & Governance</CardTitle>
                                <CustomBadge variant="secondary" size="sm">B2</CustomBadge>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="zieleUndMassnahmen">Ziele und Maßnahmen <span className="text-muted-foreground text-xs">(Narrativ)</span></Label>
                                    <Textarea
                                        id="zieleUndMassnahmen"
                                        placeholder="Beschreiben Sie die Projektziele und geplante Maßnahmen..."
                                        className="min-h-[120px]"
                                        value={projectData.zieleUndMassnahmen}
                                        onChange={(e) => setProjectData(prev => ({ ...prev, zieleUndMassnahmen: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="governanceStruktur">Governance-Struktur im Projekt <span className="text-muted-foreground text-xs">(Rolle von NGO vs. Unternehmen)</span></Label>
                                    <Textarea
                                        id="governanceStruktur"
                                        placeholder="Beschreiben Sie die Rollen und Verantwortlichkeiten..."
                                        className="min-h-[100px]"
                                        value={projectData.governanceStruktur}
                                        onChange={(e) => setProjectData(prev => ({ ...prev, governanceStruktur: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Standards/Zertifizierungen <span className="text-muted-foreground text-xs">(Mixed)</span></Label>
                                    <div className="flex flex-wrap gap-2">
                                        {['FSC', 'FairTrade', 'EMAS', 'ISO 14001', 'Gold Standard', 'VCS'].map((standard) => (
                                            <Chip
                                                key={standard}
                                                selected={projectData.standards.includes(standard)}
                                                onClick={() => {
                                                    setProjectData(prev => ({
                                                        ...prev,
                                                        standards: prev.standards.includes(standard)
                                                            ? prev.standards.filter(s => s !== standard)
                                                            : [...prev.standards, standard]
                                                    }));
                                                }}
                                            >
                                                {standard}
                                            </Chip>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                     Transparenz & Compliance (C5, C7, B11)
                    <AccordionItem value="vsme-transparenz" className="border rounded-lg bg-card shadow-card">
                        <AccordionTrigger className="px-6">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">Transparenz & Compliance</CardTitle>
                                <div className="flex gap-1">
                                    <CustomBadge variant="secondary" size="sm">C5</CustomBadge>
                                    <CustomBadge variant="secondary" size="sm">C7</CustomBadge>
                                    <CustomBadge variant="secondary" size="sm">B11</CustomBadge>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <Label>Finanzflüsse <span className="text-muted-foreground text-xs">(Datenbasiert)</span></Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="coFinanzierung" className="text-sm">Co-Finanzierung (€)</Label>
                                            <Input
                                                id="coFinanzierung"
                                                type="number"
                                                placeholder="0"
                                                value={projectData.coFinanzierung || ''}
                                                onChange={(e) => setProjectData(prev => ({ ...prev, coFinanzierung: parseInt(e.target.value) || 0 }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="unternehmensbeitrag" className="text-sm">Unternehmensbeitrag (€)</Label>
                                            <Input
                                                id="unternehmensbeitrag"
                                                type="number"
                                                placeholder="0"
                                                value={projectData.unternehmensbeitrag || ''}
                                                onChange={(e) => setProjectData(prev => ({ ...prev, unternehmensbeitrag: parseInt(e.target.value) || 0 }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="eigenmittelNGO" className="text-sm">Eigenmittel NGO (€)</Label>
                                            <Input
                                                id="eigenmittelNGO"
                                                type="number"
                                                placeholder="0"
                                                value={projectData.eigenmittelNGO || ''}
                                                onChange={(e) => setProjectData(prev => ({ ...prev, eigenmittelNGO: parseInt(e.target.value) || 0 }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="konflikteVorfaelle">Konflikte / bestätigte Vorfälle <span className="text-muted-foreground text-xs">(Menschenrechte, Umwelt)</span></Label>
                                    <Textarea
                                        id="konflikteVorfaelle"
                                        placeholder="Beschreiben Sie relevante Konflikte oder Vorfälle..."
                                        className="min-h-[80px]"
                                        value={projectData.konflikteVorfaelle}
                                        onChange={(e) => setProjectData(prev => ({ ...prev, konflikteVorfaelle: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kontrollmechanismen">Kontrollmechanismen gegen Korruption/Bestechung</Label>
                                    <Textarea
                                        id="kontrollmechanismen"
                                        placeholder="Beschreiben Sie Kontroll- und Präventionsmaßnahmen..."
                                        className="min-h-[80px]"
                                        value={projectData.kontrollmechanismen}
                                        onChange={(e) => setProjectData(prev => ({ ...prev, kontrollmechanismen: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>*/}
        </div>
    );
}
