import React from 'react';
import {cn} from '@/lib/utils';
import {Check} from 'lucide-react';

type StepType = 'general' | 'biodiversity' | 'stories' | 'review';
interface Step {
    id: StepType;
    title: string;
    description: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: string;
    onStepClick: (stepId: StepType) => void;
    completedSteps?: string[];
    disabled?: boolean;
}

export function Stepper({steps, currentStep, onStepClick, completedSteps = [], disabled = false}: StepperProps) {
    const currentIndex = steps.findIndex(step => step.id === currentStep);

    return (
        <nav className="flex items-center justify-between w-full max-w-4xl mx-auto mb-8">

            <div className="flex lg:hidden items-center justify-between gap-4 px-4">
                <div>
                    <div className="text-sm font-semibold text-primary">{steps[currentIndex].title}</div>
                    {steps[currentIndex].description && (
                        <div className="text-xs text-muted-foreground mt-1">{steps[currentIndex].description}</div>
                    )}
                </div>
                    <div
                        className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground">
                        {currentIndex + 1}
                    </div>
            </div>

            {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = completedSteps.includes(step.id);
                const isPast = index < currentIndex;
                const isClickable = true;

                return (
                    <React.Fragment key={step.id}>
                        <div
                            className={cn(
                                "hidden lg:flex flex-col items-center transition-all duration-200",
                                isClickable ? "cursor-pointer group" : "cursor-not-allowed opacity-50"
                            )}
                            onClick={() => isClickable && onStepClick(step.id)}
                        >
                            <div
                                className={cn(
                                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 mb-3",
                                    isActive && "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                                    (isCompleted || isPast) && !isActive && "border-primary bg-primary text-primary-foreground",
                                    !isActive && !isCompleted && !isPast && isClickable && "border-border bg-card text-muted-foreground group-hover:border-primary/60 group-hover:shadow-md",
                                    !isClickable && "border-muted bg-muted text-muted-foreground"
                                )}
                            >
                                {isCompleted || (isPast && !isActive) ? (
                                    <Check className="w-5 h-5"/>
                                ) : (
                                    <span className="text-sm font-semibold">{index + 1}</span>
                                )}
                            </div>
                            <div className="text-center max-w-32">
                                <div
                                    className={cn(
                                        "text-sm font-medium transition-colors leading-tight",
                                        isActive && "text-primary",
                                        (isCompleted || isPast) && !isActive && "text-foreground",
                                        !isActive && !isCompleted && !isPast && isClickable && "text-muted-foreground group-hover:text-foreground",
                                        !isClickable && "text-muted-foreground"
                                    )}
                                >
                                    {step.title}
                                </div>
                                {step.description && (
                                    <div className={cn(
                                        "text-xs mt-1 leading-tight text-muted-foreground"
                                    )}>
                                        {step.description}
                                    </div>
                                )}
                            </div>
                        </div>

                        {index < steps.length - 1 && (
                            <div
                                className={cn(
                                    "flex-1 h-1 mx-6 rounded-full transition-all duration-300",
                                    index < currentIndex ? "bg-primary" : "bg-border"
                                )}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
