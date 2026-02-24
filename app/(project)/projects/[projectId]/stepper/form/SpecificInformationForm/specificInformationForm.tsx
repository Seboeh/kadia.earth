import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomBadge } from '@/components/ui/customBadge';
import { Chip } from '@/components/ui/chip';
import { LocationMap } from '@/components/ui/locationMap';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
type Framework = 'VSME' | 'CSRD';


export function SpecificInformationForm() {
    const [bioData, setBioData] = React.useState({
        // B3, B4 - Environmental impacts
        co2Einsparung: 0,
        externeRisiken: false,
        risikenBedeutung: 'Mittel' as 'Hoch' | 'Mittel' | 'Gering',
        umweltverschmutzungMassnahmen: '',
        bodenWasserLuftVerbesserungen: '',
        // B5 - Biodiversity core
        fokusarten: [] as string[],
        lebensraeume: [] as string[],
        oekosystemleistungen: [] as string[],
        flaecheHa: 0,
        baselineDaten: '',
        wirkungsmessung: '',
        // B6 - Water
        wasserRelevant: false,
        wasserverbrauchDaten: '',
        wasserNutzenCommunities: '',
        // B8, B10, C5, C6 - Social impacts
        nutzenCommunities: '',
        beschaeftigung: '',
        geschlechtergerecht: '',
        trainings: '',
        einkommenVorteile: '',
        menschenrechtsPolicies: '',
    });

    const [customArt, setCustomArt] = React.useState('');
    const [customLebensraum, setCustomLebensraum] = React.useState('');

    const oekosystemleistungenOptions = [
        'Wasserversorgung',
        'Bestäubung',
        'Kohlenstoffspeicherung',
        'Bodenfruchtbarkeit',
        'Klimaregulierung',
        'Hochwasserschutz'
    ];

    const framework: Framework = 'VSME';

    return (
        <div className="space-y-6">
                <>
                    {/* VSME Environmental Impacts */}
                    <Accordion type="multiple" defaultValue={["umwelt", "biodiv", "wasser", "sozial"]} className="space-y-4">
                        {/* Umweltwirkungen (B3, B4) */}
                        <AccordionItem value="umwelt" className="border rounded-lg bg-card shadow-card">
                            <AccordionTrigger className="px-6">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg">Umweltwirkungen</CardTitle>
                                    <div className="flex gap-1">
                                        <CustomBadge variant="secondary" size="sm">B3</CustomBadge>
                                        <CustomBadge variant="secondary" size="sm">B4</CustomBadge>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="co2Einsparung">CO₂-Einsparung oder Bindung <span className="text-muted-foreground text-xs">(t CO₂e)</span></Label>
                                        <Input
                                            id="co2Einsparung"
                                            type="number"
                                            placeholder="0"
                                            value={bioData.co2Einsparung || ''}
                                            onChange={(e) => setBioData(prev => ({ ...prev, co2Einsparung: parseFloat(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Information ob externe Projektrisiken bestehen</Label>
                                        <div className="flex gap-2">
                                            <Chip
                                                selected={bioData.externeRisiken === true}
                                                onClick={() => setBioData(prev => ({ ...prev, externeRisiken: true }))}
                                            >
                                                Ja
                                            </Chip>
                                            <Chip
                                                selected={bioData.externeRisiken === false}
                                                onClick={() => setBioData(prev => ({ ...prev, externeRisiken: false }))}
                                            >
                                                Nein
                                            </Chip>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="risikenBedeutung">Einschätzung der Bedeutung der Risiken/Chancen</Label>
                                        <Select
                                            value={bioData.risikenBedeutung}
                                            onValueChange={(value: 'Hoch' | 'Mittel' | 'Gering') =>
                                                setBioData(prev => ({ ...prev, risikenBedeutung: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Hoch">Hoch</SelectItem>
                                                <SelectItem value="Mittel">Mittel</SelectItem>
                                                <SelectItem value="Gering">Gering</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="umweltverschmutzungMassnahmen">Maßnahmen zur Vermeidung von Umweltverschmutzung <span className="text-muted-foreground text-xs">(Narrativ)</span></Label>
                                        <Textarea
                                            id="umweltverschmutzungMassnahmen"
                                            placeholder="Beschreiben Sie Maßnahmen..."
                                            className="min-h-[100px]"
                                            value={bioData.umweltverschmutzungMassnahmen}
                                            onChange={(e) => setBioData(prev => ({ ...prev, umweltverschmutzungMassnahmen: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bodenWasserLuftVerbesserungen">Verbesserungen Boden-/Wasser-/Luftqualität <span className="text-muted-foreground text-xs">(Monitoring-Daten)</span></Label>
                                        <Textarea
                                            id="bodenWasserLuftVerbesserungen"
                                            placeholder="Tragen Sie Monitoring-Daten ein..."
                                            className="min-h-[100px]"
                                            value={bioData.bodenWasserLuftVerbesserungen}
                                            onChange={(e) => setBioData(prev => ({ ...prev, bodenWasserLuftVerbesserungen: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Biodiversity Core Data (B5) */}
                        <AccordionItem value="biodiv" className="border rounded-lg bg-card shadow-card">
                            <AccordionTrigger className="px-6">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg">Biodiversität & Ökosysteme</CardTitle>
                                    <CustomBadge variant="secondary" size="sm">B5</CustomBadge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Fokusarten <span className="text-muted-foreground text-xs">(Datenbasiert)</span></Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Art hinzufügen..."
                                                value={customArt}
                                                onChange={(e) => setCustomArt(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && customArt.trim()) {
                                                        setBioData(prev => ({
                                                            ...prev,
                                                            fokusarten: [...prev.fokusarten, customArt.trim()]
                                                        }));
                                                        setCustomArt('');
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {bioData.fokusarten.map((art, idx) => (
                                                <CustomBadge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="cursor-pointer hover:bg-destructive/20"
                                                    onClick={() => {
                                                        setBioData(prev => ({
                                                            ...prev,
                                                            fokusarten: prev.fokusarten.filter((_, i) => i !== idx)
                                                        }));
                                                    }}
                                                >
                                                    {art} ×
                                                </CustomBadge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Lebensräume/Habitats <span className="text-muted-foreground text-xs">(Datenbasiert)</span></Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Lebensraum hinzufügen..."
                                                value={customLebensraum}
                                                onChange={(e) => setCustomLebensraum(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && customLebensraum.trim()) {
                                                        setBioData(prev => ({
                                                            ...prev,
                                                            lebensraeume: [...prev.lebensraeume, customLebensraum.trim()]
                                                        }));
                                                        setCustomLebensraum('');
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {bioData.lebensraeume.map((habitat, idx) => (
                                                <CustomBadge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="cursor-pointer hover:bg-destructive/20"
                                                    onClick={() => {
                                                        setBioData(prev => ({
                                                            ...prev,
                                                            lebensraeume: prev.lebensraeume.filter((_, i) => i !== idx)
                                                        }));
                                                    }}
                                                >
                                                    {habitat} ×
                                                </CustomBadge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Abhängigkeiten von Ökosystemleistungen</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {oekosystemleistungenOptions.map((leistung) => (
                                                <Chip
                                                    key={leistung}
                                                    selected={bioData.oekosystemleistungen.includes(leistung)}
                                                    onClick={() => {
                                                        setBioData(prev => ({
                                                            ...prev,
                                                            oekosystemleistungen: prev.oekosystemleistungen.includes(leistung)
                                                                ? prev.oekosystemleistungen.filter(l => l !== leistung)
                                                                : [...prev.oekosystemleistungen, leistung]
                                                        }));
                                                    }}
                                                >
                                                    {leistung}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="flaecheHa">Fläche (ha) <span className="text-muted-foreground text-xs">(Datenbasiert)</span></Label>
                                        <Input
                                            id="flaecheHa"
                                            type="number"
                                            placeholder="0"
                                            value={bioData.flaecheHa || ''}
                                            onChange={(e) => setBioData(prev => ({ ...prev, flaecheHa: parseFloat(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="baselineDaten">Baseline-Daten (vor Projektstart) <span className="text-muted-foreground text-xs">(Datenbasiert)</span></Label>
                                        <Textarea
                                            id="baselineDaten"
                                            placeholder="Beschreiben Sie den Ausgangszustand..."
                                            className="min-h-[100px]"
                                            value={bioData.baselineDaten}
                                            onChange={(e) => setBioData(prev => ({ ...prev, baselineDaten: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="wirkungsmessung">Wirkungsmessung <span className="text-muted-foreground text-xs">(Monitoring, Indikatoren, Indizes)</span></Label>
                                        <Textarea
                                            id="wirkungsmessung"
                                            placeholder="Beschreiben Sie Monitoring-Methoden und Indikatoren..."
                                            className="min-h-[100px]"
                                            value={bioData.wirkungsmessung}
                                            onChange={(e) => setBioData(prev => ({ ...prev, wirkungsmessung: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Water & Dependencies (B6) */}
                        <AccordionItem value="wasser" className="border rounded-lg bg-card shadow-card">
                            <AccordionTrigger className="px-6">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg">Wasser & Ressourcen</CardTitle>
                                    <CustomBadge variant="secondary" size="sm">B6</CustomBadge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Wasserentnahme/-verbrauch relevant fürs Projekt?</Label>
                                        <div className="flex gap-2">
                                            <Chip
                                                selected={bioData.wasserRelevant === true}
                                                onClick={() => setBioData(prev => ({ ...prev, wasserRelevant: true }))}
                                            >
                                                Ja
                                            </Chip>
                                            <Chip
                                                selected={bioData.wasserRelevant === false}
                                                onClick={() => setBioData(prev => ({ ...prev, wasserRelevant: false }))}
                                            >
                                                Nein
                                            </Chip>
                                        </div>
                                    </div>
                                    {bioData.wasserRelevant && (
                                        <div className="space-y-2">
                                            <Label htmlFor="wasserverbrauchDaten">Wasserverbrauch Daten <span className="text-muted-foreground text-xs">(Datenbasiert)</span></Label>
                                            <Textarea
                                                id="wasserverbrauchDaten"
                                                placeholder="Tragen Sie Verbrauchsdaten ein..."
                                                className="min-h-[80px]"
                                                value={bioData.wasserverbrauchDaten}
                                                onChange={(e) => setBioData(prev => ({ ...prev, wasserverbrauchDaten: e.target.value }))}
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="wasserNutzenCommunities">Nutzen für lokale Communities (z.B. Trinkwasserversorgung) <span className="text-muted-foreground text-xs">(Narrativ)</span></Label>
                                        <Textarea
                                            id="wasserNutzenCommunities"
                                            placeholder="Beschreiben Sie Vorteile für lokale Gemeinschaften..."
                                            className="min-h-[80px]"
                                            value={bioData.wasserNutzenCommunities}
                                            onChange={(e) => setBioData(prev => ({ ...prev, wasserNutzenCommunities: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Social Impacts (B8, B10, C5, C6) */}
                        <AccordionItem value="sozial" className="border rounded-lg bg-card shadow-card">
                            <AccordionTrigger className="px-6">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg">Soziale Wirkungen</CardTitle>
                                    <div className="flex gap-1">
                                        <CustomBadge variant="secondary" size="sm">B8</CustomBadge>
                                        <CustomBadge variant="secondary" size="sm">B10</CustomBadge>
                                        <CustomBadge variant="secondary" size="sm">C5</CustomBadge>
                                        <CustomBadge variant="secondary" size="sm">C6</CustomBadge>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nutzenCommunities">Nutzen für lokale Communities <span className="text-muted-foreground text-xs">(Narrativ)</span></Label>
                                        <Textarea
                                            id="nutzenCommunities"
                                            placeholder="Beschreiben Sie den Nutzen für lokale Gemeinschaften..."
                                            className="min-h-[100px]"
                                            value={bioData.nutzenCommunities}
                                            onChange={(e) => setBioData(prev => ({ ...prev, nutzenCommunities: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="beschaeftigung">Beschäftigung durch das Projekt <span className="text-muted-foreground text-xs">(z.B. Ranger, lokale Arbeitskräfte)</span></Label>
                                        <Textarea
                                            id="beschaeftigung"
                                            placeholder="Anzahl und Art der geschaffenen Arbeitsplätze..."
                                            className="min-h-[80px]"
                                            value={bioData.beschaeftigung}
                                            onChange={(e) => setBioData(prev => ({ ...prev, beschaeftigung: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="geschlechtergerecht">Geschlechtergerechte Beteiligung <span className="text-muted-foreground text-xs">(Frauen, indigene Gruppen etc.)</span></Label>
                                        <Textarea
                                            id="geschlechtergerecht"
                                            placeholder="Beschreiben Sie Maßnahmen zur geschlechtergerechten Beteiligung..."
                                            className="min-h-[80px]"
                                            value={bioData.geschlechtergerecht}
                                            onChange={(e) => setBioData(prev => ({ ...prev, geschlechtergerecht: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="trainings">Trainings-/Capacity-Building-Maßnahmen <span className="text-muted-foreground text-xs">(Teilnehmerzahl, Inhalte)</span></Label>
                                        <Textarea
                                            id="trainings"
                                            placeholder="Beschreiben Sie Trainingsmaßnahmen..."
                                            className="min-h-[80px]"
                                            value={bioData.trainings}
                                            onChange={(e) => setBioData(prev => ({ ...prev, trainings: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="einkommenVorteile">Einkommen oder andere soziale Vorteile in Communities</Label>
                                        <Textarea
                                            id="einkommenVorteile"
                                            placeholder="Beschreiben Sie ökonomische und soziale Vorteile..."
                                            className="min-h-[80px]"
                                            value={bioData.einkommenVorteile}
                                            onChange={(e) => setBioData(prev => ({ ...prev, einkommenVorteile: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="menschenrechtsPolicies">Menschenrechts-Policies & Partizipation von Communities im Projekt</Label>
                                        <Textarea
                                            id="menschenrechtsPolicies"
                                            placeholder="Beschreiben Sie Policies und Partizipationsmechanismen..."
                                            className="min-h-[80px]"
                                            value={bioData.menschenrechtsPolicies}
                                            onChange={(e) => setBioData(prev => ({ ...prev, menschenrechtsPolicies: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </>
        </div>
    );
}
