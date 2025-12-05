interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; description: string }[];
  onStepClick?: (step: number) => void;
}

export function StepIndicator({ currentStep, steps, onStepClick }: StepIndicatorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Steps */}
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <button
              key={step.label}
              type="button"
              onClick={() => onStepClick?.(index)}
              className="flex flex-col items-center group cursor-pointer"
              disabled={!onStepClick}
            >
              {/* Circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  transition-all duration-300 mb-2
                  ${isCompleted ? "bg-emerald-500 text-white" : ""}
                  ${isCurrent ? "bg-emerald-500 text-white ring-4 ring-emerald-100 scale-110" : ""}
                  ${isPending ? "bg-white border-2 border-gray-300 text-gray-400" : ""}
                  ${onStepClick && !isCurrent ? "hover:scale-105 hover:border-emerald-400" : ""}
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className="text-center">
                <p
                  className={`
                    text-xs sm:text-sm font-medium transition-colors
                    ${isCurrent ? "text-emerald-600" : ""}
                    ${isCompleted ? "text-gray-700" : ""}
                    ${isPending ? "text-gray-400" : ""}
                  `}
                >
                  {step.label}
                </p>
               
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}