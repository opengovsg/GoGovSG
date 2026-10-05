import React, { FunctionComponent } from 'react'
import i18next from 'i18next'
import { Link } from '@material-ui/core'

const ONE_GOV_SG_URL = 'https://one.gov.sg'

const OneGovSgLogoutMessage: FunctionComponent = () => (
  <div>
    <strong>
      You have been logged out of {i18next.t('general.appTitle')}.
    </strong>
    <br />
    To log out from one.gov.sg, visit{' '}
    <Link
      href={ONE_GOV_SG_URL}
      target="_blank"
      rel="noopener noreferrer"
      // the info toast is dark, so the default primary link colour is unreadable
      color="inherit"
      underline="always"
    >
      {ONE_GOV_SG_URL}
      {/* open-in-new icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-label="(opens in a new tab)"
        role="img"
        style={{ marginLeft: 4, verticalAlign: 'middle' }}
      >
        <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
      </svg>
    </Link>
  </div>
)

export default OneGovSgLogoutMessage
