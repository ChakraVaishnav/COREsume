import MinimalistTemplate from '../templates/single-column';
import SidebarEleganceTemplate from '../templates/two-column';
import TimelineProTemplate from '../templates/timeline';
import PremiumSingleColumnResume from '../templates/premium-single-column';
import PremiumTwoColumnTemplate from '../templates/premium-two-column';
import { type } from 'os';
export const templates = [
  {
    name: "Minimalist",
    slug: "minimalist", // slug used in dashboard/form
    component: MinimalistTemplate,
    type: "free",
  },
  {
    name: "Sidebar Elegance",
    slug: "sidebar-elegance",
    component: SidebarEleganceTemplate,
    type: "premium",
  },
  {
    name: "Timeline Pro",
    slug: "timeline",
    component: TimelineProTemplate,
    type: "premium",
  },
  {
    name: "Professional Pro Template",
    slug: "premium-single-column",
    component: PremiumSingleColumnResume,
    type: "premium",
  },
  {
    name: "Premium Professional",
    slug: "premium-two-column",
    component: PremiumTwoColumnTemplate,
    type: "premium",
  }
];
