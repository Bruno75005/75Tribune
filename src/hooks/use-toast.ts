import { useToast as useToastUI } from "@/components/ui/use-toast";

export interface Toast {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const useToast = () => {
  const { toast: toastUI } = useToastUI();

  const toast = ({ title, description, variant = "default" }: Toast) => {
    toastUI({
      title,
      description,
      variant,
    });
  };

  return { toast };
};
