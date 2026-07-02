import { Helmet } from 'react-helmet-async'

// Seo concentra title y meta description para no repetir Helmet en cada pagina.
function Seo({ title, description }) {
  // fullTitle agrega la marca del sitio a cada pagina para consistencia en navegador y previews.
  const fullTitle = title ? `${title} | Universo Geek` : 'Universo Geek'

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
    </Helmet>
  )
}

export default Seo
