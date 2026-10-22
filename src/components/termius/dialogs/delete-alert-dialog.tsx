import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  itemType?: "host" | "folder" | "item";
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function DeleteAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  itemType = "host",
  onConfirm,
  confirmText = "Hapus",
  cancelText = "Batal",
}: DeleteAlertDialogProps) {
  const displayTitle =
    title ||
    (itemType === "folder" ? "Hapus Group / Folder?" : "Hapus Host Server?");
  const displayDesc =
    description ||
    (itemName
      ? `Apakah Anda yakin ingin menghapus "${itemName}"? Tindakan ini tidak dapat dibatalkan.`
      : "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-[#171c2d] border border-slate-200 dark:border-[#262f4b] text-slate-900 dark:text-white shadow-2xl rounded-2xl max-w-sm p-5">
        <AlertDialogHeader className="space-y-2">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-1">
            <Trash2 size={20} />
          </div>
          <AlertDialogTitle className="text-base font-bold text-slate-900 dark:text-white text-left">
            {displayTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-slate-500 dark:text-slate-400 text-left leading-relaxed">
            {displayDesc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex gap-2 sm:justify-end border-t border-slate-200 dark:border-[#232b45] pt-4">
          <AlertDialogCancel className="bg-slate-100 hover:bg-slate-200 dark:bg-[#20273d] dark:hover:bg-[#28324e] border-slate-200 dark:border-[#2d3758] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
