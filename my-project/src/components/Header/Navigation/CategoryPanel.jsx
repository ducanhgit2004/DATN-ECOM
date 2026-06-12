import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { IoCloseSharp } from "react-icons/io5";
import { FaRegSquarePlus } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import "../Navigation/style.css";
import { FiMinusSquare } from "react-icons/fi";
import CategoryCollapse from '../../CategoryCollapse';




const CategoryPanel = (props) => {

    const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" className="categoryPanel" >

      <h3 className="p-3 text-[16 px] font-[550] flex items-center justify-between">
        Shop By Categories<IoCloseSharp onClick={props.closeCategoryPanel} className="cursor-pointer text-[20px]" /></h3>


     <CategoryCollapse/>

    </Box>
  );

  return (
    <>
      <Drawer open={props.isOpenCatPanel} onClose={props.closeCategoryPanel}>
        {DrawerList}
      </Drawer>
    </>
  )
}

export default CategoryPanel;
