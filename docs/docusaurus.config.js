module.exports = {
  title: 'ng-mocks',
  tagline:
    'An Angular testing library for creating mock services, components, directives, pipes and modules in unit tests, which includes shallow rendering, precise stubs to dump child dependencies, supports Angular 5 6 7 8 9 10 11, jasmine and jest.',
  url: 'https://ng-mocks.sudo.eu',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  onDuplicateRoutes: 'throw',
  baseUrlIssueBanner: false,
  favicon: 'img/favicon.ico',
  organizationName: 'help-me-mom',
  projectName: 'ng-mocks',
  themeConfig: {
    announcementBar: {
      id: 'give-a-start',
      content:
        'If you like ng-mocks, please support it with a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/help-me-mom/ng-mocks">GitHub</a>.',
    },
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      title: 'ng-mocks',
      items: [
        {
          to: '/guides',
          label: 'Test examples',
          position: 'left',
        },
        {
          label: 'Try on CodeSandbox',
          href: 'https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/master/?file=/src/test.spec.ts',
          position: 'left',
        },
        {
          label: 'Try on StackBlitz',
          href: 'https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox?file=src/test.spec.ts',
          position: 'left',
        },
        {
          label: 'Run tests on CI',
          href: 'https://satantime.github.io/puppeteer-node/',
        },
        {
          href: 'https://github.com/sponsors/help-me-mom',
          html: `
              <span class="sponsor-button">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="sponsor-button-icon">
                  <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002ZM4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.58 20.58 0 0 0 8 13.393a20.58 20.58 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z"></path>
                </svg>
                <span>Sponsor</span>
              </span>
          `,
          position: 'right',
        },
        {
          href: 'https://github.com/help-me-mom/ng-mocks',
          label: 'GitHub repo',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/ng-mocks',
          label: 'NPM package',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Content',
          items: [
            {
              label: 'Documentation',
              to: '/',
            },
            {
              label: 'Test examples',
              to: '/guides',
            },
            {
              label: 'Try on CodeSandbox',
              href: 'https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/master/?file=/src/test.spec.ts',
            },
            {
              label: 'Try on StackBlitz',
              href: 'https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox?file=src/test.spec.ts',
            },
            {
              label: 'Execute tests on CI',
              href: 'https://satantime.github.io/puppeteer-node/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Start a discussion on GitHub',
              href: 'https://github.com/help-me-mom/ng-mocks/discussions/new/choose',
            },
            {
              label: 'Chat on gitter',
              href: 'https://gitter.im/ng-mocks/community',
            },
            {
              label: 'Ask a question on Stackoverflow',
              href: 'https://stackoverflow.com/questions/ask?tags=ng-mocks%20angular%20testing%20mocking',
            },
            {
              label: 'Report an issue on GitHub',
              href: 'https://github.com/help-me-mom/ng-mocks/issues',
            },
          ],
        },
        {
          title: 'Links',
          items: [
            {
              label: 'GitHub repo',
              href: 'https://github.com/help-me-mom/ng-mocks',
            },
            {
              label: 'NPM package',
              href: 'https://www.npmjs.com/package/ng-mocks',
            },
          ],
        },
      ],
      copyright: `Copyright &copy; ${new Date().getFullYear()}. Built with Docusaurus.`,
    },
  },
  themes: [
    [
      '@docusaurus/theme-classic',
      {
        customCss: require.resolve('./src/css/custom.css'),
      },
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        path: 'articles',
        routeBasePath: '/',
        sidebarPath: require.resolve('./sidebars.js'),
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
        editUrl: params =>
          [
            'https://github.com/help-me-mom/ng-mocks/edit/master/docs/',
            params.versionDocsDirPath,
            '/',
            params.docPath,
            '?message=docs:%20updating%20docs',
          ].join(''),
        remarkPlugins: [[require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }]],
      },
    ],
    '@docusaurus/plugin-sitemap',
  ],
};
