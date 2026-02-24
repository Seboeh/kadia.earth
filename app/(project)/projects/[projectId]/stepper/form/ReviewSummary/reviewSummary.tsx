import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '@/components/ui/customBadge';
import {
    Check,
    AlertTriangle,
    X,
    Download,
    ExternalLink,
    FileText
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
type Framework = 'VSME' | 'CSRD';

interface ChecklistItem {
    id: string;
    label: string;
    status: 'complete' | 'warning' | 'incomplete';
    section: string;
    description?: string;
}

export function ReviewSummary() {
    const framework: Framework = 'VSME';

    const checklistItems: ChecklistItem[] = [
        // General Information
        { id: 'project-overview', label: 'Project overview completed', status: 'complete', section: 'General Information' },
        { id: 'contribution', label: 'Contribution amount specified', status: 'complete', section: 'General Information' },
        { id: 'boundaries', label: 'Geographic boundaries defined', status: 'warning', section: 'General Information', description: 'Map boundary needs to be drawn' },
        { id: 'attribution', label: 'Attribution method selected', status: 'incomplete', section: 'General Information' },

        // Biodiversity & Ecosystems
        { id: 'species-data', label: 'Species data entered', status: 'incomplete', section: 'Biodiversity & Ecosystems' },
        { id: 'habitat-data', label: 'Habitat information provided', status: 'incomplete', section: 'Biodiversity & Ecosystems' },
        { id: 'goals-targets', label: 'Goals & targets defined', status: 'incomplete', section: 'Biodiversity & Ecosystems' },

        // Stories & Media
        { id: 'supporting-docs', label: 'Supporting documentation', status: 'incomplete', section: 'Stories & Media' },

        // Framework-specific items
        ...(framework === 'VSME' ? [
            { id: 'vsme-climate', label: 'Climate action measures', status: 'incomplete' as const, section: 'VSME Requirements' },
            { id: 'vsme-biodiversity', label: 'Biodiversity indicators', status: 'incomplete' as const, section: 'VSME Requirements' },
            { id: 'vsme-pollution', label: 'Pollution management', status: 'incomplete' as const, section: 'VSME Requirements' },
        ] : []),
    ];

    const groupedItems = checklistItems.reduce((acc, item) => {
        if (!acc[item.section]) {
            acc[item.section] = [];
        }
        acc[item.section].push(item);
        return acc;
    }, {} as Record<string, ChecklistItem[]>);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'complete':
                return <Check className="w-4 h-4 text-success" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-warning" />;
            case 'incomplete':
                return <X className="w-4 h-4 text-muted-foreground" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'complete':
                return <CustomBadge variant="success" size="sm">Complete</CustomBadge>;
            case 'warning':
                return <CustomBadge variant="warning" size="sm">Review</CustomBadge>;
            case 'incomplete':
                return <CustomBadge variant="default" size="sm">Pending</CustomBadge>;
            default:
                return null;
        }
    };

    const completionStats = {
        complete: checklistItems.filter(item => item.status === 'complete').length,
        warning: checklistItems.filter(item => item.status === 'warning').length,
        incomplete: checklistItems.filter(item => item.status === 'incomplete').length,
        total: checklistItems.length,
    };

    const isReadyForExport = completionStats.incomplete === 0 && completionStats.warning === 0;

    if (!framework) {
        return (
            <Card className="shadow-card">
                <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground">
                        Please select a reporting framework to review your report.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center justify-between">
                        <span>{framework} Report Review</span>
                        <div className="flex items-center gap-2">
                            <CustomBadge variant="secondary">
                                {completionStats.complete}/{completionStats.total} Complete
                            </CustomBadge>
                        </div>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Review your report completeness and export when ready
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Progress Overview */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 rounded-lg bg-success/10">
                            <div className="text-2xl font-semibold text-success">{completionStats.complete}</div>
                            <div className="text-xs text-muted-foreground">Complete</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-warning/10">
                            <div className="text-2xl font-semibold text-warning">{completionStats.warning}</div>
                            <div className="text-xs text-muted-foreground">Need Review</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted">
                            <div className="text-2xl font-semibold text-muted-foreground">{completionStats.incomplete}</div>
                            <div className="text-xs text-muted-foreground">Pending</div>
                        </div>
                    </div>

                    {/* Export Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                        <Button
                            className="flex-1"
                            disabled={!isReadyForExport}
                            size="lg"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export PDF Report
                        </Button>
                        <Button variant="outline" size="lg">
                            <FileText className="w-4 h-4 mr-2" />
                            Preview Report
                        </Button>
                    </div>

                    {!isReadyForExport && (
                        <div className="text-sm text-muted-foreground text-center p-3 bg-muted/50 rounded-lg">
                            Complete all required sections to enable PDF export
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detailed Checklist */}
            <Card className="shadow-card">
                <CardHeader>
                    <CardTitle className="text-xl">Completion Checklist</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Review each section and resolve any outstanding items
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {Object.entries(groupedItems).map(([section, items]) => (
                        <div key={section} className="space-y-3">
                            <h4 className="font-medium text-foreground flex items-center gap-2">
                                {section}
                                <CustomBadge variant="outline" size="sm">
                                    {items.filter(i => i.status === 'complete').length}/{items.length}
                                </CustomBadge>
                            </h4>

                            <div className="space-y-2 pl-4 border-l-2 border-border">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-3 py-2">
                                        <div className="flex items-center gap-3 flex-1">
                                            {getStatusIcon(item.status)}
                                            <div className="flex-1">
                                                <div className="text-sm">{item.label}</div>
                                                {item.description && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {item.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(item.status)}
                                            {item.status !== 'complete' && (
                                                <Button variant="ghost" size="sm">
                                                    <ExternalLink className="w-3 h-3 mr-1" />
                                                    Fix
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {section !== Object.keys(groupedItems)[Object.keys(groupedItems).length - 1] && (
                                <Separator />
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
