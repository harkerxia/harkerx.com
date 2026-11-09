/** Known presentation metadata; unknown front matter remains accepted by content. */
export interface PageMetadata {
  title?: string;
  description?: string;
  desc?: string;
  cover?: string;
  color?: string | false;
  comment?: boolean;
  aside?: boolean;
  toc?: boolean;
  right_menu?: boolean;
  data?: string;
  leftend?: string;
  rightend?: string;
  rightbtn?: string;
  rightbtnlink?: string;
}

export interface ShortcodeProps {
  kind: string;
  id?: string;
  title?: string;
  text?: string;
  type?: string;
  style?: string;
  url?: string;
  src?: string;
  link?: string;
  name?: string;
  host?: string;
  server?: string;
  repo?: string;
  alt?: string;
  bg?: string;
  bvid?: string;
  caption?: string;
  checked?: boolean;
  code?: string;
  col?: number | string;
  color?: string;
  columns?: number | string;
  config?: unknown;
  cover?: string;
  desc?: string;
  description?: string;
  height?: number | string;
  icon?: string;
  img?: string;
  label?: string;
  layout?: string;
  notation?: string;
  open?: boolean;
  option?: string;
  params?: Record<string, unknown>;
  position?: string;
  poster?: string;
  privacy?: boolean;
  score?: string;
  sources?: string[];
  speed?: number;
  star?: number;
  subtitle?: string;
  tag?: string;
  time?: string;
  width?: number | string;
  groups?: {
    class_name?: string;
    class_desc?: string;
    link_list: {
      name: string;
      link: string;
      avatar?: string;
      descr?: string;
      description?: string;
    }[];
  }[];
}

export interface FriendLink {
  name: string;
  link: string;
  avatar: string;
  topimg?: string;
  descr?: string;
  description?: string;
  tag?: string;
  color?: string;
  siteshot?: string;
}
export interface FriendLinkGroup {
  class_name?: string;
  class_desc?: string;
  descr?: string;
  title_link?: string;
  title_link_text?: string;
  type?: string;
  sort?: string;
  suffix?: string;
  topimg_suffix?: string;
  link_list: FriendLink[];
}
export interface LinksData {
  links: FriendLinkGroup[];
  banner_suffix?: string;
}
export interface NotesItem {
  date: string;
  content: string;
  location?: string;
  link?: string;
  image?:
    | string
    | { url: string; alt?: string }
    | (string | { url: string; alt?: string })[];
  aplayer?: { server: string; id: string | number; type?: string };
  video?: { player?: string; bilibili?: string };
}
export interface NotesData {
  title?: string;
  items: NotesItem[];
  header?: {
    description?: string;
    cover?: string;
    button?: { text: string; link: string };
  };
}
