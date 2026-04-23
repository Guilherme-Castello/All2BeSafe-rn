import ArchivedAnswares from "../Screens/ArchivedAnswares";
import CompanyManager from "../Screens/CompanyManager";
import FormCreate from "../Screens/FormCreate";
import FormList from "../Screens/FormList";
import FormViewer from "../Screens/FormViewer";
import Library from "../Screens/Library";
import SectionManager from "../Screens/SectionManager";
import UserManager from "../Screens/UserManager";

export const screens = [
  {
    name: 'Templates',
    title: 'Templates',
    label: 'List',
    component: FormList,
    requiredPermission: 0,
    icon: 'home',
    showInDrawer: true
  },
  {
    name: 'FormViewer',
    title: 'Form Viewer',
    label: 'View',
    component: FormViewer,
    requiredPermission: 0,
    icon: 'home',
    showInDrawer: false
  },
  {
    name: 'FormCreate',
    title: 'Form Create',
    label: 'Create',
    component: FormCreate,
    requiredPermission: 1,
    icon: 'home',
    showInDrawer: false
  },
  {
    name: 'User Manager',
    title: 'Create User',
    label: 'User Manager',
    component: UserManager,
    requiredPermission: 2,
    icon: 'account',
    showInDrawer: true
  },
  {
    name: 'Company Manager',
    title: 'Company Manager',
    label: 'Company Manager',
    component: CompanyManager,
    requiredPermission: 3,
    icon: 'domain',
    showInDrawer: true
  },
  {
    name: 'Section Manager',
    title: 'Section Manager',
    label: 'Section Manager',
    component: SectionManager,
    requiredPermission: 2,
    icon: 'set-center',
    showInDrawer: true
  },
  {
    name: 'Library',
    title: 'Library',
    label: 'Library',
    component: Library,
    requiredPermission: 2,
    icon: 'set-center',
    showInDrawer: false
  },
  {
    name: 'ArchivedAnswares',
    title: 'ArchivedAnswares',
    label: 'ArchivedAnswares',
    component: ArchivedAnswares,
    requiredPermission: 0,
    icon: 'set-center',
    showInDrawer: false
  },
]