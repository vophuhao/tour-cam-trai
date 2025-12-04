interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; description: string }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li
            key={step.label}
            className={`relative ${
              index !== steps.length - 1 ? "pr-8 sm:pr-20 flex-1" : ""
            }`}
          >
            {index !== steps.length - 1 && (
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div
                  className={`h-0.5 w-full ${
                    index < currentStep ? "bg-emerald-600" : "bg-gray-200"
                  }`}
                />
              </div>
            )}
            <div className="relative flex items-center justify-center">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  index < currentStep
                    ? "bg-emerald-600"
                    : index === currentStep
                    ? "border-2 border-emerald-600 bg-white"
                    : "border-2 border-gray-300 bg-white"
                }`}
              >
                {index < currentStep ? (
                  <svg
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span
                    className={`text-sm font-semibold ${
                      index === currentStep
                        ? "text-emerald-600"
                        : "text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                )}
              </span>
            </div>
            <div className="mt-3 text-center">
              <span
                className={`text-sm font-medium ${
                  index <= currentStep ? "text-emerald-600" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
              <p className="text-xs text-gray-500 mt-1">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}