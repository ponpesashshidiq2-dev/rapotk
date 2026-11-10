import { Fragment } from 'react'
import type { AppState, Student } from '../types'
import { CoverPage } from './CoverPage'
import { StudentDataPage } from './StudentDataPage'
import { DomainPage } from './DomainPage'
import { domainScoreOf, findReport } from '../state/AppContext'

export function ReportDocument({
  state,
  students,
  showCover = true,
}: {
  state: AppState
  students: Student[]
  showCover?: boolean
}) {
  const { profile, domains, settings } = state
  return (
    <>
      {showCover ? <CoverPage profile={profile} /> : null}
      {students.map((student) => {
        const report = findReport(state, student.id)
        return (
          <Fragment key={student.id}>
            <StudentDataPage student={student} profile={profile} />
            {domains.map((domain) => (
              <DomainPage
                key={domain.id}
                student={student}
                domain={domain}
                score={domainScoreOf(report, domain.id)}
                profile={profile}
                tahunAjaran={settings.tahunAjaran}
              />
            ))}
          </Fragment>
        )
      })}
    </>
  )
}
