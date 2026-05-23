interface ErrorMessageProps {
  message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <p className="text-red-600 text-sm font-medium">{message}</p>
    </div>
  )
}