export interface ICreativeShowcaseData {
  number: string;
  unit: string;
  name: string;
}

export interface IHomepageCreativeShowcase {
  title: string;
  description: string;
  caseUrl: string;
  tags: string[];
  data: ICreativeShowcaseData[];
}

export interface IHomepageCreativeItem {
  title: string;
  description: string;
  keyFrameUrl: string;
  keyFrameSelectUrl: string;
  routePath: string;
  solutionPath: string;
  showcase: IHomepageCreativeShowcase[];
}
export interface IShowCaseItem {
  title: string;
  description: string;
  moreCasePath: string;
  showcase: IHomepageCreativeShowcase[];
}

export interface IHomepageTechnologyVideoTime {
  videoCurrentTime: number;
  reverseVideoCurrentTime: number;
  videoEndTime: number;
}
export interface IHomepageTechnologyItem {
  title: string;
  description: string;
  detail: { title: string; description: string }[];
  routePath: string;
  forward?: IHomepageTechnologyVideoTime;
  reverse?: IHomepageTechnologyVideoTime;
}
