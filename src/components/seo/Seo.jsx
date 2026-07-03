import { Helmet } from 'react-helmet-async'

// Seo concentra title y meta description para no repetir Helmet en cada pagina.
function Seo({ title, description }) {
  // fullTitle agrega la marca del sitio a cada pagina para consistencia en navegador y previews.
  const fullTitle = title ? `${title} | Universo Geek` : 'Universo Geek'
  const ogImageUrl = `${window.location.origin}/images/universo-geek-logo.png`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />
    </Helmet>
  )
}

export default Seo
