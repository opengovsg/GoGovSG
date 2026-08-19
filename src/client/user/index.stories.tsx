import type { Meta, StoryObj } from '@storybook/react'

import { authenticatedViewportParameters } from '../storybook/decorators'
import { SortDirection, UrlState } from './reducers/types'
import UserPage from './index'

const meta: Meta<typeof UserPage> = {
  title: 'Authenticated/User Dashboard',
  component: UserPage,
  parameters: authenticatedViewportParameters,
}

export default meta
type Story = StoryObj<typeof UserPage>

const baseTableConfig = {
  isTag: false,
  numberOfRows: 10,
  pageNumber: 0,
  sortDirection: SortDirection.Descending,
  orderBy: 'createdAt',
  searchText: '',
  tags: '',
  searchInput: '',
  filter: {},
}

const sampleLinks = [
  {
    shortUrl: 'moh-vaccine-info',
    longUrl: 'https://www.moh.gov.sg/covid-19/vaccination',
    state: UrlState.Active,
    isFile: false,
    clicks: 15234,
    createdAt: '2026-06-01T02:15:00.000Z',
    updatedAt: '2026-08-10T09:30:00.000Z',
    editedLongUrl: 'https://www.moh.gov.sg/covid-19/vaccination',
    userId: 1,
    description: 'MOH vaccination information page',
    editedDescription: 'MOH vaccination information page',
    contactEmail: 'officer@moh.gov.sg',
    editedContactEmail: 'officer@moh.gov.sg',
    email: 'officer@moh.gov.sg',
    tags: ['health', 'covid-19'],
    tagStrings: 'health,covid-19',
  },
  {
    shortUrl: 'ica-passport-renewal',
    longUrl: 'https://www.ica.gov.sg/reach-us/passport-renewal',
    state: UrlState.Active,
    isFile: false,
    clicks: 8721,
    createdAt: '2026-05-14T06:45:00.000Z',
    updatedAt: '2026-07-22T11:00:00.000Z',
    editedLongUrl: 'https://www.ica.gov.sg/reach-us/passport-renewal',
    userId: 1,
    description: 'ICA passport renewal guide',
    editedDescription: 'ICA passport renewal guide',
    contactEmail: 'officer@ica.gov.sg',
    editedContactEmail: 'officer@ica.gov.sg',
    email: 'officer@ica.gov.sg',
    tags: ['ica', 'passport'],
    tagStrings: 'ica,passport',
  },
  {
    shortUrl: 'budget-2026-report',
    longUrl: 'https://www.mof.gov.sg/policies/budget-2026',
    state: UrlState.Inactive,
    isFile: true,
    clicks: 342,
    createdAt: '2026-03-02T01:00:00.000Z',
    updatedAt: '2026-03-02T01:00:00.000Z',
    editedLongUrl: 'https://www.mof.gov.sg/policies/budget-2026',
    userId: 1,
    description: 'Budget 2026 report PDF',
    editedDescription: 'Budget 2026 report PDF',
    contactEmail: 'officer@mof.gov.sg',
    editedContactEmail: 'officer@mof.gov.sg',
    email: 'officer@mof.gov.sg',
    tags: ['budget'],
    tagStrings: 'budget',
  },
]

export const EmptyState: Story = {
  parameters: {
    ...authenticatedViewportParameters,
    reduxState: {
      login: {
        isLoggedIn: true,
      },
      user: {
        initialised: true,
        isFetchingUrls: false,
        urlCount: 0,
        urls: [],
        message: '',
        tableConfig: baseTableConfig,
      },
    },
  },
}

export const PopulatedTable: Story = {
  parameters: {
    ...authenticatedViewportParameters,
    reduxState: {
      login: {
        isLoggedIn: true,
      },
      user: {
        initialised: true,
        isFetchingUrls: false,
        urlCount: sampleLinks.length,
        urls: sampleLinks,
        message: '',
        tableConfig: baseTableConfig,
      },
    },
  },
}

export const CreateLinkModalOpen: Story = {
  parameters: {
    ...authenticatedViewportParameters,
    reduxState: {
      login: {
        isLoggedIn: true,
      },
      user: {
        initialised: true,
        isFetchingUrls: false,
        urlCount: sampleLinks.length,
        urls: sampleLinks,
        message: '',
        tableConfig: baseTableConfig,
        createUrlModal: true,
      },
    },
  },
}

// NOTE: AnnouncementModal's visibility is not purely a function of redux
// state -- it is gated by local component state (`showModal`) that is only
// flipped on in a useEffect comparing `state.user.announcement` against
// whatever was last written to `localStorage.getItem('announcement')`. If a
// previous run already persisted the same announcement payload to
// localStorage, this story will mount with the modal closed. Flagging this
// as the one trigger condition that could not be guaranteed purely from
// redux state -- please double check this renders as expected.
export const AnnouncementModalOpen: Story = {
  parameters: {
    ...authenticatedViewportParameters,
    reduxState: {
      login: {
        isLoggedIn: true,
      },
      user: {
        initialised: true,
        isFetchingUrls: false,
        urlCount: sampleLinks.length,
        urls: sampleLinks,
        message: '',
        tableConfig: baseTableConfig,
        announcement: {
          title: 'New feature: Bulk link creation',
          subtitle: 'Create up to 100 links at once',
          message:
            'You can now upload a CSV file to create multiple short links in a single step.',
          url: 'https://guide.go.gov.sg',
          image: undefined,
          buttonText: 'Learn more',
        },
      },
    },
  },
}

export const SearchFilterActive: Story = {
  parameters: {
    ...authenticatedViewportParameters,
    reduxState: {
      login: {
        isLoggedIn: true,
      },
      user: {
        initialised: true,
        isFetchingUrls: false,
        urlCount: 1,
        urls: [sampleLinks[0]],
        message: '',
        tableConfig: {
          ...baseTableConfig,
          searchText: 'moh',
          searchInput: 'moh',
        },
      },
    },
  },
}
