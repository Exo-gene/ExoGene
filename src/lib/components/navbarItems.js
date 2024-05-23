import { Policies } from "$lib/Models/Enums/Policies.Enum.Model";

export const items = [
  {
    label: "Home",
    url: "/dashboard/home",
    icon: "<i class='fa fa-home'></i>",
    policies:[],
  },
  {
    label: "Carousel",
    url: "/dashboard/carousel",
    icon: "<i class='fa fa-images'></i>",
    policies:[Policies.READ_CAROUSEL]
  },
  {
    label: "Advertisements",
    url: "/dashboard/advertisements",
    icon: "<i class='fa fa-bullhorn'></i>",
    policies:[Policies.READ_ADVERTISEMENT]
  },
  {
    label: "Categories",
    url: "/dashboard/categories",
    icon: "<i class='fa fa-list'></i>",
    policies:[Policies.READ_CATEGORY]
  },
  {
    label: "Subcategories",
    url: "/dashboard/subcategories",
    icon: "<i class='fa fa-list-alt'></i>",
    policies:[Policies.READ_SUBCATEGORY]
  },
  {
    label: "Tags",
    url: "/dashboard/tags",
    icon: "<i class='fa fa-tags'></i>",
    policies:[Policies.READ_TAG]
  },
  {
    label: "News",
    url: "/dashboard/news",
    icon: "<i class='fa fa-newspaper'></i>",
    policies:[Policies.READ_NEWS]
  },
  {
    label: "Setting",
    url: "/dashboard/setting",
    icon: "<i class='fa fa-users'></i>",
    policies:[Policies.READ_ROLE,Policies.READ_USER]
  },
  {
    label: "Employees",
    url: "/dashboard/employees",
    icon: "<i class='fa fa-users'></i>",
    policies:[Policies.READ_USER]
  }
];
