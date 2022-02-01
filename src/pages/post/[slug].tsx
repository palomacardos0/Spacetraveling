import { useRouter } from 'next/router'
import Head from "next/head"
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';

import Prismic from "@prismicio/client";
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';


import Header from '../../components/Header';
import Comments from '../../components/Comments';

import { BiUser, BiTimeFive } from 'react-icons/bi';
import { MdDateRange } from 'react-icons/md';

import { ParsedUrlQuery } from "querystring";
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';


import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Params extends ParsedUrlQuery {
  uid: string;
}

interface Post {
  uid: string
  last_publication_date: string | null;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface Navigation {
  data: {
    title: string | null;
  }
  uid: string | null;
}

interface NavigationProps {
  next: null | Navigation
  previous: null | Navigation
}

interface PostProps {
  preview: boolean;
  navigation: NavigationProps;

  post: Post;
}

export default function Post({ post, navigation, preview }: PostProps) {

  const router = useRouter()

  if (router.isFallback) {
    return <div className={styles.fallback}>Carregando...</div>
  }

  let next: Navigation = {
    data: {
      title: null,
    },
    uid: null,
  }
  let previous: Navigation = {
    data: {
      title: null,
    },
    uid: null,
  }

  if (navigation.next !== null) {
    next = navigation.next
  }

  if (navigation.previous !== null) {
    previous = navigation.previous
  }

  const content = post.data.content.map(ctt => {
    return ({
      heading: ctt.heading,
      body: (RichText.asHtml(ctt.body))
    })
  })


  const wordsCounter = (content.map(post => {

    return String(post.body).split(' ').length + String(post.heading).split(' ').length

  })).reduce((acumulator, element) => acumulator += element)

  const readingTime = Math.ceil(wordsCounter / 200)



  return (
    <>
      <Head>
        <title>{post.data.title} | Ignews</title>
      </Head>
      <Header />
      <article className={styles.body}>
        <img src={post.data.banner.url} alt="" />
        <div className={`${commonStyles.container} ${styles.post}`}>

          <h1>{post.data.title}</h1>


          <div className={styles.info}>
            <div>
              <MdDateRange />
              <time>
                {format(
                  new Date(post.first_publication_date),
                  "PP",
                  {
                    locale: ptBR,
                  }
                )}
              </time>
            </div>
            <div>
              <BiUser />
              <span>{post.data.author}</span>
            </div>
            <div>
              <BiTimeFive />
              <time>{readingTime} min</time>
            </div>
          </div>
          <div className={styles.info}>
            <span>*editado em {format(
              new Date(post.last_publication_date),
              "PP, HH:mm",
              {
                locale: ptBR,
              }
            )}
            </span>
          </div>

          {content.map(texto => (
            <main key={texto.heading}>
              <h2>{texto.heading}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: String(texto.body) }} />
            </main>


          )
          )}
        </div>

      </article>
      <footer className={`${commonStyles.container} ${styles.footer}`}>

        <div className={styles.navigation}>
          {
            navigation.previous === null ? (<a></a>) : (
              <Link href={`/post/${previous.uid}`}>
                <a style={{ textAlign: 'left' }}>
                  {previous.data.title} <br />
                  <strong>Post anterior</strong>
                </a>
              </Link>
            )
          }

          {
            navigation.next === null ? ((<a></a>)) : (
              <Link href={`/post/${next.uid}`}>
                <a style={{ textAlign: 'right' }}>
                  {next.data.title} <br />
                  <strong>Próximo post</strong>
                </a>
              </Link>
            )
          }
        </div>

        <Comments />
        {preview && (
          <aside >
            <Link href="/api/exit-preview">
              <a className={commonStyles.exitPreview}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </footer>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {

  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ],
    {
      pageSize: 1,

    });

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  }

};


export const getStaticProps: GetStaticProps = async ({ params, preview = false, previewData }) => {
  const { slug } = params as Params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), { ref: previewData?.ref ?? null });

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(ctt => {
        return ({
          heading: ctt.heading,
          body: (ctt.body)

        })
      }),
    },

  };

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[document.first_publication_date]',
      after: response.id,
    }
  );

  const previousPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[document.first_publication_date desc]',
      after: response.id,
    }
  );

  return {
    props: {
      preview,
      navigation: {
        next: nextPost.results[0] ?? null,
        previous: previousPost.results[0] ?? null
      },
      post,
    },
    revalidate: 60 * 30 //30 min
  }

};

