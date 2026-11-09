export interface AboutTimelineEvent {
  label: string;
  from: number;
  to?: number;
  color?: string;
}

export interface AboutTimeline {
  start: number;
  end: number;
  start_label?: string | number;
  end_label?: string | number;
  aria_label?: string;
  track_label?: string;
  events?: AboutTimelineEvent[];
}

interface AboutLink {
  url: string;
  text: string;
  external?: boolean;
  icon?: string;
}

interface AboutCard {
  label?: string;
  title?: string;
}

export interface AboutInterest extends AboutCard {
  variant?: string;
  background?: string;
  color?: string;
  title_lines?: string[];
  mode?: { image: string; name: string; tooltip?: string };
  heroes?: { image: string; name: string }[];
  subtitle?: string;
  right_tip?: string;
  right_text?: string;
  button?: AboutLink;
}

/**
 * Renderer capabilities are independent of the sections in a personal profile.
 * JSON imports widen `type` to string; About.astro validates supported values.
 */
export interface AboutSection extends AboutCard {
  type: string;
  enabled?: boolean;
  links?: AboutLink[];
  tags?: string[];
  projects?: {
    name: string;
    description: string;
    status?: string;
    tags?: string[];
    icon?: string;
    color?: string;
    url?: string;
  }[];
  greeting?: string;
  name_prefix?: string;
  name?: string;
  description?: string;
  pursuit?: {
    label?: string;
    lines?: string[];
    rotating_words?: string[];
    description?: string;
  };
  skills?: AboutCard & {
    items?: {
      name: string;
      icon?: string;
      image?: string;
      color?: string;
    }[];
  };
  career?: AboutCard & {
    summary?: { name: string; color?: string }[];
    timeline?: AboutTimeline;
  };
  personality?: AboutCard & {
    type?: string;
    color?: string;
    image?: string;
    image_alt?: string;
    link?: AboutLink;
  };
  photo?: { image: string; alt?: string; badge?: string };
  motto?: { label?: string; prefix?: string; content?: string };
  expertise?: {
    label?: string;
    prefix?: string;
    specialist?: string;
    content?: string;
    level?: string;
  };
  items?: AboutInterest[];
  statistics?: AboutCard & {
    background?: string;
    metrics?: { label: string; field: string; fallback?: string | number }[];
    button?: AboutLink;
    source?: { url?: string; response_path?: string };
  };
  location?: AboutCard & {
    map_light?: string;
    map_dark?: string;
  };
  profile?: AboutCard & {
    items?: { icon?: string; label: string; value: string }[];
  };
  content?: string;
}

export interface AboutData {
  title?: string;
  sections: AboutSection[];
}
