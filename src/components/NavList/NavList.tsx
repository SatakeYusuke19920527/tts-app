import React from 'react';
import { BsRocketTakeoff } from 'react-icons/bs';
import NavItem from './NavItem';

interface NavItemType {
  id: number;
  label: string;
  link: string;
  icon: React.ReactNode;
}

const NavList = () => {
  const navList: NavItemType[] = [
    {
      id: 1,
      label: 'talk to AI',
      link: '/',
      icon: <BsRocketTakeoff className="size-5" />,
    },
    {
      id: 2,
      label: 'Reading aloud',
      link: '/reading-aloud',
      icon: <BsRocketTakeoff className="size-5" />,
    },
  ];
  return (
    <div className="mt-12">
      {navList.map((navItem) => {
        return (
          <NavItem
            label={navItem.label}
            link={navItem.link}
            icon={navItem.icon}
            key={navItem.id}
          />
        );
      })}
    </div>
  );
};

export default NavList;
