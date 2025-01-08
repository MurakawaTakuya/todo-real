"use client";
import AuthForm from "@/Components/Account/AuthForm";
import LoggedInView from "@/Components/Account/LoggedInView";
import { useUser } from "@/utils/UserContext";
import Typography from "@mui/joy/Typography";
import Box from "@mui/material/Box";
import MuiCard from "@mui/material/Card";
import CssBaseline from "@mui/material/CssBaseline";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "0 auto",
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  borderRadius: "20px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
}));

export default function Account() {
  const { user } = useUser();

  return (
    <>
      <CssBaseline enableColorScheme />
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        sx={{ padding: 2 }}
      >
        <Card variant="outlined">
          <Typography level="h1" textAlign="center" fontWeight={700}>
            TODO REAL
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {user ? <LoggedInView /> : <AuthForm />}
          </Box>
        </Card>
      </Stack>
    </>
  );
}
