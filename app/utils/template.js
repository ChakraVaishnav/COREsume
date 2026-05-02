import MinimalistTemplate from '../templates/classic-professional';
import SidebarEleganceTemplate from '../templates/executive-sidebar';
import TimelineProTemplate from '../templates/career-timeline';
import PremiumSingleColumnResume from '../templates/professional-elite';
import PremiumTwoColumnTemplate from '../templates/apex-one';
import AtsClassicTemplate from '../templates/ats-classic';
import ExecutiveEdgeTemplate from '../templates/executive-edge';
import ImpactGridTemplate from '../templates/impact-grid';
import CompactProTemplate from '../templates/compact-pro';

export const templates = [
  {
    name: "Classic Professional",
    slug: "classic-professional", // slug used in dashboard/form
    component: MinimalistTemplate,
    type: "free",
  },
  {
    name: "Executive Sidebar",
    slug: "executive-sidebar",
    component: SidebarEleganceTemplate,
    type: "premium",
  },
  {
    name: "Career Timeline",
    slug: "career-timeline",
    component: TimelineProTemplate,
    type: "premium",
  },
  {
    name: "Professional Elite",
    slug: "professional-elite",
    component: PremiumSingleColumnResume,
    type: "premium",
  },
  {
    name: "Apex One",
    slug: "apex-one",
    component: PremiumTwoColumnTemplate,
    type: "premium",
  },
  {
    name: "ATS Classic",
    slug: "ats-classic",
    component: AtsClassicTemplate,
    type: "premium",
  },
  {
    name: "Executive Edge",
    slug: "executive-edge",
    component: ExecutiveEdgeTemplate,
    type: "premium",
  },
  {
    name: "Impact Grid",
    slug: "impact-grid",
    component: ImpactGridTemplate,
    type: "premium",
  },
  {
    name: "Compact Pro",
    slug: "compact-pro",
    component: CompactProTemplate,
    type: "premium",
  }
];
