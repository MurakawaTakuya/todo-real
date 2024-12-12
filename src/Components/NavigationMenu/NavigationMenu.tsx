"use client";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import Person from "@mui/icons-material/Person";
import Box from "@mui/joy/Box";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Tab, { tabClasses } from "@mui/joy/Tab";
import TabList from "@mui/joy/TabList";
import Tabs from "@mui/joy/Tabs";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavigationMenu() {
  const paths = [
    ["/mycontent", "/mycontent/"],
    ["/"],
    ["/account", "/account/"],
  ];
  const pathname = window.location.pathname;
  const defaultIndex = paths[0].some((path) => path === pathname)
    ? 0
    : paths[1].some((path) => path === pathname)
    ? 1
    : 2;
  const [index, setIndex] = useState(defaultIndex);
  const colors = ["success", "primary", "warning"] as const;

  useEffect(() => {
    if (document.readyState === "complete") {
      if (!paths[index].some((path) => path === pathname)) {
        redirect(paths[index][0]);
      }
    }
  }, [index]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
        bgcolor: `${"var(--colors-index)"}.500`,
        position: "fixed",
        bottom: "8px",
        width: "100%",
        maxWidth: "600px",
        zIndex: 100,
      }}
      style={{ "--colors-index": colors[index] } as React.CSSProperties}
    >
      <Tabs
        size="lg"
        aria-label="Bottom Navigation"
        value={index}
        onChange={(event, value) => setIndex(value as number)}
        sx={(theme) => ({
          p: 1,
          borderRadius: 13,
          maxWidth: "93%",
          mx: "auto",
          boxShadow: theme.shadow.sm,
          "--joy-shadowChannel": theme.vars.palette[colors[index]].darkChannel,
          [`& .${tabClasses.root}`]: {
            py: 1,
            flex: 1,
            transition: "0.3s",
            fontWeight: "md",
            fontSize: "md",
            [`&:not(.${tabClasses.selected}):not(:hover)`]: {
              opacity: 0.7,
            },
          },
        })}
      >
        <TabList
          variant="plain"
          size="sm"
          disableUnderline
          sx={{ borderRadius: "lg", p: 0 }}
        >
          <Tab
            disableIndicator
            orientation="vertical"
            sx={{ margin: "0 3px", padding: "8px 0 !important" }}
            {...(index === 0 && { color: colors[0] })}
          >
            <ListItemDecorator>
              <FormatListBulletedIcon />
            </ListItemDecorator>
            My contents
          </Tab>
          <Tab
            disableIndicator
            orientation="vertical"
            sx={{ margin: "0 3px", padding: "8px 0 !important" }}
            {...(index === 1 && { color: colors[1] })}
          >
            <ListItemDecorator>
              <HomeRoundedIcon />
            </ListItemDecorator>
            Home
          </Tab>
          <Tab
            disableIndicator
            orientation="vertical"
            sx={{ margin: "0 3px", padding: "8px 0 !important" }}
            {...(index === 2 && { color: colors[2] })}
          >
            <ListItemDecorator>
              <Person />
            </ListItemDecorator>
            Profile
          </Tab>
        </TabList>
      </Tabs>
    </Box>
  );
}
