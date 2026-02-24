"use client";

import {useState} from "react";
import {
    GeneralInformationForm
} from "@/app/(project)/projects/[projectId]/stepper/form/GeneralInformationForm/generalInformationForm";
import {
    SpecificInformationForm
} from "@/app/(project)/projects/[projectId]/stepper/form/SpecificInformationForm/specificInformationForm";
import {
    AdditionalInformation
} from "@/app/(project)/projects/[projectId]/stepper/form/AdditionalInformation/additionalInformation";
import {ReviewSummary} from "@/app/(project)/projects/[projectId]/stepper/form/ReviewSummary/reviewSummary";
import {Stepper} from "@/app/(project)/projects/[projectId]/stepper/stepper";
import {ProjectProvider} from "@/app/(project)/projects/[projectId]/ProjectContext";

export type StepType = 'general' | 'biodiversity' | 'stories' | 'review';
export interface Step {
    id: StepType;
    title: string;
    description: string;
}

const steps: Step[] = [
    {
        id: 'general',
        title: 'General Information',
        description: 'Project overview & framework setup'
    },
    {
        id: 'biodiversity',
        title: 'Biodiversity & Ecosystems',
        description: 'Species, habitats & conservation data'
    },
    {
        id: 'stories',
        title: 'Stories & Media',
        description: 'Supporting documentation & imagery'
    },
    {
        id: 'review',
        title: 'Review & Export',
        description: 'Final review & PDF generation'
    }
];

export type Framework = 'VSME' |'CSRD';

export const dynamic = "force-dynamic";

export default function ProjectPage() {

    const [currentStep, setCurrentStep] = useState<StepType>('general');

    const handleStepClick = (stepId: StepType) => {
        setCurrentStep(stepId);
    };

    const renderPageContent = () => {
        switch (currentStep) {
            case 'general':
                return <GeneralInformationForm />;
            case 'biodiversity':
                return <SpecificInformationForm />;
            case 'stories':
                return <AdditionalInformation />;
            case 'review':
                return <ReviewSummary />;
            default:
                return null;
        }
    };

    return (
        <ProjectProvider>
            <main className="xl:min-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Stepper steps={steps} currentStep={currentStep} onStepClick={handleStepClick} disabled={false}/>
                <div>
                    {renderPageContent()}
                </div>
            </main>
        </ProjectProvider>
    )
}
