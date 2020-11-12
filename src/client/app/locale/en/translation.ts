const translationEn = {
  general: {
    emailDomain: 'gov.sg',
    shortUrlPrefix: 'go.gov.sg/',
    // If you are modifying appTitle, then you will need to also modify the title tag content
    // of index.html, 404.error.ejs, and 500.error.ejs.
    appTitle: 'Go.gov.sg',
    appCatchphrase: {
      styled:
        'Trusted short links from <strong><i>public officers</i></strong>',
      noStyle: 'Trusted short links from public officers',
    },
    appDescription: {
      get subtitle() {
        return `<strong>${translationEn.general.appTitle}</strong> short links can only be created by public officers, so you can be sure it’s from a trustworthy source.`
      },
    },
    appSignInPrompt: 'Are you a public officer?',
    copyright: '© 2020 Open Government Products, ',
    copyrightTag: 'Government Technology Agency of Singapore',
    placeholders: {
      email: 'jane@data.gov.sg',
    },
    links: {
      contribute: 'https://go.gov.sg/go-opensource',
      directory: '/directory',
      faq: 'https://guide.go.gov.sg/faq.html',
      privacy: 'https://guide.go.gov.sg/privacy.html',
      terms: 'https://guide.go.gov.sg/termsofuse.html',
      contact: 'https://form.gov.sg/forms/govtech/5c5295edb3d80b0017ac7c81',
      builtBy: 'https://open.gov.sg',
      linkedin: 'https://sg.linkedin.com/company/open-government-products',
      facebook: 'https://www.facebook.com/opengovsg',
    },
    builtBy: 'Built by Open Government Products',
  },
  homePage: {
    features: {
      antiPhishing: {
        get description() {
          return `Shorten your links with a trustworthy ${translationEn.general.emailDomain} domain, so your users know they are from a public officer.`
        },
      },
      customised: {
        description:
          'Long URLs are hard to remember and take up space. Create and share short links instead.',
      },
      analytics: {
        description:
          "Want to know how popular your links are? Track each link's click rate through our web interface.",
      },
      fileSharing: {
        description:
          'Upload your file to share it with anyone, using a customised and trustworthy go.gov.sg short link.',
      },
    },
  },
}

export default translationEn
