import type { Meta, StoryObj } from '@storybook/react'

import { authenticatedViewportParameters } from '../storybook/decorators'
import { SearchResultsSortOrder } from '../../shared/search'
import { UrlState } from './reducers/types'
import DirectoryPage from './index'

// DirectoryPage itself never reads state.login, but DIRECTORY_PAGE is
// wrapped in <PrivateRoute> in RootPage/index.tsx -- a logged-out visitor is
// redirected to /login before ever reaching this component, so it belongs
// in the authenticated bucket despite the component-level code looking
// login-agnostic.
const meta: Meta<typeof DirectoryPage> = {
  title: 'Authenticated/Directory',
  component: DirectoryPage,
  parameters: authenticatedViewportParameters,
}

export default meta
type Story = StoryObj<typeof DirectoryPage>

const mockResults = [
  {
    shortUrl: 'moh-covid-updates',
    longUrl: 'https://www.moh.gov.sg/covid-19/updates',
    editedLongUrl: 'https://www.moh.gov.sg/covid-19/updates',
    state: UrlState.Active,
    isFile: false,
    createdAt: '2024-01-15T03:00:00.000Z',
    updatedAt: '2024-06-01T03:00:00.000Z',
    userId: 1,
    description: 'Latest COVID-19 updates from the Ministry of Health',
    editedDescription: 'Latest COVID-19 updates from the Ministry of Health',
    contactEmail: 'enquiries@moh.gov.sg',
    editedContactEmail: 'enquiries@moh.gov.sg',
    email: 'officer1@moh.gov.sg',
    tags: ['health', 'covid-19'],
    tagStrings: 'health,covid-19',
  },
  {
    shortUrl: 'moe-school-calendar',
    longUrl: 'https://www.moe.gov.sg/calendar/2026-school-calendar.pdf',
    editedLongUrl: 'https://www.moe.gov.sg/calendar/2026-school-calendar.pdf',
    state: UrlState.Active,
    isFile: true,
    createdAt: '2024-02-20T03:00:00.000Z',
    updatedAt: '2024-02-20T03:00:00.000Z',
    userId: 2,
    description: '2026 School Calendar',
    editedDescription: '2026 School Calendar',
    contactEmail: 'enquiries@moe.gov.sg',
    editedContactEmail: 'enquiries@moe.gov.sg',
    email: 'officer2@moe.gov.sg',
    tags: ['education'],
    tagStrings: 'education',
  },
  {
    shortUrl: 'ica-passport-renewal',
    longUrl: 'https://www.ica.gov.sg/services/passport-renewal',
    editedLongUrl: 'https://www.ica.gov.sg/services/passport-renewal',
    state: UrlState.Inactive,
    isFile: false,
    createdAt: '2023-11-05T03:00:00.000Z',
    updatedAt: '2024-03-10T03:00:00.000Z',
    userId: 3,
    description: 'Renew your Singapore passport online',
    editedDescription: 'Renew your Singapore passport online',
    contactEmail: 'enquiries@ica.gov.sg',
    editedContactEmail: 'enquiries@ica.gov.sg',
    email: 'officer3@ica.gov.sg',
    tags: ['immigration', 'passport'],
    tagStrings: 'immigration,passport',
  },
]

export const EmptyResults: Story = {
  parameters: {
    ...authenticatedViewportParameters,
    routerEntries: ['/directory?query=asdkjhaskjdh'],
    reduxState: {
      directory: {
        results: [],
        resultsCount: 0,
        queryForResult: 'asdkjhaskjdh',
      },
    },
  },
}

export const PopulatedResults: Story = {
  parameters: {
    ...authenticatedViewportParameters,
    routerEntries: ['/directory?query=gov'],
    reduxState: {
      directory: {
        results: mockResults,
        resultsCount: mockResults.length,
        queryForResult: 'gov',
      },
    },
  },
}

// NOTE: There is no forceable trigger to open the filter drawer -- `isFilterOpen`
// in DirectoryInput (src/client/directory/components/DirectoryHeader/DirectoryInput/index.tsx)
// is local component `useState`, with no prop, redux state, or query param to force it
// open from the outside. Substituting with a "populated results as if the user searched
// a specific term" story instead, per the established fallback.
export const SearchQueryPopulated: Story = {
  parameters: {
    ...authenticatedViewportParameters,
    routerEntries: [
      `/directory?query=passport&sortOrder=${SearchResultsSortOrder.Popularity}`,
    ],
    reduxState: {
      directory: {
        results: mockResults.filter((result) =>
          result.description.toLowerCase().includes('passport'),
        ),
        resultsCount: 1,
        queryForResult: 'passport',
      },
    },
  },
}
