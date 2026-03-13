import MinimalistTemplate from '../templates/single-column';
import SidebarEleganceTemplate from '../templates/two-column';
import TimelineProTemplate from '../templates/timeline';
import PremiumSingleColumnResume from '../templates/premium-single-column';
import PremiumTwoColumnTemplate from '../templates/premium-two-column';
import AtsClassicTemplate from '../templates/ats-classic';
import ExecutiveEdgeTemplate from '../templates/executive-edge';
import ImpactGridTemplate from '../templates/impact-grid';
import CompactProTemplate from '../templates/compact-pro';
export const templates = [
  {
    name: "Classic Professional",
    slug: "minimalist", // slug used in dashboard/form
    component: MinimalistTemplate,
    type: "free",
  },
  {
    name: "Executive Sidebar",
    slug: "sidebar-elegance",
    component: SidebarEleganceTemplate,
    type: "premium",
  },
  {
    name: "Career Timeline",
    slug: "timeline",
    component: TimelineProTemplate,
    type: "premium",
  },
  {
    name: "Professional Elite",
    slug: "premium-single-column",
    component: PremiumSingleColumnResume,
    type: "premium",
  },
  {
    name: "Apex One",
    slug: "premium-two-column",
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
