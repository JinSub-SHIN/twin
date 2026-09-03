import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import styles from "./GenderLockDialog.module.css";

export function GenderLockDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={styles.panel}
        overlayClassName={styles.overlay}
        showCloseButton={false}
      >
        <DialogTitle className={styles.title}>
          특정 성별에게만 공개된 공고입니다.
        </DialogTitle>
        <DialogDescription className={styles.desc}>
          공고를 확인하시려면 로그인을 해주세요.
        </DialogDescription>
        <Button
          type="button"
          className={styles.cta}
          size="lg"
          onClick={() => navigate("/login")}
        >
          로그인하기
        </Button>
      </DialogContent>
    </Dialog>
  );
}
