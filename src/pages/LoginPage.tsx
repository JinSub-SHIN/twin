import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { SocialProvider, UserProfile } from '@/types/user'
import styles from './LoginPage.module.css'

/** 임시 통과 계정 (서버 연동 전) */
const DEMO_ACCOUNT = {
  loginId: 'saljjak',
  password: 'saljjak123',
} as const

type FieldErrors = {
  loginId?: string
  password?: string
}

function createDemoUser(loginId: string): UserProfile {
  return {
    provider: 'email',
    loginId,
    nickname: '살짝유저',
    birthDate: '1995-01-01',
    gender: 'female',
    phone: '010-0000-0000',
    agreedTerms: true,
    agreedPrivacy: true,
    createdAt: new Date().toISOString(),
  }
}

export function LoginPage() {
  const navigate = useNavigate()
  const { signup, isLoggedIn } = useAuth()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')
  const [failModalOpen, setFailModalOpen] = useState(false)

  useEffect(() => {
    if (isLoggedIn) navigate('/profile', { replace: true })
  }, [isLoggedIn, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const nextErrors: FieldErrors = {}
    if (!loginId.trim()) nextErrors.loginId = '아이디를 입력해주세요.'
    if (!password) nextErrors.password = '비밀번호를 입력해주세요.'

    if (nextErrors.loginId || nextErrors.password) {
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})

    const id = loginId.trim()
    if (id !== DEMO_ACCOUNT.loginId || password !== DEMO_ACCOUNT.password) {
      setFailModalOpen(true)
      return
    }

    signup(createDemoUser(id))
    navigate('/profile', { replace: true })
  }

  const handleSocial = (_provider: Exclude<SocialProvider, 'email'>) => {
    setFieldErrors({})
    setError('SNS 로그인 연동은 준비 중이에요. 잠시만 기다려 주세요.')
  }

  return (
    <section className={styles.page}>
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label="뒤로"
        >
          <ArrowLeft className="size-4" />
        </button>
        <p className={styles.stepLabel}>로그인</p>
      </div>

      <div className={styles.intro}>
        <h2 className={styles.title}>
          다시 <span className={styles.accent}>살짝</span>에
          <br />
          오신 걸 환영해요
        </h2>
        <p className={styles.desc}>아이디와 비밀번호로 로그인해 주세요.</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="loginId">
            아이디
          </label>
          <Input
            id="loginId"
            className={cn(styles.input, fieldErrors.loginId && styles.inputError)}
            autoComplete="username"
            placeholder="아이디"
            value={loginId}
            aria-invalid={Boolean(fieldErrors.loginId)}
            onChange={(e) => {
              setLoginId(e.target.value)
              if (fieldErrors.loginId) {
                setFieldErrors((prev) => ({ ...prev, loginId: undefined }))
              }
            }}
          />
          {fieldErrors.loginId ? (
            <p className={styles.fieldError}>{fieldErrors.loginId}</p>
          ) : null}
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            비밀번호
          </label>
          <Input
            id="password"
            type="password"
            className={cn(styles.input, fieldErrors.password && styles.inputError)}
            autoComplete="current-password"
            placeholder="비밀번호"
            value={password}
            aria-invalid={Boolean(fieldErrors.password)}
            onChange={(e) => {
              setPassword(e.target.value)
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }))
              }
            }}
          />
          {fieldErrors.password ? (
            <p className={styles.fieldError}>{fieldErrors.password}</p>
          ) : null}
        </div>

        <Button type="submit" className={styles.submit} size="lg">
          로그인
        </Button>
      </form>

      <div className={styles.socialBlock}>
        <div className={styles.divider}>
          <span>또는</span>
        </div>
        <div className={styles.socialList}>
          <button
            type="button"
            className={cn(styles.socialBtn, styles.kakao)}
            onClick={() => handleSocial('kakao')}
          >
            카카오로 로그인
          </button>
          <button
            type="button"
            className={cn(styles.socialBtn, styles.naver)}
            onClick={() => handleSocial('naver')}
          >
            네이버로 로그인
          </button>
          <button
            type="button"
            className={cn(styles.socialBtn, styles.apple)}
            onClick={() => handleSocial('apple')}
          >
            Apple로 로그인
          </button>
        </div>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      <p className={styles.footer}>
        아직 계정이 없나요?{' '}
        <Link to="/signup" className={styles.footerLink}>
          회원가입
        </Link>
      </p>

      <Dialog open={failModalOpen} onOpenChange={setFailModalOpen}>
        <DialogContent className={styles.dialogContent} showCloseButton={false}>
          <div className={styles.modalInner}>
            <div className={styles.modalIconWrap} aria-hidden>
              <span className={styles.modalIcon}>!</span>
            </div>
            <DialogHeader className={styles.modalHeader}>
              <DialogTitle className={styles.modalTitle}>
                로그인에 실패했어요
              </DialogTitle>
              <DialogDescription className={styles.modalDesc}>
                아이디 또는 비밀번호가 올바르지 않아요.
                <br />
                다시 한 번 확인해 주세요.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className={styles.dialogFooter}>
              <Button
                type="button"
                className={styles.modalAction}
                size="lg"
                onClick={() => setFailModalOpen(false)}
              >
                확인
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
