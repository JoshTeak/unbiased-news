import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Button, CircularProgress, Alert, Container, Chip, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  category: string;
  publishedAt: string;
  content: string;
  unbiasedContent: string;
  imageUrl: string;
}

interface NewsResponse {
  articles: NewsArticle[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const NewsFeed: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const theme = useTheme();

  const categories = [
    'general',
    'politics',
    'business',
    'tech',
    'entertainment',
    'sports',
    'science',
    'health'
  ];

  const lastArticleElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchNews = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await axios.get<NewsResponse>(`${process.env.REACT_APP_API_URL}/news`, {
        params: {
          category: selectedCategory || undefined,
          page: pageNum,
          pageSize: 3
        }
      });
      
      if (pageNum === 1) {
        setArticles(response.data.articles);
      } else {
        setArticles(prev => [...prev, ...response.data.articles]);
      }
      
      setHasMore(pageNum < 3); // We know we have 3 pages total
      setError(null);
    } catch (err) {
      setError('Failed to fetch news articles. Please check if the backend server is running.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page);
  }, [page, selectedCategory]);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setPage(1);
    setArticles([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Unbiased News Feed
        </Typography>
        
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="All"
            onClick={() => handleCategoryChange(null)}
            color={selectedCategory === null ? 'primary' : 'default'}
          />
          {categories.map((category) => (
            <Chip
              key={category}
              label={category.charAt(0).toUpperCase() + category.slice(1)}
              onClick={() => handleCategoryChange(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
            />
          ))}
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {articles.map((article, index) => (
            <Card
              key={`${article.url}-${index}`}
              ref={index === articles.length - 1 ? lastArticleElementRef : null}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                height: { xs: 'auto', sm: 200 },
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              {article.imageUrl && (
                <CardMedia
                  component="img"
                  sx={{
                    width: { xs: '100%', sm: 240 },
                    height: { xs: 200, sm: '100%' },
                    objectFit: 'cover',
                  }}
                  image={article.imageUrl}
                  alt={article.title}
                />
              )}
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {article.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {article.description}
                </Typography>
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {article.source} • {formatDate(article.publishedAt)}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Read More
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default NewsFeed; 