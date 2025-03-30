import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Newspaper as NewspaperIcon } from '@mui/icons-material';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="sticky" color="primary" elevation={0}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <NewspaperIcon sx={{ mr: 1 }} />
            <Typography
              variant={isMobile ? "h6" : "h5"}
              noWrap
              component="div"
              sx={{ 
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              {process.env.REACT_APP_TITLE}
            </Typography>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 