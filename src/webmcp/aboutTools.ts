import { BUILD_DATE, FIRST_PUBLISHED } from '../about/buildInfo'
import { COCODE, REPO } from '../links'
import { NO_INPUT, type Tool } from './helper'

export const aboutTools: Tool[] = [
  {
    name: 'get_about',
    description: 'Returns who made the site, when it was published and updated, where the Danish comes from and what is stored.',
    inputSchema: NO_INPUT,
    annotations: { readOnlyHint: true },
    run: () => ({
      madeBy: 'Babak',
      site: COCODE,
      firstPublished: FIRST_PUBLISHED,
      updated: BUILD_DATE,
      source: REPO,
      license: 'Apache-2.0',
      danishSource: 'Den Danske Ordbog (ordnet.dk)',
      draft: true,
      privacy: 'browser-only',
    }),
  },
]
