import { BadgeCheck, House } from 'lucide-react'
import type { ListingHost } from './types'
import styles from './ListingDetail.module.css'

const GENDER = { female: '여성', male: '남성' } as const

export function HostProfile({ host }: { host: ListingHost }) {
  const facts = [GENDER[host.gender], host.ageGroup, host.job]

  return (
    <section className={styles.block} aria-labelledby="host-title">
      <h3 id="host-title" className={styles.blockTitle}>
        함께 살 사람
      </h3>
      <div className={styles.hostCard}>
        <div className={styles.hostHead}>
          <div className={styles.hostAvatar} aria-hidden>
            {host.photoUrl ? (
              <img src={host.photoUrl} alt="" />
            ) : (
              <span>{host.nickname.trim().slice(0, 1)}</span>
            )}
          </div>
          <div className={styles.hostText}>
            <p className={styles.hostRole}>호스트</p>
            <p className={styles.hostName}>
              {host.nickname}
              {host.verified ? (
                <BadgeCheck
                  className={styles.hostVerified}
                  size={17}
                  strokeWidth={2.3}
                  aria-label="본인인증 완료"
                />
              ) : null}
            </p>
            <p className={styles.hostMeta}>{facts.join(' · ')}</p>
          </div>
        </div>

        <p className={styles.hostMessage}>“{host.message}”</p>

        <div className={styles.hostFacts}>
          {host.residing ? (
            <span>
              <House size={13} strokeWidth={2.3} aria-hidden />
              지금 이 집에 살고 있어요
            </span>
          ) : null}
          <span>{host.joinedAt} 가입</span>
          {host.verified ? <span>본인인증 완료</span> : null}
        </div>
      </div>
    </section>
  )
}
