import { defineSolitudeConfig } from './lib/config';

export default defineSolitudeConfig({
  site: 'https://harkerx.com/',
  title: 'HarkerX Harbor',
  description: 'A personal blog about life, code, and whatever comes to mind.',
  locale: 'en',
  timeZone: 'UTC',
  author: { name: 'HarkerX' },
  menus: [
    {
      name: 'Library',
      children: [
        { name: 'All posts', url: '/archives/', icon: 'fas fa-folder-closed' },
        { name: 'Categories', url: '/categories/', icon: 'fas fa-clone' },
        { name: 'Tags', url: '/tags/', icon: 'fas fa-tags' },
      ],
    },
    {
      name: 'About',
      url: '/about/',
    },
  ],
  theme: {
    nav: {
      right: {
        custom: [
          {
            name: 'Toggle theme',
            icon: 'fas fa-circle-half-stroke',
            action: 'switchDarkMode',
            id: 'theme-toggle',
          },
          {
            name: 'RSS Feed',
            icon: 'fas fa-rss',
            url: '/index.xml',
            id: 'rss-feed',
          },
        ],
      },
    },
    console: {
      enable: false,
    },
    lightbox: 'fancybox',
    site: {
      name: {
        class: 'text',
        custom: 'HarkerX Harbor',
      },
      icon: '/img/icons/favicon.png',
    },
    hometop: {
      banner: {
        title: 'Welcome to HarkerX Harbor',
        desc: 'Just writing stuff. Read if you feel like it.',
      },
    },
    aside: {
      home: { noSticky: 'about', Sticky: 'allInfo' },
      post: { noSticky: 'about', Sticky: 'newestPost,allInfo' },
      page: { noSticky: 'about', Sticky: 'newestPost,allInfo' },
      siteinfo: {
        runtimeenable: true,
        runtime: '2023-01-22 00:00:00',
      },
      my_card: {
        author: {
          img: '/img/avatar.png',
        },
        description: '随便写写，凑合看看。',
        content: 'Tuum est arbitrium; tuum est pretium.',
        information: [
          {
            name: 'GitHub',
            url: 'https://github.com/harkerxia',
            icon: 'fab fa-github',
          },
        ],
      },
    },
    footer: {
      information: {
        author: '',
        left: [],
        right: [],
      }
    },
    capsule: { enable: false, id: '7298728834454061071', type: 'playlist', server: 'qishui' },
    post: {
      meta: { locate: false },
      covercolor: { enable: true, mode: 'local' },
    },
    brevity: { enable: false },
    keyboard: {
      enable: false,
    },
    search: { tags: ['Thoughts', 'Projects', 'Experiences'], local: { preload: true } },
    pwa: {
      enable: true,
      favicon_16_16: '/img/icons/favicon-16.png',
      favicon_32_32: '/img/icons/favicon-32.png',
    },
    comment: {
      use: 'twikoo',
      lazyload: false,
      count: false,
      sidebar: false,
      commentBarrage: false,
    },

    twikoo: {
      envId: 'https://comments.harkerx.com',
      style: true,
      option: {
        lang: 'en',
      },
    },

    cdn: {
      twikoo: 'https://cdn.jsdelivr.net/npm/twikoo@2.0.17/dist/twikoo.min.js',
    },
  },
});
