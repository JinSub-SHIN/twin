import { CalendarDays, House, MapPin, Receipt, Users } from 'lucide-react'
import { SubwayLineBadges } from '@/components/ui/subway'
import type { ListingDetailData } from './types'
import styles from './ListingDetail.module.css'

function man(value: number | null) {
  return value == null ? null : `${value.toLocaleString('ko-KR')}만원`
}

export function ListingSummary({ listing }: { listing: ListingDetailData }) {
  const { area, cost } = listing
  const monthly = man(cost.monthlyMan)
  const deposit = man(cost.depositMan)
  const maintenance = man(cost.maintenanceMan)

  const highlights = [
    { icon: House, label: '월세 공유' },
    { icon: Users, label: `${listing.recruitCount}명 모집` },
    { icon: CalendarDays, label: listing.moveIn },
    { icon: Receipt, label: cost.utilitiesIncluded ? '공과금 포함' : '공과금 별도' },
  ]

  return (
    <section className={styles.summary}>
      <p className={styles.area}>
        <MapPin size={14} strokeWidth={2.3} aria-hidden />
        {area.city} {area.district} {area.dong}
      </p>
      {area.station ? (
        <p className={styles.station}>
          <SubwayLineBadges lines={area.station.lines} />
          <span>
            {area.station.name} 도보 {area.station.walkMinutes}분
          </span>
        </p>
      ) : null}

      <h2 className={styles.title}>{listing.title}</h2>
      <p className={styles.intro}>{listing.intro}</p>

      <ul className={styles.highlights}>
        {highlights.map(({ icon: Icon, label }) => (
          <li key={label}>
            <span className={styles.highlightIcon}>
              <Icon size={17} strokeWidth={2.1} aria-hidden />
            </span>
            {label}
          </li>
        ))}
      </ul>

      <div className={styles.costCard}>
        <div>
          <p className={styles.costLabel}>월 예상 비용</p>
          <p className={styles.costValue}>{monthly ?? '직접 조율'}</p>
        </div>
        <dl className={styles.costMeta}>
          {deposit ? (
            <div>
              <dt>보증금</dt>
              <dd>{deposit}</dd>
            </div>
          ) : null}
          {maintenance ? (
            <div>
              <dt>관리비</dt>
              <dd>{maintenance}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  )
}
