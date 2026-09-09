import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
import {
  AppleSignInButton,
  GoogleSignInButton,
  KakaoSignInButton,
  NaverSignInButton,
} from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { loadUser } from '@/lib/authStorage'
import { cn } from '@/lib/utils'
import { loginUser } from '@/service/auth'
import { ApiError } from '@/service/http'
import type { Gender, SocialProvider, UserProfile } from '@/types/user'
import styles from './LoginPage.module.css'

type FieldErrors = {
  loginId?: string
  password?: string
}

function createDemoUser(
  provider: SocialProvider,
  loginId?: string,
): UserProfile {
  return {
    provider,
    ...(provider === 'email' && loginId ? { loginId } : {}),
    nickname: provider === 'google' ? '구글유저' : '살짝유저',
    birthDate: '1995-01-01',
    gender: 'female',
    phone: '010-0000-0000',
    agreedTerms: true,
    agreedPrivacy: true,
    createdAt: new Date().toISOString(),
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null
}

function readString(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function readGender(value: unknown): Gender | null {
  if (value === 'male' || value === 'female' || value === 'other') return value
  return null
}

function userFromLogin(loginId: string, body: unknown): UserProfile {
  const root = asRecord(body)
  const nested = asRecord(root?.user) ?? asRecord(root?.data) ?? root
  const id = readString(nested, 'id') || readString(nested, 'loginId') || loginId
  const gender = readGender(nested?.gender)
  const existing = loadUser()
  const sameUser = existing?.loginId === id ? existing : null

  return {
    provider: 'email',
    loginId: id,
    nickname: readString(nested, 'nickname') || sameUser?.nickname || id,
    birthDate:
      readString(nested, 'birth') ||
      readString(nested, 'birthDate') ||
      sameUser?.birthDate ||
      '',
    gender: gender ?? sameUser?.gender ?? 'other',
    phone: readString(nested, 'phone') || sameUser?.phone || '',
    agreedTerms: true,
    agreedPrivacy: true,
    createdAt: sameUser?.createdAt ?? new Date().toISOString(),
    ...(sameUser?.pref ? { pref: sameUser.pref } : {}),
    ...(sameUser?.job ? { job: sameUser.job } : {}),
    ...(sameUser?.photoUrl ? { photoUrl: sameUser.photoUrl } : {}),
    ...(sameUser?.bio ? { bio: sameUser.bio } : {}),
  }
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signup, isLoggedIn } = useAuth()
  const [loginId, setLoginId] = useState(() => {
    const fromSignup = location.state as { loginId?: string } | null
    return fromSignup?.loginId?.trim() ?? ''
  })
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [failModalOpen, setFailModalOpen] = useState(false)

  useEffect(() => {
    if (isLoggedIn) navigate('/profile', { replace: true })
  }, [isLoggedIn, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setError('')

    const nextErrors: FieldErrors = {}
    if (!loginId.trim()) nextErrors.loginId = '아이디를 입력해주세요.'
    if (!password) nextErrors.password = '비밀번호를 입력해주세요.'

    if (nextErrors.loginId || nextErrors.password) {
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    setSubmitting(true)

    const id = loginId.trim()
    try {
      const result = await loginUser({ id, password })
      signup(userFromLogin(id, result))
      navigate('/profile', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 401)) {
        setFailModalOpen(true)
        return
      }
      setError(
        err instanceof ApiError
          ? err.message
          : '로그인에 실패했어요. 다시 시도해 주세요.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleSocial = (provider: Exclude<SocialProvider, 'email'>) => {
    setFieldErrors({})
    setError('')

    if (provider === 'google') {
      // 서버 연동 전: 구글 로그인 데모
      signup(createDemoUser('google'))
      navigate('/profile', { replace: true })
      return
    }

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

        <Button
          type="submit"
          className={styles.submit}
          size="lg"
          disabled={submitting}
        >
          {submitting ? '로그인하는 중...' : '로그인'}
        </Button>
      </form>

      <div className={styles.socialBlock}>
        <div className={styles.divider}>
          <span>또는</span>
        </div>
        <div className={styles.socialList}>
          <NaverSignInButton onClick={() => handleSocial('naver')} />
          <KakaoSignInButton onClick={() => handleSocial('kakao')} />
          <GoogleSignInButton
            label="Google로 로그인"
            onClick={() => handleSocial('google')}
          />
          <AppleSignInButton onClick={() => handleSocial('apple')} />
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
