import type { ReactNode } from "react";
import { RotateCcw, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import page from "../ExplorePage.module.css";
import styles from "./filter.module.css";

export function FilterBottomSheet({
  open,
  onOpenChange,
  title,
  tabs,
  tall = false,
  applyLabel,
  onReset,
  onApply,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  tabs?: ReactNode;
  tall?: boolean;
  applyLabel: string;
  onReset: () => void;
  onApply: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        sheet
        className={cn(page.sheet, styles.sheet, tall && styles.sheetTall)}
        overlayClassName={page.sheetOverlay}
        showCloseButton={false}
      >
        <span className={page.sheetHandle} aria-hidden />
        <header className={styles.sheetHead}>
          <DialogTitle className={styles.sheetTitle}>{title}</DialogTitle>
          <DialogClose className={styles.close} aria-label="닫기">
            <X size={20} strokeWidth={2.2} />
          </DialogClose>
        </header>
        {tabs}
        <div className={styles.sheetBody}>{children}</div>
        <footer className={styles.sheetFoot}>
          <button type="button" className={styles.reset} onClick={onReset}>
            <RotateCcw size={15} strokeWidth={2.3} />
            초기화
          </button>
          <button type="button" className={styles.apply} onClick={onApply}>
            {applyLabel}
          </button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
