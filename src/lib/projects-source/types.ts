export type ProjectSourceResource = {
  label: string;
  url?: string;
  kind?: string;
  text?: string;
};

export type ProjectSourceScreenshot = {
  image: string;
};

export type ProjectSourceAsset = {
  label?: string;
  image: string;
};

export type ProjectSourceUrls = {
  official?: string;
  web?: string;
  ios?: string;
  android?: string;
  mp?: string;
};

export type ProjectSourceFamily = {
  key: string;
  title: string;
  description?: string;
  sortOrder?: number;
  variantLabel?: string;
  variantOrder?: number;
};

export type ProjectSource = {
  sortOrder?: number;
  slug: string;
  name: string;
  route?: string;
  repo?: string;
  logo?: string;
  overview?: string;
  description?: string;
  tags: string[];
  urls?: ProjectSourceUrls;
  companyName?: string;
  startDate?: string;
  endDate?: string | null;
  ongoing?: boolean;
  ageRating?: string;
  category?: string;
  industry?: string;
  family?: ProjectSourceFamily;
  categories?: string[];
  platforms?: string[];
  langs?: string[];
  price?: string | number;
  headline?: string;
  introduction?: string[];
  summary?: string[];
  techStack?: string[];
  resources?: ProjectSourceResource[];
  screenshots?: ProjectSourceScreenshot[];
  assets?: ProjectSourceAsset[];
};
