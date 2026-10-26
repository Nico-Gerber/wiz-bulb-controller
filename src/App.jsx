import './App.css'
import { Typography, Box, Container, Drawer, Toolbar, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import LightbulbCircleIcon from '@mui/icons-material/LightbulbCircle';

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Bulbs from "./pages/bulbs"

const SIDEBAR_BUTTONS = [
  {
    name: "Bulbs",
    icon: <LightbulbCircleIcon />,
    path: "/bulbs"
  },
];

const drawerWidth = 350;

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Container>
          <Typography sx={{ fontSize: 25, fontWeight: 1000 }}>Wiz Bulb Controler</Typography>
        </Container>
        <Divider />
        <List>
          {SIDEBAR_BUTTONS.map((button) => (
            <ListItem key={button.name} disablePadding>
              <ListItemButton onClick={() => navigate(button.path)}>
                <ListItemIcon>
                  {button.icon}
                </ListItemIcon>
                <ListItemText primary={button.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider />
      </Drawer>

      <Box
        component="main"
        sx={{
          ml: `${drawerWidth}px`,
          p: 3,
        }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/bulbs" replace />} />
          <Route path="/bulbs" element={<Bulbs />} />
        </Routes>
      </Box>
    </ThemeProvider>
  )
}

export default App
