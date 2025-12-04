interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; description: string }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full">

      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div
              key={step.label}
              className="flex flex-col items-center flex-1"
            >
              {/* Step number/checkmark */}
              <div className="relative mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                    ${isCompleted ? "bg-emerald-500 text-white scale-100" : ""}
                    ${isCurrent ? "bg-white border-2 border-emerald-500 text-emerald-600 scale-110 shadow-lg" : ""}
                    ${isPending ? "bg-gray-100 text-gray-400 scale-90" : ""}
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
              </div>

              {/* Step label */}
              <div className="text-center">
                <p
                  className={`text-sm font-medium transition-colors
                    ${isCurrent ? "text-emerald-600" : ""}
                    ${isCompleted ? "text-gray-900" : ""}
                    ${isPending ? "text-gray-400" : ""}
                  `}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
