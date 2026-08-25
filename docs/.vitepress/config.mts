import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/obsidian-gantt-tasks/',
  title: "Dataview Tasks Gantt",
  description: "Seamlessly bridge the Obsidian Tasks and Dataview plugins to render scheduled, start, and due dates as clean Gantt timelines.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/06-examples' }
    ],

    sidebar: [
      {
        text: 'User Guide',
        items: [
          { text: '01 Introduction & Prerequisites', link: '/01-introduction' },
          { text: '02 Installation & Integration', link: '/02-installation' },
          { text: '03 Usage and Syntax', link: '/03-usage-and-syntax' },
          { text: '04 Configuration & Inputs', link: '/04-configuration' },
          { text: '05 UI & Interactive Features', link: '/05-ui' },
          { text: '06 Examples', link: '/06-examples' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/kny00' }
    ]
  }
})
