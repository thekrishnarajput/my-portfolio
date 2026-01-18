import { Helmet } from 'react-helmet-async';
import { useHomepageConfig } from '../hooks/useHomepageConfig';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
}

const defaultTitle = 'Mukesh Karn (Krishna) - Software Engineer Portfolio';
const defaultDescription = 'Full-stack developer specializing in modern web technologies. Experienced in React, Node.js, TypeScript, and cloud technologies.';
const defaultKeywords = 'software engineer, full-stack developer, portfolio, web development, React, Node.js, TypeScript, JavaScript, MongoDB, Express';
const siteUrl = 'https://mukeshkarn.com';
const defaultImage = `${siteUrl}/logo.png`;
const defaultAuthor = 'Mukesh Karn (Krishna)';

const SEO: React.FC<SEOProps> = ({
  title = defaultTitle,
  description = defaultDescription,
  keywords = defaultKeywords,
  image = defaultImage,
  url = siteUrl,
  type = 'website',
  author = defaultAuthor,
}) => {
  const { config: homepageConfig } = useHomepageConfig();
  const faviconUrl = homepageConfig?.branding?.favicon || '/logo.png';

  const fullTitle = title === defaultTitle ? title : `${title} | ${defaultTitle}`;
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Handle favicon URL (could be base64 or URL)
  const fullFaviconUrl = faviconUrl.startsWith('data:')
    ? faviconUrl
    : faviconUrl.startsWith('http')
      ? faviconUrl
      : `${siteUrl}${faviconUrl}`;

  // Structured Data (JSON-LD) for Person/Portfolio
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Mukesh Karn',
    alternateName: 'Krishna',
    jobTitle: 'Software Engineer',
    description: description,
    url: siteUrl,
    image: fullImage,
    sameAs: [
      'https://github.com/thekrishnarajput',
      'https://www.linkedin.com/in/thekrishnarajput',
    ],
    email: 'hey@mukeshkarn.com',
    knowsAbout: [
      'Web Development',
      'Full-Stack Development',
      'React',
      'Node.js',
      'TypeScript',
      'JavaScript',
      'MongoDB',
      'Express.js',
    ],
  };

  const portfolioStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: defaultTitle,
    url: siteUrl,
    description: description,
    author: {
      '@type': 'Person',
      name: defaultAuthor,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: defaultAuthor,
    url: siteUrl,
    logo: fullImage,
    sameAs: [
      'https://github.com/thekrishnarajput',
      'https://www.linkedin.com/in/thekrishnarajput',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hey@mukeshkarn.com',
      contactType: 'Professional',
    },
  };

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
    ],
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={defaultTitle} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={fullTitle} />
      {/* Uncomment and add your Twitter handle when available */}
      <meta name="twitter:creator" content="@thekrishrajput" />
      <meta name="twitter:site" content="@thekrishrajput" />

      {/* Additional SEO Meta Tags */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="coverage" content="worldwide" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Mukesh Karn (Krishna)" />

      {/* Favicon */}
      <link rel="icon" type="image/png" href={fullFaviconUrl} />
      <link rel="shortcut icon" type="image/png" href={fullFaviconUrl} />
      <link rel="apple-touch-icon" href={fullFaviconUrl} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(portfolioStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationStructuredData)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbStructuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;

