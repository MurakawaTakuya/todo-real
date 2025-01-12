"use client";
import { useUser } from "@/utils/UserContext";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import GroupIcon from "@mui/icons-material/Group";
import HomeIcon from "@mui/icons-material/Home";
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
    ["/discover", "/discover/"],
    ["/account", "/account/"],
    ["/"],
  ];
  const pathname = window.location.pathname;
  const defaultIndex = paths[0].some((path) => path === pathname)
    ? 0
    : paths[1].some((path) => path === pathname)
    ? 1
    : paths[2].some((path) => path === pathname)
    ? 2
    : 3;
  const [index, setIndex] = useState(defaultIndex);

  useEffect(() => {
    if (document.readyState === "complete") {
      if (!paths[index].some((path) => path === pathname)) {
        // パスが存在しない場合はリダイレクト
        redirect(paths[index][0]);
      }
    }
  }, [index]);

  const colors = ["success", "primary", "warning", "danger"] as const;

  const { user } = useUser();

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
          borderRadius: 15,
          maxWidth: "93%",
          mx: "auto",
          boxShadow: theme.shadow.sm,
          [`& .${tabClasses.root}`]: {
            py: 1,
            flex: 1,
            transition: "0.3s",
            fontWeight: "md",
            // TODO: スマホの時に文字が改行されてる
            fontSize: "sm",
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
          sx={{ borderRadius: "lg", p: 0, gap: "3px" }}
        >
          <Tab
            disableIndicator
            orientation="vertical"
            sx={{
              padding: "5px 0 !important",
              transition: "0.5s",
              ...(index === 0 && {
                backgroundColor: "#e1ffe0 !important",
                color: "#008954 !important",
              }),
              ...(!user && {
                pointerEvents: "none",
                opacity: "0.3 !important",
              }),
            }}
          >
            <ListItemDecorator>
              <FormatListBulletedIcon />
            </ListItemDecorator>
            <span style={{ fontWeight: 600 }}>自分の目標</span>
          </Tab>
          <Tab
            disableIndicator
            orientation="vertical"
            sx={{
              padding: "5px 0 !important",
              transition: "0.5s",
              ...(index === 1 && {
                backgroundColor: "#ffecee !important",
                color: "#bf1818 !important",
              }),
              ...(!user && {
                pointerEvents: "none",
                opacity: "0.3 !important",
              }),
            }}
          >
            <ListItemDecorator>
              <GroupIcon />
            </ListItemDecorator>
            <span style={{ fontWeight: 600 }}>みんなの投稿</span>
          </Tab>
          <Tab
            disableIndicator
            orientation="vertical"
            sx={{
              padding: "5px 0 !important",
              ...(index === 2 && {
                backgroundColor: "#fff0df !important",
                color: "#c16401 !important",
              }),
            }}
          >
            <ListItemDecorator>
              <Person />
            </ListItemDecorator>
            <span style={{ fontWeight: 600 }}>アカウント</span>
          </Tab>
          <Tab
            disableIndicator
            orientation="vertical"
            sx={{
              padding: "5px 0 !important",
              ...(index === 3 && {
                backgroundColor: "#e3f2fd !important",
                color: "#0b6bcb !important",
              }),
            }}
          >
            <ListItemDecorator>
              <HomeIcon />
            </ListItemDecorator>
            <span style={{ fontWeight: 600 }}>トップ</span>
          </Tab>
        </TabList>
      </Tabs>
    </Box>
  );
}
