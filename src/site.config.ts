import { defineSolitudeConfig, type ThemeLink } from "./lib/config";

// Shared by the Connect menu and profile card.
const socialLinks: ThemeLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/harkerxia",
    icon: "fab fa-github",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/harkerxia/",
    icon: "fab fa-linkedin",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/harker_xia/",
    icon: "fab fa-instagram",
  },
  { name: "Email", url: "mailto:harkerxia@gmail.com", icon: "fas fa-envelope" },
];

export default defineSolitudeConfig({
  site: "https://harkerx.com/",
  title: "HarkerX Harbor",
  description: "A harbor for all kinds of thoughts.",
  author: { name: "HarkerX" },
  menus: [
    {
      name: "Library",
      children: [
        { name: "All posts", url: "/archives/", icon: "fas fa-folder-closed" },
        { name: "Categories", url: "/categories/", icon: "fas fa-clone" },
        { name: "Tags", url: "/tags/", icon: "fas fa-tags" },
      ],
    },
    { name: "Thoughts", url: "/notes/" },
    { name: "About", url: "/about/" },
    { name: "Friends", url: "/links/" },
  ],
  theme: {
    // Add more groups here for games, tools, or other links.
    nav: { group: { Connect: socialLinks } },
    hometop: {
      recommendList: [
        {
          title: "从零开始搭建个人博客",
          url: "/p/blog/",
          cover: "/img/covers/blog.png",
          label: "Experience",
        },
        {
          title: "史上最全翻墙教程",
          url: "/p/vpn/",
          cover: "/img/covers/vpn.png",
          label: "Technologies",
        },
        {
          title: "VSCode的安装及环境配置",
          url: "/p/vscode/",
          cover: "/img/covers/vscode.png",
          label: "Experience",
        },
      ],
    },
    aside: {
      my_card: {
        description: "Just writing stuff.<br />Stay if you like.",
        information: socialLinks,
      },
    },
    twikoo: { envId: "https://comments.harkerx.com", option: { lang: "en" } },
  },
});
