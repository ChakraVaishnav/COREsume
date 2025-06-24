import MinimalistTemplate from '../templates/single-column';
import SidebarEleganceTemplate from '../templates/two-column';
import TimelineProTemplate from '../templates/timeline';

export const templates = [
  {
    name: "Minimalist",
    slug: "minimalist", // slug used in dashboard/form
    component: MinimalistTemplate,
  },
  {
    name: "Sidebar Elegance",
    slug: "sidebar-elegance",
    component: SidebarEleganceTemplate,
  },
  {
    name: "Timeline Pro",
    slug: "timeline",
    component: TimelineProTemplate,
  },
];
