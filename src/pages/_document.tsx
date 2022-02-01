import Document, { Html, Head, Main, NextScript } from 'next/document'
import { getPrismicClient } from '../services/prismic';

export default class MyDocument extends Document {
  render() {
    return (
      <Html>

        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />

          <script async defer src={`//static.cdn.prismic.io/prismic.js?repo=${getPrismicClient}&new=true`} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
