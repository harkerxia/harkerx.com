import { defineSolitudeConfig } from './lib/config';

export default defineSolitudeConfig({
  site: 'https://harkerx.com/',
  title: 'HarkerX Harbor',
  description:
    'A personal space for sharing insights, experiences, projects, and things worth keeping.',
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
    lightbox: 'fancybox',
    site: {
      name: {
        class: 'text',
        custom: 'HarkerX Harbor',
      },
    },
    hometop: {
      banner: {
        title: 'Welcome to HarkerX Harbor',
        desc: 'Thoughts, experiences, projects, and things worth keeping.',
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
        description: 'Thoughts, experiences, projects, and fragments collected along the way.',
        content: 'Tuum est arbitrium; tuum est pretium.',
        witty_words: [
          'Think deeply, write freely',
          'Build things worth keeping',
        ],
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
        left: [
          {
            name: 'GitHub',
            url: 'https://github.com/harkerxia',
            icon: 'fab fa-github',
          },
        ],
        right: [{ name: 'RSS', url: '/index.xml', icon: 'fas fa-rss' }],
      },
      group: {
        Explore: [
          { name: 'Posts', url: '/archives/' },
          { name: 'Categories', url: '/categories/' },
        ],
        About: [
          { name: 'Theme', url: '/about/' },
        ],
      },
    },
    capsule: { enable: false, id: '7298728834454061071', type: 'playlist', server: 'qishui' },
    post: {
      meta: { locate: false },
      covercolor: { enable: true, mode: 'local' },
    },
    brevity: { enable: false },
    keyboard: {
      enable: true,
      list: [
        { modifier: 'shift', key: 'D', action: 'toggleTheme' },
        { modifier: 'mod', key: 'F', action: 'openSearch' },
        { modifier: 'shift', key: 'K', action: 'toggleKeyboard' },
      ],
    },
    search: { tags: ['Thoughts', 'Projects', 'Experiences'], local: { preload: true } },
    pwa: { enable: true },
  },
});
