import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "flex items-center gap-3 w-full p-4 rounded-lg shadow-lg border",
          title: "text-sm font-semibold",
          description: "text-sm opacity-90",
          success: "bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-200 dark:border-green-800",
          error: "bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border-red-200 dark:border-red-800",
          warning: "bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800",
          info: "bg-cyan-50 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-100 border-cyan-200 dark:border-cyan-800",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }