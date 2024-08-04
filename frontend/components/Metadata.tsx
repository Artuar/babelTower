import Head from 'next/head';

interface MetadataProps {
  title: string;
  description: string;
  image: string;
  url: string;
  keywords: string;
}

export const Metadata = ({
  title,
  description,
  image,
  url,
  keywords,
}: MetadataProps) => {
  return (
    <Head>
      <title>{title}</title>
      {/* SEO */}
      <meta name="description" content={description} key="description" />
      <meta name="keywords" content={keywords} key="keywords" />
      {/* Open Graph */}
      <meta property="og:title" content={title} key="og:title" />
      <meta
        property="og:description"
        content={description}
        key="og:description"
      />
      <meta property="og:image" content={image} key="og:image" />
      <meta property="og:url" content={url} key="og:url" />
      <meta property="og:type" content="website" key="og:type" />
      {/* Twitter Cards */}
      <meta name="twitter:card" content={image} key="twitter:card" />
      <meta name="twitter:title" content={title} key="twitter:title" />
      <meta
        name="twitter:description"
        content={description}
        key="twitter:description"
      />
      <meta name="twitter:image" content={image} key="twitter:image" />
    </Head>
  );
};
